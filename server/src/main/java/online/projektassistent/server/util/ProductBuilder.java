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
import org.apache.poi.xwpf.usermodel.*;
import org.apache.xmlbeans.XmlCursor;
import org.apache.xmlbeans.XmlException;
import org.openxmlformats.schemas.officeDocument.x2006.sharedTypes.STOnOff;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import javax.xml.namespace.QName;
import java.io.*;
import java.math.BigInteger;
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

    public static String PROJECT_TEMPLATE = "project_template.docx";
    public static final String PROJECT_TEMPLATE_XT = "project_template_xt.docx";
    public static final String PROJECT_TEMPLATE_XT_BUND = "project_template_xt_bund.docx";
    public static final String STYLE_HEADER = "berschrift1";
    public static final String STYLE_BODY = "Textkrper";
    public static final String COLOR_CHAPTERS = "0000CD";
    public static final String INSERT_TEXT = "[Hier Ihren Text einfügen...]";

    public static String cTStyleTOC1 ="<w:style xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" w:type=\"paragraph\" w:styleId=\"TOC1\">"
            + "<w:name w:val=\"toc 1\"/>"
            + "<w:basedOn w:val=\"Normal\"/>"
            + "<w:next w:val=\"Normal\"/>"
            + "<w:autoRedefine/><w:unhideWhenUsed/>"
            + "<w:rPr><w:rFonts w:ascii=\"Arial Narrow\" w:cs=\"Arial Narrow\" /><w:b/><w:bCs/><w:caps/><w:sz w:val=\"20\"/><w:szCs w:val=\"20\"/></w:rPr>"
            + "</w:style>";

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
        dataParams.put(MODEL_VARIANT, singleProduct.getModelVariant());
        dataParams.put(VERSION, singleProduct.getVersion());
        dataParams.put(DATE, SimpleDateFormat.getDateTimeInstance(SimpleDateFormat.SHORT, SimpleDateFormat.LONG, Locale.GERMANY).format(new Date()));

        List<Chapter> chapters = singleProduct.getChapters();

        String projectTemplateFilename = getProjectTemplateFilename(dataParams.get(MODEL_VARIANT));

        try (XWPFDocument doc = new XWPFDocument(OPCPackage.open(Objects.requireNonNull(getClass().getResourceAsStream("/" + projectTemplateFilename))));
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

    private static String getProjectTemplateFilename(String modelVariant) {
        return switch (modelVariant) {
            case "V-Modell XT" -> PROJECT_TEMPLATE_XT;
            case "V-Modell XT Bund" -> PROJECT_TEMPLATE_XT_BUND;
            default -> PROJECT_TEMPLATE;
        };
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
        dataParams.put(MODEL_VARIANT, multiProducts.getModelVariant());
        dataParams.put(VERSION, multiProducts.getVersion());
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

            String projectTemplateFilename = getProjectTemplateFilename(dataParams.get(MODEL_VARIANT));

            if (!externalCopyTemplates.isEmpty()) {
                for (ExternalCopyTemplate externalCopyTemplate : externalCopyTemplates) {
                    try {
                        Path downloadedFile = download(externalCopyTemplate.getUri());

                        String sanitizedDirectory = product.getDisciplineName();
                        String sanitizedFilename = FileUtil.sanitizeFilename(FilenameUtils.getName(externalCopyTemplate.getUri()));
                        String filename = sanitizedDirectory != null ? sanitizedDirectory + "/" + sanitizedFilename : sanitizedFilename;

                        if (downloadedFile != null) {
                            productsMap.put(filename, downloadedFile);
                        }
                    } catch (IOException e) {
                        // Ignore ...
                    }
                }
            }

            if (!chapters.isEmpty()) {
                try (XWPFDocument template = new XWPFDocument(OPCPackage.open(Objects.requireNonNull(getClass().getResourceAsStream("/" + projectTemplateFilename))))) {
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
        }
        return productsMap;
    }

    private static Path download(String sourceURL) throws IOException
    {
        sourceURL = StringUtils.replace(sourceURL, "http://", "https://");

        URL url = new URL(sourceURL);

        String basename = FilenameUtils.getBaseName(sourceURL);
        Optional<String> extension = ProductBuilder.getFileExtension(url);

        if (extension.isPresent()) {
            Path tempFile = Files.createTempFile(basename, "." + extension.get());
            Files.copy(url.openStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);

            return tempFile;
        }
        return null;

    }

    public static Optional<String> getFileExtension(final URL url) {
        Objects.requireNonNull(url, "url is null");

        final String file = url.getFile();

        if (file.contains(".")) {
            final String sub = file.substring(file.lastIndexOf('.') + 1);

            if (sub.isEmpty()) {
                return Optional.empty();
            }

            if (sub.contains("?")) {
                return Optional.of(sub.substring(0, sub.indexOf('?')));
            }
            return Optional.of(sub);
        }
        return Optional.empty();
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
        paragraphs.forEach(paragraph -> replaceTextInParagraph(dataParams, paragraph));
    }

    private void replaceTextInParagraph(Map<String, String> dataParams, XWPFParagraph paragraph) {
        dataParams.forEach((key, value) -> replaceTextSegment(paragraph, key, value));
    }

    // https://stackoverflow.com/questions/65275097/apache-poi-my-placeholder-is-treated-as-three-different-runs/65289246#65289246
    static public void replaceTextSegment(XWPFParagraph paragraph, String textToFind, String replacement) {
        TextSegment foundTextSegment = null;
        PositionInParagraph startPos = new PositionInParagraph(0, 0, 0);
        while((foundTextSegment = paragraph.searchText(textToFind, startPos)) != null) { // search all text segments having text to find

            // maybe there is text before textToFind in begin run
            XWPFRun beginRun = paragraph.getRuns().get(foundTextSegment.getBeginRun());
            String textInBeginRun = beginRun.getText(foundTextSegment.getBeginText());
            String textBefore = textInBeginRun.substring(0, foundTextSegment.getBeginChar()); // we only need the text before

            // maybe there is text after textToFind in end run
            XWPFRun endRun = paragraph.getRuns().get(foundTextSegment.getEndRun());
            String textInEndRun = endRun.getText(foundTextSegment.getEndText());
            String textAfter = textInEndRun.substring(foundTextSegment.getEndChar() + 1); // we only need the text after

            if (foundTextSegment.getEndRun() == foundTextSegment.getBeginRun()) {
                textInBeginRun = textBefore + replacement + textAfter; // if we have only one run, we need the text before, then the replacement, then the text after in that run
            } else {
                textInBeginRun = textBefore + replacement; // else we need the text before followed by the replacement in begin run
                endRun.setText(textAfter, foundTextSegment.getEndText()); // and the text after in end run
            }

            beginRun.setText(textInBeginRun, foundTextSegment.getBeginText());

            // runs between begin run and end run needs to be removed
            for (int runBetween = foundTextSegment.getEndRun() - 1; runBetween > foundTextSegment.getBeginRun(); runBetween--) {
                paragraph.removeRun(runBetween); // remove not needed runs
            }

        }
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
        run.setFontFamily("Arial Narrow");
        run.setFontSize(16);

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
        run.setFontFamily("Times New Roman");
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
    private void createTableOfContents(XWPFDocument document) throws XmlException {
        Optional<XWPFRun> tocRun = document.getParagraphs().stream().flatMap(paragraph -> paragraph.getRuns().stream())
                .filter(run -> TOC.equals(run.text()))
                .findFirst();

        if (tocRun.isPresent()) {
            tocRun.get().setFontFamily("Arial Narrow");
            XWPFParagraph paragraph = (XWPFParagraph) tocRun.get().getParent();
            paragraph.removeRun(0);
            CTP ctP = paragraph.getCTP();
            CTSimpleField toc = ctP.addNewFldSimple();
            toc.setInstr("TOC \\h");
            toc.setDirty(STOnOff.Factory.newValue(true));

            XWPFStyles styles = document.createStyles();
            addCustomHeadingStyle(styles,"index1",0);
            addCustomHeadingStyle(styles,"index2",1);
            CTStyles cTStyles = CTStyles.Factory.parse(cTStyleTOC1);
            CTStyle cTStyle = cTStyles.getStyleArray(0);
            styles.addStyle(new XWPFStyle(cTStyle));
        }
    }

    private static void addCustomHeadingStyle(XWPFStyles styles, String strStyleId, int headingLevel) {
        CTStyle ctStyle = CTStyle.Factory.newInstance();
        ctStyle.setStyleId(strStyleId);

        CTString styleName = CTString.Factory.newInstance();
        styleName.setVal(strStyleId);
        ctStyle.setName(styleName);

        CTDecimalNumber indentNumber = CTDecimalNumber.Factory.newInstance();
        indentNumber.setVal(BigInteger.valueOf(headingLevel));

        // lower number > style is more prominent in the formats bar
        ctStyle.setUiPriority(indentNumber);

        CTOnOff onoffnull = CTOnOff.Factory.newInstance();
        ctStyle.setUnhideWhenUsed(onoffnull);

        // style shows up in the formats bar
        ctStyle.setQFormat(onoffnull);

        // style defines a heading of the given level
        CTPPrGeneral ppr = CTPPrGeneral.Factory.newInstance();
        ppr.setOutlineLvl(indentNumber);
        ctStyle.setPPr(ppr);

        XWPFStyle style = new XWPFStyle(ctStyle);

        style.setType(STStyleType.PARAGRAPH);
        styles.addStyle(style);
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
