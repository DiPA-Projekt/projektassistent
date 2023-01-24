package online.projektassistent.server.rest;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import javax.validation.Valid;

import org.apache.logging.log4j.util.Strings;
import org.apache.poi.xwpf.usermodel.Borders;
import org.apache.poi.xwpf.usermodel.BreakClear;
import org.apache.poi.xwpf.usermodel.BreakType;
import org.apache.poi.xwpf.usermodel.LineSpacingRule;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.TextAlignment;
import org.apache.poi.xwpf.usermodel.UnderlinePatterns;
import org.apache.poi.xwpf.usermodel.VerticalAlign;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFHyperlinkRun;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.xmlbeans.XmlCursor;
import org.openxmlformats.schemas.officeDocument.x2006.sharedTypes.STOnOff;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTP;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSimpleField;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;
import org.springframework.util.ResourceUtils;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import online.projektassistent.server.model.Chapter;
import online.projektassistent.server.model.MultiProducts;
import online.projektassistent.server.model.Placeholders;
import online.projektassistent.server.model.ProductOfProject;
import online.projektassistent.server.model.SingleProduct;
import online.projektassistent.server.util.FileUtil;


@Controller
public class ProductControllerImpl implements ProductController, Placeholders {

    public static final String PROJECT_TEMPLATE = "project_template2.docx";
    public static final String STYLE_HEADER = "berschrift1";
    public static final String STYLE_BODY = "Textkrper";
    public static final String COLOR_CHAPTERS = "0000CD";
    public static final String INSERT_TEXT = "[Hier Ihren Text einfügen...]";

    public String generateExample() {
        try (XWPFDocument doc = new XWPFDocument()) {

            XWPFParagraph p1 = doc.createParagraph();
            p1.setAlignment(ParagraphAlignment.CENTER);
            p1.setBorderBottom(Borders.DOUBLE);
            p1.setBorderTop(Borders.DOUBLE);

            p1.setBorderRight(Borders.DOUBLE);
            p1.setBorderLeft(Borders.DOUBLE);
            p1.setBorderBetween(Borders.SINGLE);

            p1.setVerticalAlignment(TextAlignment.TOP);

            XWPFRun r1 = p1.createRun();
            r1.setBold(true);
            r1.setText("The quick brown fox");
            r1.setBold(true);
            r1.setFontFamily("Courier");
            r1.setUnderline(UnderlinePatterns.DOT_DOT_DASH);
            r1.setTextPosition(100);

            XWPFParagraph p2 = doc.createParagraph();
            p2.setAlignment(ParagraphAlignment.RIGHT);

            //BORDERS
            p2.setBorderBottom(Borders.DOUBLE);
            p2.setBorderTop(Borders.DOUBLE);
            p2.setBorderRight(Borders.DOUBLE);
            p2.setBorderLeft(Borders.DOUBLE);
            p2.setBorderBetween(Borders.SINGLE);

            XWPFRun r2 = p2.createRun();
            r2.setText("jumped over the lazy dog");
            r2.setStrikeThrough(true);
            r2.setFontSize(20);

            XWPFRun r3 = p2.createRun();
            r3.setText("and went away");
            r3.setStrikeThrough(true);
            r3.setFontSize(20);
            r3.setSubscript(VerticalAlign.SUPERSCRIPT);

            // hyperlink
            XWPFHyperlinkRun hyperlink = p2.insertNewHyperlinkRun(0, "http://poi.apache.org/");
            hyperlink.setUnderline(UnderlinePatterns.SINGLE);
            hyperlink.setColor("0000ff");
            hyperlink.setText("Apache POI");

            XWPFParagraph p3 = doc.createParagraph();
            p3.setWordWrapped(true);
            p3.setPageBreak(true);

            //p3.setAlignment(ParagraphAlignment.DISTRIBUTE);
            p3.setAlignment(ParagraphAlignment.BOTH);
            p3.setSpacingBetween(15, LineSpacingRule.EXACT);

            p3.setIndentationFirstLine(600);


            XWPFRun r4 = p3.createRun();
            r4.setTextPosition(20);
            r4.setText("To be, or not to be: that is the question: "
                    + "Whether 'tis nobler in the mind to suffer "
                    + "The slings and arrows of outrageous fortune, "
                    + "Or to take arms against a sea of troubles, "
                    + "And by opposing end them? To die: to sleep; ");
            r4.addBreak(BreakType.PAGE);
            r4.setText("No more; and by a sleep to say we end "
                    + "The heart-ache and the thousand natural shocks "
                    + "That flesh is heir to, 'tis a consummation "
                    + "Devoutly to be wish'd. To die, to sleep; "
                    + "To sleep: perchance to dream: ay, there's the rub; "
                    + ".......");
            r4.setItalic(true);
//This would imply that this break shall be treated as a simple line break, and break the line after that word:

            XWPFRun r5 = p3.createRun();
            r5.setTextPosition(-10);
            r5.setText("For in that sleep of death what dreams may come");
            r5.addCarriageReturn();
            r5.setText("When we have shuffled off this mortal coil, "
                    + "Must give us pause: there's the respect "
                    + "That makes calamity of so long life;");
            r5.addBreak();
            r5.setText("For who would bear the whips and scorns of time, "
                    + "The oppressor's wrong, the proud man's contumely,");

            r5.addBreak(BreakClear.ALL);
            r5.setText("The pangs of despised love, the law's delay, "
                    + "The insolence of office and the spurns " + ".......");

            try (FileOutputStream out = new FileOutputStream("example.docx")) {
                doc.write(out);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return "success";
    }

    @Override
    public ResponseEntity<Resource> product(@Valid @NonNull SingleProduct singleProduct) {
        try (XWPFDocument doc = new XWPFDocument(new FileInputStream(ResourceUtils.getFile("classpath:" + PROJECT_TEMPLATE)))) {
            Map<String, String> dataParams = new HashMap<>();
            dataParams.put(PRODUCT_NAME, singleProduct.getProductName());
            dataParams.put(PROJECT_NAME, singleProduct.getProjectName());
            dataParams.put(RESPONSIBLE, singleProduct.getResponsible());
            dataParams.put(PARTICIPANTS, String.join("; ", singleProduct.getParticipants()));
            dataParams.put(DATE, SimpleDateFormat.getDateTimeInstance(SimpleDateFormat.SHORT, SimpleDateFormat.LONG, Locale.GERMANY).format(new Date()));

            List<Chapter> chapters = singleProduct.getChapters();

            replacePlaceholdersInDocument(dataParams, doc);
            createChapters(doc, chapters);
            createTableOfContents(doc);

            return createResponse(doc, FileUtil.sanitizeFilename(singleProduct.getProductName()) + ".docx");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResponseEntity<Resource> products(MultiProducts multiProducts) {
        try (XWPFDocument doc = new XWPFDocument(new FileInputStream(ResourceUtils.getFile("classpath:" + PROJECT_TEMPLATE)))) {
            List<ProductOfProject> products = multiProducts.getProducts();
            Map<String, String> dataParams = new HashMap<>();
            dataParams.put(PROJECT_NAME, multiProducts.getProjectName());
            dataParams.put(DATE, SimpleDateFormat.getDateTimeInstance(SimpleDateFormat.SHORT, SimpleDateFormat.LONG, Locale.GERMANY).format(new Date()));

            for (ProductOfProject product : products) {
                dataParams.put(PRODUCT_NAME, product.getProductName());
                dataParams.put(RESPONSIBLE, product.getResponsible());
                dataParams.put(PARTICIPANTS, String.join("; ", product.getParticipants()));

                List<Chapter> chapters = product.getChapters();

                replacePlaceholdersInDocument(dataParams, doc);
                createChapters(doc, chapters);
                createTableOfContents(doc);
                // TODO docs in dateien umwandeln und zippen
            }

            return createResponse(doc, FileUtil.sanitizeFilename(multiProducts.getProjectName()) + "_products.zip");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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
    private void createChapters(XWPFDocument document, List<Chapter> chapters) {
        Optional<XWPFRun> firstChapter = document.getParagraphs().stream().flatMap(paragraph -> paragraph.getRuns().stream())
                .filter(run -> FIRST_CHAPTER.equals(run.text()))
                .findFirst();

        if (firstChapter.isPresent()) {
            XWPFParagraph para = (XWPFParagraph) firstChapter.get().getParent();
            XmlCursor cur = para.getCTP().newCursor();
            cur.toNextSibling();

            document.removeBodyElement(document.getPosOfParagraph(para));

            XWPFDocument doc = para.getDocument();
            for (Chapter chapter : chapters) {
                createChapter(cur, doc, chapter.getTitle(), chapter.getText());
                setCursorToNextStartToken(cur);
            }
        }
    }

    /**
     * Creates a single chapter at the position of the cursor
     *
     * @param cur      cursor pointing to position in document
     * @param document docx template document
     * @param title    title of chapter
     * @param content  content of chapter
     */
    private void createChapter(XmlCursor cur, XWPFDocument document, String title, String content) {

        XWPFParagraph para = document.insertNewParagraph(cur);
        para.setStyle(STYLE_HEADER);
        XWPFRun run = para.createRun();
        run.setText(title);
        run.setStyle(STYLE_HEADER);

        cur.toNextToken();
        para = document.insertNewParagraph(cur);
        para.setAlignment(ParagraphAlignment.BOTH);
        para.setStyle(STYLE_BODY);

        run = para.createRun();
        run.setText(content);
        run.setColor(COLOR_CHAPTERS);

        cur.toNextToken();
        para = document.insertNewParagraph(cur);
        para.setAlignment(ParagraphAlignment.BOTH);
        run = para.createRun();
        run.setText(INSERT_TEXT);
    }

    private XmlCursor setCursorToNextStartToken(XmlCursor cursor) {
        cursor.toEndToken(); // set cursor to end of the XmlObject
        // there always must be a next start token
        while (cursor.hasNextToken() && cursor.toNextToken() != org.apache.xmlbeans.XmlCursor.TokenType.START) ;
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
     * Writes document to a new resource and creates response
     *
     * @param document docx for the response
     * @return response
     * @throws IOException something went wrong
     */
    private ResponseEntity<Resource> createResponse(XWPFDocument document, String filename) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            document.write(out);
            byte[] productDoc = out.toByteArray();

            HttpHeaders header = new HttpHeaders();
            header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
            header.add("Cache-Control", "no-cache, no-store, must-revalidate");
            header.add("Pragma", "no-cache");
            header.add("Expires", "0");

            ByteArrayResource resource = new ByteArrayResource(productDoc);

            return ResponseEntity.ok()
                    .headers(header)
                    .contentLength(productDoc.length)
                    .contentType(MediaType.parseMediaType("application/octet-stream"))
                    .body(resource);
        }
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

    /**
     * Handle validation exceptions to create error response
     *
     * @param ex validation exception
     * @return map containing invalid field names and error messages
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}
