package online.projektassistent.server.util;

import online.projektassistent.server.model.*;
import org.apache.commons.io.FilenameUtils;
import org.apache.logging.log4j.util.Strings;
import org.apache.poi.ooxml.POIXMLDocumentPart;
import org.apache.poi.ooxml.POIXMLRelation;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.openxml4j.opc.PackagePartName;
import org.apache.poi.openxml4j.opc.PackagingURIHelper;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.xmlbeans.XmlCursor;
import org.openxmlformats.schemas.officeDocument.x2006.sharedTypes.STOnOff;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTP;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSimpleField;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.namespace.QName;
import java.io.*;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ProductBuilder implements Placeholders {

    public static final String PROJECT_TEMPLATE = "project_template.docx";
    public static final String STYLE_HEADER = "berschrift1";
    public static final String STYLE_BODY = "Textkrper";
    public static final String COLOR_CHAPTERS = "0000CD";
    public static final String INSERT_TEXT = "[Hier Ihren Text einfügen...]";

    private final Logger logger = LoggerFactory.getLogger(ProductBuilder.class);

    /**
     * Creates a single product and returns a byte array in docx format
     *
     * @param singleProduct container for all parameters
     * @return bytes in docx format
     */
    public byte[] createSingleProduct(SingleProduct singleProduct) {
        Map<String, String> dataParams = new HashMap<>();
        dataParams.put(PRODUCT_NAME, singleProduct.getProductName());
        dataParams.put(PROJECT_NAME, singleProduct.getProjectName());
        dataParams.put(RESPONSIBLE, singleProduct.getResponsible());
        dataParams.put(PARTICIPANTS, String.join("; ", singleProduct.getParticipants()));
        dataParams.put(DATE, SimpleDateFormat.getDateTimeInstance(SimpleDateFormat.SHORT, SimpleDateFormat.LONG, Locale.GERMANY).format(new Date()));

        List<Chapter> chapters = singleProduct.getChapters();

        try (XWPFDocument doc = new XWPFDocument(OPCPackage.open(Objects.requireNonNull(getClass().getResourceAsStream("/" + PROJECT_TEMPLATE))));
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            replacePlaceholdersInDocument(dataParams, doc);
            createChapters(doc, chapters);
            createTableOfContents(doc);

            doc.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Creates multiple products for one project and zips them in a temporary zip file
     *
     * @param multiProducts container for all parameters
     * @return path to zip file
     */
    public Path createMultipleProducts(MultiProducts multiProducts) throws IOException {
        Map<String, String> dataParams = new HashMap<>();
        dataParams.put(PROJECT_NAME, multiProducts.getProjectName());
        dataParams.put(DATE, SimpleDateFormat.getDateTimeInstance(SimpleDateFormat.SHORT, SimpleDateFormat.LONG, Locale.GERMANY).format(new Date()));

        Map<String, Path> productTempFiles = createProductTempFiles(multiProducts.getProducts(), dataParams);
        String zipFilenameNoExt = FileUtil.sanitizeFilename(multiProducts.getProjectName()) + "_products";
        Path zipFile = createZipFile(zipFilenameNoExt, productTempFiles);
        deleteIfExists(productTempFiles);
        return zipFile;
    }

    /**
     * Creates multiple docx files in temp directory
     *
     * @param products   list of product parameters
     * @param dataParams map with project parameters
     * @return map of filename and path to temp file
     * @throws IOException something went wrong
     */
    private Map<String, Path> createProductTempFiles(List<ProductOfProject> products, Map<String, String> dataParams) throws IOException {
        Map<String, Path> productsMap = new HashMap<>();
        for (ProductOfProject product : products) {
            dataParams.put(PRODUCT_NAME, product.getProductName());
            dataParams.put(RESPONSIBLE, product.getResponsible());
            dataParams.put(PARTICIPANTS, String.join("; ", product.getParticipants()));
            List<Chapter> chapters = product.getChapters();
            List<ExternalCopyTemplate> externalCopyTemplates = product.getExternalCopyTemplates();

            if (!externalCopyTemplates.isEmpty()) {
                for (ExternalCopyTemplate externalCopyTemplate : externalCopyTemplates) {
                    Path downloadedFile = download(externalCopyTemplate.getUri());

                    String sanitizedDirectory = product.getDisciplineName();
                    String sanitizedFilename = FileUtil.sanitizeFilename(FilenameUtils.getName(externalCopyTemplate.getUri()));
                    String filename = sanitizedDirectory != null ? sanitizedDirectory + "/" + sanitizedFilename : sanitizedFilename;

                    productsMap.put(filename, downloadedFile);
                }
            }

            try (XWPFDocument template = new XWPFDocument(OPCPackage.open(Objects.requireNonNull(getClass().getResourceAsStream("/" + PROJECT_TEMPLATE))))) {
                replacePlaceholdersInDocument(dataParams, template);
                createChapters(template, chapters);
                createTableOfContents(template);

                Path tempFile = Files.createTempFile(FileUtil.sanitizeFilename(product.getProductName()), ".docx");
                try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                    template.write(out);
                    Files.write(tempFile, out.toByteArray());
                }

                String sanitizedDirectory = product.getDisciplineName();
                String sanitizedFilename = FileUtil.sanitizeFilename(product.getProductName());

                String filename = sanitizedDirectory != null ? sanitizedDirectory + "/" + sanitizedFilename : sanitizedFilename;

                productsMap.put(filename + ".docx", tempFile);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return productsMap;
    }

    private static Path download(String sourceURL) throws IOException
    {
        URL url = new URL(sourceURL);

        String basename = FilenameUtils.getBaseName(sourceURL);
        String extension = FilenameUtils.getExtension(sourceURL);

        Path tempFile = Files.createTempFile(basename, "." + extension);

        Files.copy(url.openStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);

        return tempFile;
    }

    /**
     * Replaces docx placeholders with given data parameters in every paragraph and all tables
     *
     * @param dataParams given data to be replaced with template placeholders
     * @param document   docx template document
     **/
    private void replacePlaceholdersInDocument(Map<String, String> dataParams, XWPFDocument document) {
        replacePlaceholdersInParagraphs(dataParams, document.getParagraphs());
        replacePlaceholderInTables(dataParams, document);
    }

    /**
     * Replaces docx placeholders with given data parameters in all tables
     *
     * @param dataParams given data to be replaced with template placeholders
     * @param document   docx template document
     **/
    private void replacePlaceholderInTables(Map<String, String> dataParams, XWPFDocument document) {

        document.getTables().stream()
                .flatMap(table -> table.getRows().stream())
                .flatMap(row -> row.getTableCells().stream())
                .forEach(cell -> replacePlaceholdersInParagraphs(dataParams, cell.getParagraphs()));
    }

    /**
     * Replaces docx placeholders with given data parameters in list of paragraphs
     *
     * @param dataParams given data to be replaced with template placeholders
     * @param paragraphs list of paragraphs
     **/
    private void replacePlaceholdersInParagraphs(Map<String, String> dataParams, List<XWPFParagraph> paragraphs) {
        paragraphs.stream().flatMap(paragraph -> paragraph.getRuns().stream())
                .forEach(run -> {
                    final String text = run.text();

                    dataParams.entrySet().stream()
                            .filter(entry -> textContainsPlaceholder(text, entry))
                            .forEach(entry -> replaceText(run, text, entry));
                });
    }

    /**
     * Writes multiple chapters at the position of a placeholder
     *
     * @param document docx template document
     * @param chapters list of chapters to create
     */
    private void createChapters(XWPFDocument document, List<Chapter> chapters) throws Exception {
        Optional<XWPFRun> firstChapter = document.getParagraphs().stream().flatMap(paragraph -> paragraph.getRuns().stream())
                .filter(run -> FIRST_CHAPTER.equals(run.text()))
                .findFirst();

        if (firstChapter.isPresent()) {
            XWPFParagraph para = (XWPFParagraph) firstChapter.get().getParent();
            XmlCursor cur = para.getCTP().newCursor();
            cur.toNextSibling();

            document.removeBodyElement(document.getPosOfParagraph(para));

            XWPFDocument doc = para.getDocument();
            int idx = 0;
            for (Chapter chapter : chapters) {
                createChapter(cur, doc, chapter, idx++);
                setCursorToNextStartToken(cur);
            }
        }
    }

    /**
     * Creates a single chapter at the position of the cursor
     *
     * @param cur      cursor pointing to position in document
     * @param document docx template document
     * @param chapter  chapter
     */
    private void createChapter(XmlCursor cur, XWPFDocument document, Chapter chapter, Integer index) throws Exception {
        String title = chapter.getTitle();
        String content = chapter.getText();
        String samplesText = chapter.getSamplesText();

        XWPFParagraph para = document.insertNewParagraph(cur);
        para.setStyle(STYLE_HEADER);
        XWPFRun run = para.createRun();
        run.setText(title);
        run.setStyle(STYLE_HEADER);

        // Chapter text

        cur.toNextToken();
        XWPFParagraph paraContent = document.insertNewParagraph(cur);

        HtmlXWPFDocument contentHtmlXWPFDocument = createHtmlDoc(document, "contentHtmlDoc" + index);
        contentHtmlXWPFDocument.setHtml(contentHtmlXWPFDocument.getHtml().replace("<body></body>", content));

        XmlCursor contentCursor = paraContent.getCTP().newCursor();
        insertAltChunk(contentHtmlXWPFDocument, contentCursor);

        // Samples text

        cur.toNextToken();
        XWPFParagraph paraSamples = document.insertNewParagraph(cur);

        HtmlXWPFDocument samplesHtmlXWPFDocument = createHtmlDoc(document, "samplesHtmlDoc" + index);
        samplesHtmlXWPFDocument.setHtml(samplesHtmlXWPFDocument.getHtml().replace("<body></body>", samplesText));

        XmlCursor samplesCursor = paraSamples.getCTP().newCursor();
        insertAltChunk(samplesHtmlXWPFDocument, samplesCursor);

        cur.toNextToken();

        para = document.insertNewParagraph(cur);
        para.setAlignment(ParagraphAlignment.BOTH);
        run = para.createRun();
        run.setText(INSERT_TEXT);
    }

    private XmlCursor setCursorToNextStartToken(XmlCursor cursor) {
        cursor.toEndToken(); // set cursor to end of the XmlObject
        // there always must be a next start token
        while (cursor.hasNextToken() && cursor.toNextToken() != org.apache.xmlbeans.XmlCursor.TokenType.START);
        // cursor is now at the next start token and new things can be inserted here
        return cursor;
    }

    /**
     * Creates a table of contents which will be updated by words on first opening of the document
     *
     * @param document docx template document
     */
    private void createTableOfContents(XWPFDocument document) {
        Optional<XWPFRun> tocRun = document.getParagraphs().stream().flatMap(paragraph -> paragraph.getRuns().stream())
                .filter(run -> TOC.equals(run.text()))
                .findFirst();

        if (tocRun.isPresent()) {
            XWPFParagraph paragraph = (XWPFParagraph) tocRun.get().getParent();
            paragraph.removeRun(0);
            CTP ctP = paragraph.getCTP();
            CTSimpleField toc = ctP.addNewFldSimple();
            toc.setInstr("TOC \\h");
            toc.setDirty(STOnOff.Factory.newValue(true));
        }
    }

    /**
     * Create zip file in temp directory containing all zipEntries
     *
     * @param zipFilename filename without extension
     * @param zipEntries  map of filenames and paths to files to include in zip
     * @return zip
     * @throws IOException something went wrong
     */
    private Path createZipFile(String zipFilename, Map<String, Path> zipEntries) throws IOException {
        Path zipFile = Files.createTempFile(zipFilename, ".zip");
        OutputStream fos = Files.newOutputStream(zipFile);
        ZipOutputStream zipOut = new ZipOutputStream(fos);

        for (Map.Entry<String, Path> entry : zipEntries.entrySet()) {
            ZipEntry zipEntry = new ZipEntry(entry.getKey());
            zipOut.putNextEntry(zipEntry);
            zipOut.write(Files.readAllBytes(entry.getValue()));
        }

        zipOut.close();
        fos.close();
        return zipFile;
    }

    private void deleteIfExists(Map<String, Path> productPaths) {
        productPaths.values().forEach(path -> {
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                // ignore
                logger.warn("Could not delete {}", path);
            }
        });
    }

    private boolean textContainsPlaceholder(String text, Map.Entry<String, String> entry) {
        return Strings.isNotBlank(text)
                && text.contains(entry.getKey())
                && entry.getValue() != null;
    }

    private void replaceText(XWPFRun run, String text, Map.Entry<String, String> entry) {
        text = text.replace(entry.getKey(), entry.getValue());
        run.setText(text, 0);
    }

    private static HtmlXWPFDocument createHtmlDoc(XWPFDocument document, String id) throws Exception {
        OPCPackage oPCPackage = document.getPackage();
        PackagePartName partName = PackagingURIHelper.createPartName("/word/" + id + ".html");
        PackagePart part = oPCPackage.createPart(partName, "text/html");
        HtmlXWPFDocument htmlXWPFDocument = new HtmlXWPFDocument(part, id);
        document.addRelation(htmlXWPFDocument.getId(), new XWPFHtmlRelation(), htmlXWPFDocument);
        return htmlXWPFDocument;
    }

    private static void insertAltChunk(HtmlXWPFDocument htmlXWPFDocument, XmlCursor cursor) {
        QName altChunk = new QName("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "altChunk");
        QName id = new QName("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id");
        cursor.beginElement(altChunk);
        cursor.insertAttributeWithValue(id, htmlXWPFDocument.getId());
    }

    private static class HtmlXWPFDocument extends POIXMLDocumentPart {

        private final String id;
        private String html;

        private HtmlXWPFDocument(PackagePart part, String id) {
            super(part);
            this.id = id;
            this.html = "<!DOCTYPE html><html><head><meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"><style></style></head><body></body>";
        }

        private String getId() {
            return id;
        }

        private String getHtml() {
            return html;
        }

        private void setHtml(String html) {
            this.html = html;
        }

        @Override
        protected void commit() throws IOException {
            PackagePart part = getPackagePart();
            OutputStream out = part.getOutputStream();
            Writer writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
            writer.write(html);
            writer.close();
            out.close();
        }
    }

    private final static class XWPFHtmlRelation extends POIXMLRelation {
        private XWPFHtmlRelation() {
            super("text/html",
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/aFChunk",
                    "/word/htmlDoc#.html");
        }
    }
}
