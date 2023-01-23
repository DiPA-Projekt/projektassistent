package online.projektassistent.server.rest;

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
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;
import org.springframework.util.ResourceUtils;

import online.projektassistent.server.model.Chapter;
import online.projektassistent.server.model.Placeholders;
import online.projektassistent.server.model.Product;


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
    public String test(@NonNull Product product) {
        try (XWPFDocument doc = new XWPFDocument(new FileInputStream(ResourceUtils.getFile("classpath:" + PROJECT_TEMPLATE)))) {
            Map<String, String> dataParams = new HashMap<>();
            dataParams.put(PRODUCT_NAME, product.getProductName());
            dataParams.put(PROJECT_NAME, product.getProjectName());
            dataParams.put(RESPONSIBLE, product.getResponsible());
            dataParams.put(PARTICIPANTS, String.join("; ", product.getParticipants()));
            dataParams.put(DATE, SimpleDateFormat.getDateTimeInstance(SimpleDateFormat.SHORT, SimpleDateFormat.LONG, Locale.GERMANY).format(new Date()));

            List<Chapter> chapters = product.getChapters();

            replacePlaceholdersInDocument(dataParams, doc);

            Optional<XWPFRun> firstChapter = doc.getParagraphs().stream().flatMap(paragraph -> paragraph.getRuns().stream())
                    .filter(run -> FIRST_CHAPTER.equals(run.text()))
                    .findFirst();

            if (firstChapter.isPresent()) {
                XWPFParagraph para = (XWPFParagraph) firstChapter.get().getParent();
                XmlCursor cur = para.getCTP().newCursor();
                cur.toNextSibling();

                doc.removeBodyElement(doc.getPosOfParagraph(para));
                //para.setNumID(numID);
                //para.setStyle("Heading1");

                XWPFDocument document = para.getDocument();
                for (Chapter chapter : chapters) {
                    createChapter(cur, document, chapter.getTitle(), chapter.getText());
                    setCursorToNextStartToken(cur);
                }
            }

            createTableOfContents(doc);

            try (FileOutputStream out = new FileOutputStream("test.docx")) {
                doc.write(out);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return "success";
    }

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

        /*cur.toNextToken();
        para = document.insertNewParagraph(cur);
        run = para.createRun();
        run.addBreak(BreakType.PAGE);*/
    }

    private XmlCursor setCursorToNextStartToken(XmlCursor cursor) {
        cursor.toEndToken(); //Now we are at end of the XmlObject.
        //There always must be a next start token.
        while (cursor.hasNextToken() && cursor.toNextToken() != org.apache.xmlbeans.XmlCursor.TokenType.START) ;
        //Now we are at the next start token and can insert new things here.
        return cursor;
    }

    private void createTableOfContents(XWPFDocument doc) {
        Optional<XWPFRun> tocRun = doc.getParagraphs().stream().flatMap(paragraph -> paragraph.getRuns().stream())
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
     * Method for replacing docx placeholders with given data parameters in every docx paragraph
     *
     * @param dataParams given data to be replaced with template placeholders
     * @param document   docx template document
     **/
    private void replacePlaceholdersInDocument(Map<String, String> dataParams, XWPFDocument document) {
        replacePlaceholdersInParagraphs(dataParams, document.getParagraphs());
        replacePlaceholderInTables(dataParams, document);
    }

    /**
     * Method for replacing docx placeholders with given data parameters in docx table
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

    private void replacePlaceholdersInParagraphs(Map<String, String> dataParams, List<XWPFParagraph> paragraphs) {
        paragraphs.stream().flatMap(paragraph -> paragraph.getRuns().stream())
                .forEach(run -> {
                    final String text = run.text();

                    dataParams.entrySet().stream()
                            .filter(entry -> textContainsPlaceholder(text, entry))
                            .forEach(entry -> replaceText(run, text, entry));
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
}
