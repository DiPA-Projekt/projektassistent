package online.projektassistent.server.util;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.junit.jupiter.api.Test;

import java.net.URL;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class ProductBuilderTest {

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
            XWPFRun first = paragraph.createRun();
            first.setText("Vorher [NA");
            XWPFRun middle = paragraph.createRun();
            middle.setText("ME");
            XWPFRun last = paragraph.createRun();
            last.setText("] nachher");

            ProductBuilder.replaceTextSegment(paragraph, "[NAME]", "Projekt");

            assertEquals("Vorher Projekt nachher", paragraph.getText());
            assertEquals(2, paragraph.getRuns().size());
            assertEquals("Vorher Projekt", paragraph.getRuns().get(0).text());
            assertEquals(" nachher", paragraph.getRuns().get(1).text());
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
