package online.projektassistent.server.util;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.junit.jupiter.api.Test;
import online.projektassistent.server.model.Chapter;
import online.projektassistent.server.model.SingleProduct;

import java.io.ByteArrayInputStream;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.lang.reflect.Method;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import java.net.URL;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ProductBuilderTest {

    @Test
    void createsSingleProductDocumentWithChapterAndHtmlParts() throws Exception {
        Chapter chapter = new Chapter();
        setField(chapter, "title", "Testkapitel");
        setField(chapter, "text", "<p>Kapitelinhalt</p>");
        setField(chapter, "samplesText", "<p>Beispielinhalt</p>");

        SingleProduct product = new SingleProduct();
        setField(product, "productName", "Testprodukt");
        setField(product, "projectName", "Testprojekt");
        setField(product, "responsible", "Verantwortlich");
        setField(product, "participants", List.of("Person A", "Person B"));
        setField(product, "modelVariant", "Standard");
        setField(product, "version", "1.0");
        setField(product, "chapters", List.of(chapter));

        byte[] result = new ProductBuilder().createSingleProduct(product);

        assertTrue(result.length > 0);
        try (XWPFDocument document = new XWPFDocument(new ByteArrayInputStream(result))) {
            assertTrue(document.getParagraphs().stream()
                    .anyMatch(paragraph -> paragraph.getText().contains("Testkapitel")));
            assertTrue(document.getParagraphs().stream()
                    .anyMatch(paragraph -> paragraph.getText().contains(ProductBuilder.INSERT_TEXT)));
        }

        try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(result))) {
            List<String> entries = new java.util.ArrayList<>();
            ZipEntry entry;
            while ((entry = zip.getNextEntry()) != null) {
                entries.add(entry.getName());
            }
            assertTrue(entries.contains("word/contentHtmlDoc0.mht"));
            assertTrue(entries.contains("word/samplesHtmlDoc0.mht"));
        }
    }


    @Test
    void replacesPlaceholdersInsideTableCells() throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {
            var table = document.createTable(1, 1);
            table.getRow(0).getCell(0).getParagraphs().get(0)
                    .createRun().setText("Vorher [NAME] nachher");

            Method replace = ProductBuilder.class.getDeclaredMethod(
                    "replacePlaceholdersInDocument", Map.class, XWPFDocument.class);
            replace.setAccessible(true);
            replace.invoke(new ProductBuilder(), Map.of("[NAME]", "Projekt"), document);

            assertEquals("Vorher Projekt nachher",
                    table.getRow(0).getCell(0).getText());
        }
    }

    @Test
    void createsTableOfContentsWhenPlaceholderExists() throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.createRun().setText("TOC");

            invokeCreateTableOfContents(document);

            assertEquals(1, paragraph.getCTP().sizeOfFldSimpleArray());
            assertEquals("TOC \\h", paragraph.getCTP().getFldSimpleArray(0).getInstr());
            assertNotNull(document.getStyles());
        }
    }

    @Test
    void leavesDocumentWithoutTableOfContentsPlaceholderUnchanged() throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.createRun().setText("Kein Inhaltsverzeichnis");

            invokeCreateTableOfContents(document);

            assertEquals(0, paragraph.getCTP().sizeOfFldSimpleArray());
            assertNull(document.getStyles());
        }
    }

    private static void invokeCreateTableOfContents(XWPFDocument document) throws Exception {
        Method method = ProductBuilder.class.getDeclaredMethod(
                "createTableOfContents", XWPFDocument.class);
        method.setAccessible(true);
        method.invoke(new ProductBuilder(), document);
    }

    private static void setField(Object target, String name, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void extractsFileExtensionFromUrl() throws Exception {
        assertEquals(Optional.of("docx"), ProductBuilder.getFileExtension(
                new URL("https://example.test/templates/project.docx")));
    }

    @Test
    void extractsFileExtensionBeforeQueryString() throws Exception {
        assertEquals(Optional.of("png"), ProductBuilder.getFileExtension(
                new URL("https://example.test/images/diagram.png?download=1")));
    }

    @Test
    void returnsEmptyWhenUrlHasNoFileExtension() throws Exception {
        assertEquals(Optional.empty(), ProductBuilder.getFileExtension(
                new URL("https://example.test/templates/project")));
    }

    @Test
    void returnsEmptyWhenUrlEndsWithDot() throws Exception {
        assertEquals(Optional.empty(), ProductBuilder.getFileExtension(
                new URL("https://example.test/templates/project.")));
    }

    @Test
    void rejectsNullUrlWhenExtractingFileExtension() {
        assertThrows(NullPointerException.class, () -> ProductBuilder.getFileExtension(null));
    }

    @Test
    void replacesPlaceholderWithinSingleRunAndPreservesSurroundingText() throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {
            XWPFParagraph paragraph = document.createParagraph();
            XWPFRun run = paragraph.createRun();
            run.setText("Vorher [NAME] nachher");

            ProductBuilder.replaceTextSegment(paragraph, "[NAME]", "Projekt");

            assertEquals("Vorher Projekt nachher", paragraph.getText());
            assertEquals(1, paragraph.getRuns().size());
        }
    }

    @Test
    void replacesPlaceholderAcrossMultipleRunsAndRemovesIntermediateRuns() throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {
            XWPFParagraph paragraph = document.createParagraph();
            XWPFRun prefix = paragraph.createRun();
            prefix.setText("Vorher ");
            XWPFRun first = paragraph.createRun();
            first.setText("[NA");
            XWPFRun middle = paragraph.createRun();
            middle.setText("ME");
            XWPFRun last = paragraph.createRun();
            last.setText("] nachher");

            ProductBuilder.replaceTextSegment(paragraph, "[NAME]", "Projekt");

            assertEquals("Vorher Projekt nachher", paragraph.getText());
            assertEquals(3, paragraph.getRuns().size());
            assertEquals("Vorher ", paragraph.getRuns().get(0).text());
            assertEquals("Projekt", paragraph.getRuns().get(1).text());
            assertEquals(" nachher", paragraph.getRuns().get(2).text());
        }
    }

    @Test
    void leavesParagraphUnchangedWhenPlaceholderIsAbsent() throws Exception {
        try (XWPFDocument document = new XWPFDocument()) {
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.createRun().setText("Kein Platzhalter vorhanden");

            ProductBuilder.replaceTextSegment(paragraph, "[NAME]", "Projekt");

            assertEquals("Kein Platzhalter vorhanden", paragraph.getText());
            assertEquals(1, paragraph.getRuns().size());
        }
    }
}
