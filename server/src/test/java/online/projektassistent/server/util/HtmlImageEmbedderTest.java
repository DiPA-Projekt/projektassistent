package online.projektassistent.server.util;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class HtmlImageEmbedderTest {

    private static final String IMAGE_URL = "https://example.test/image.png";
    private static final byte[] IMAGE_BYTES = new byte[]{1, 2, 3, 4, 5};

    @Test
    void embedsImageAsMimeResourceAndLimitsDimensions() {
        HtmlImageEmbedder.ImageDownloader downloader = (source, maxWidth) -> {
            assertEquals(IMAGE_URL, source);
            assertEquals(400, maxWidth);
            return new HtmlImageEmbedder.ImagePart(
                    source, "image/png", IMAGE_BYTES, 400, 200);
        };

        String mhtml = HtmlImageEmbedder.toMhtml(
                "<p>Vorher</p><img src=\"" + IMAGE_URL + "\" width=\"1200\" height=\"600\" alt=\"Diagramm\">",
                "chapter", 400, downloader);

        assertTrue(mhtml.contains("Content-Type: multipart/related"));
        assertTrue(mhtml.contains("Content-Type: image/png"));
        assertTrue(mhtml.contains("Content-Location: " + IMAGE_URL));
        assertTrue(mhtml.contains(Base64.getMimeEncoder().encodeToString(IMAGE_BYTES)));

        String html = decodeHtmlPart(mhtml);
        assertTrue(html.contains("width=\"400\""));
        assertTrue(html.contains("height=\"200\""));
        assertTrue(html.contains("alt=\"Diagramm\""));
        assertTrue(html.contains("Vorher"));
    }

    @Test
    void downloadsRepeatedImageOnlyOnce() {
        AtomicInteger downloads = new AtomicInteger();
        HtmlImageEmbedder.ImageDownloader downloader = (source, maxWidth) -> {
            downloads.incrementAndGet();
            return new HtmlImageEmbedder.ImagePart(
                    source, "image/jpeg", IMAGE_BYTES, 100, 50);
        };

        String mhtml = HtmlImageEmbedder.toMhtml(
                "<img src=\"" + IMAGE_URL + "\"><img src=\"" + IMAGE_URL + "\">",
                "chapter", 600, downloader);

        assertEquals(1, downloads.get());
        assertEquals(1, occurrences(mhtml, "Content-Location: " + IMAGE_URL));
        String html = decodeHtmlPart(mhtml);
        assertEquals(2, occurrences(html, "src=\"" + IMAGE_URL + "\""));
    }

    @Test
    void replacesUnavailableImageWithReadableFallbackAndContinues() {
        HtmlImageEmbedder.ImageDownloader downloader = (source, maxWidth) -> {
            throw new IOException("Image unavailable");
        };

        String mhtml = HtmlImageEmbedder.toMhtml(
                "<p>Text bleibt</p><img src=\"" + IMAGE_URL + "\" alt=\"Risikoliste &amp; Grafik\"><p>Danach</p>",
                "chapter", 600, downloader);

        String html = decodeHtmlPart(mhtml);
        assertTrue(html.contains("Text bleibt"));
        assertTrue(html.contains("Danach"));
        assertTrue(html.contains("[Bild konnte nicht eingebettet werden: Risikoliste &amp; Grafik]"));
        assertFalse(html.contains("<img"));
        assertFalse(mhtml.contains("Content-Type: image/png"));
    }

    @Test
    void keepsHtmlWithoutImagesAndWrapsItAsMhtml() {
        String mhtml = HtmlImageEmbedder.toMhtml("<p>Nur Text</p>", "chapter", 600);

        assertTrue(mhtml.startsWith("MIME-Version: 1.0"));
        assertTrue(decodeHtmlPart(mhtml).contains("<p>Nur Text</p>"));
        assertFalse(mhtml.contains("Content-Type: image/"));
    }

    private static String decodeHtmlPart(String mhtml) {
        String marker = "Content-Location: file:///word/chapter.mht\r\n\r\n";
        int start = mhtml.indexOf(marker);
        assertTrue(start >= 0, "MHTML root part must have a Content-Location");
        start += marker.length();
        int end = mhtml.indexOf("\r\n--", start);
        assertTrue(end > start, "MHTML root part must end at the next MIME boundary");
        byte[] decoded = Base64.getMimeDecoder().decode(mhtml.substring(start, end));
        return new String(decoded, StandardCharsets.UTF_8);
    }

    private static int occurrences(String text, String needle) {
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(needle, index)) >= 0) {
            count++;
            index += needle.length();
        }
        return count;
    }
}
