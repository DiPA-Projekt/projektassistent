package online.projektassistent.server.util;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class HtmlImageEmbedderTest {

    private static final String IMAGE_URL = "https://example.test/image.png";
    private static final byte[] IMAGE_BYTES = {1, 2, 3, 4, 5};

    @Test
    void embedsImageAsMimeResourceAndLimitsDimensions() {
        HtmlImageEmbedder.ImageDownloader downloader = (source, maxWidth) -> {
            assertEquals(IMAGE_URL, source);
            assertEquals(600, maxWidth);
            return new HtmlImageEmbedder.ImagePart(
                    source, "image/png", IMAGE_BYTES, 400, 200);
        };

        String mhtml = HtmlImageEmbedder.toMhtml(
                "<p>Vorher</p><img src=\"" + IMAGE_URL + "\" alt=\"Diagramm\">",
                "chapter", 600, downloader);

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


    @Test
    void leavesImageWithoutSourceUnchanged() {
        String input = "<p>Text</p><img>";
        String html = decodeHtmlPart(HtmlImageEmbedder.toMhtml(input, "chapter", 600,
                (source, maxWidth) -> { throw new AssertionError("Downloader must not be called"); }));

        assertTrue(html.contains("<img>"));
        assertTrue(html.contains("Text"));
    }

    @Test
    void replacesImageWithEmptyAltUsingGenericFallback() {
        String mhtml = HtmlImageEmbedder.toMhtml(
                "<img src=\"" + IMAGE_URL + "\">", "chapter", 600,
                (source, maxWidth) -> { throw new IOException("Image unavailable"); });

        assertTrue(decodeHtmlPart(mhtml).contains("[Bild konnte nicht eingebettet werden]"));
    }

    @Test
    void preservesExistingHtmlAndExistingStyleWhileReplacingDimensions() {
        HtmlImageEmbedder.ImageDownloader downloader = (source, maxWidth) ->
                new HtmlImageEmbedder.ImagePart(source, "image/png", IMAGE_BYTES, 320, 160);
        String input = "<html><head><title>Existing</title></head><body>"
                + "<img src='" + IMAGE_URL + "' width='900' height='450' style='border:0'>"
                + "</body></html>";

        String html = decodeHtmlPart(HtmlImageEmbedder.toMhtml(input, "chapter", 600, downloader));

        assertTrue(html.startsWith("<html>"));
        assertTrue(html.contains("<title>Existing</title>"));
        assertTrue(html.contains("width=\"320\""));
        assertTrue(html.contains("height=\"160\""));
        assertTrue(html.contains("style=\"border:0;width:320px;height:160px;max-width:100%\""));
        assertFalse(html.contains("width='900'"));
    }

    @Test
    void decodesAmpersandInSourceAndEscapesReturnedLocation() {
        String source = "https://example.test/image.png?a=1&amp;b=2";
        HtmlImageEmbedder.ImageDownloader downloader = (url, maxWidth) -> {
            assertEquals("https://example.test/image.png?a=1&b=2", url);
            return new HtmlImageEmbedder.ImagePart(
                    "https://cdn.example.test/image.png?a=1&b=2", "image/png", IMAGE_BYTES, 20, 10);
        };

        String html = decodeHtmlPart(HtmlImageEmbedder.toMhtml(
                "<img src=\"" + source + "\">", "chapter", 600, downloader));

        assertTrue(html.contains("src=\"https://cdn.example.test/image.png?a=1&amp;b=2\""));
    }

    @Test
    void wrapsNullHtmlAsAnEmptyHtmlDocument() {
        String html = decodeHtmlPart(HtmlImageEmbedder.toMhtml(null, "chapter", 600));
        assertTrue(html.contains("<html>"));
        assertTrue(html.contains("<body></body>"));
    }

    @Test
    void replacesMalformedAndUnsupportedImageUrlsWithFallback() {
        String malformed = decodeHtmlPart(HtmlImageEmbedder.toMhtml(
                "<img src=\"http://[invalid\">", "chapter", 600));
        String unsupported = decodeHtmlPart(HtmlImageEmbedder.toMhtml(
                "<img src=\"file:///tmp/image.png\">", "chapter", 600));

        assertTrue(malformed.contains("[Bild konnte nicht eingebettet werden]"));
        assertTrue(unsupported.contains("[Bild konnte nicht eingebettet werden]"));
    }

    @Test
    void imagePartUsesArrayContentForEqualityHashCodeAndToString() {
        HtmlImageEmbedder.ImagePart first =
                new HtmlImageEmbedder.ImagePart(IMAGE_URL, "image/png", new byte[]{1, 2, 3}, 20, 10);
        HtmlImageEmbedder.ImagePart equal =
                new HtmlImageEmbedder.ImagePart(IMAGE_URL, "image/png", new byte[]{1, 2, 3}, 20, 10);
        HtmlImageEmbedder.ImagePart different =
                new HtmlImageEmbedder.ImagePart(IMAGE_URL, "image/png", new byte[]{1, 2, 4}, 20, 10);

        assertEquals(first, equal);
        assertEquals(first.hashCode(), equal.hashCode());
        assertNotEquals(first, different);
        assertTrue(first.toString().contains("bytes=[1, 2, 3]"));
    }

    @Test
    void decodesNumericEntitiesInFallbackAltText() {
        String html = decodeHtmlPart(HtmlImageEmbedder.toMhtml(
                "<img src=\"" + IMAGE_URL + "\" alt=\"Gr\u00fc\u00dfe &#65; &#x1F600; &#x110000; &#xD800; &#xZZ;\">",
                "chapter", 600,
                (source, maxWidth) -> { throw new IOException("unavailable"); }));

        assertTrue(html.contains("Gr\u00fc\u00dfe A \uD83D\uDE00 &amp;#x110000; &amp;#xD800; &amp;#xZZ;"));
    }

    @Test
    void downloadsPngAndCalculatesDimensionsWithoutExternalNetwork() throws Exception {
        byte[] png = createPng(100, 50);
        FakeHttpConnection connection = new FakeHttpConnection(
                new URL("https://8.8.8.8/image.png"), 200, "image/png", png, png.length);

        HtmlImageEmbedder.ImagePart image = HtmlImageEmbedder.download(
                "https://8.8.8.8/image.png", 40, url -> connection);

        assertEquals("https://8.8.8.8/image.png", image.location());
        assertEquals("image/png", image.contentType());
        assertArrayEquals(png, image.bytes());
        assertEquals(40, image.widthPx());
        assertEquals(20, image.heightPx());
        assertTrue(connection.disconnected);
        assertEquals(5000, connection.getConnectTimeout());
        assertEquals(10000, connection.getReadTimeout());
        assertFalse(connection.getInstanceFollowRedirects());
        assertEquals("image/png,image/jpeg,image/gif,image/bmp",
                connection.getRequestProperty("Accept"));
    }

    @Test
    void rejectsHttpErrorAndDisconnectsConnection() throws Exception {
        FakeHttpConnection connection = new FakeHttpConnection(
                new URL("https://8.8.8.8/image.png"), 404, "image/png", new byte[0], 0);

        assertThrows(IOException.class, () -> HtmlImageEmbedder.download(
                "https://8.8.8.8/image.png", 600, url -> connection));
        assertTrue(connection.disconnected);
    }

    @Test
    void rejectsUnsupportedContentTypeAndOversizedImages() throws Exception {
        byte[] png = createPng(10, 10);
        FakeHttpConnection unsupported = new FakeHttpConnection(
                new URL("https://8.8.8.8/image.png"), 200, "text/html", png, png.length);
        assertThrows(IOException.class, () -> HtmlImageEmbedder.download(
                "https://8.8.8.8/image.png", 600, url -> unsupported));
        assertTrue(unsupported.disconnected);

        FakeHttpConnection oversized = new FakeHttpConnection(
                new URL("https://8.8.8.8/image.png"), 200, "image/png", png, 10 * 1024 * 1024 + 1);
        assertThrows(IOException.class, () -> HtmlImageEmbedder.download(
                "https://8.8.8.8/image.png", 600, url -> oversized));
        assertTrue(oversized.disconnected);
    }


    @Test
    void rejectsLocalhostAndPrivateNetworkImageUrlsBeforeOpeningConnection() {
        assertThrows(IOException.class, () -> HtmlImageEmbedder.download(
                "http://localhost/image.png", 600,
                url -> { throw new AssertionError("A local URL must never be opened"); }));
        assertThrows(IOException.class, () -> HtmlImageEmbedder.download(
                "http://127.0.0.1/image.png", 600,
                url -> { throw new AssertionError("A loopback URL must never be opened"); }));
        assertThrows(IOException.class, () -> HtmlImageEmbedder.download(
                "http://192.168.1.10/image.png", 600,
                url -> { throw new AssertionError("A private-network URL must never be opened"); }));
        assertThrows(IOException.class, () -> HtmlImageEmbedder.download(
                "http://user@example.com/image.png", 600,
                url -> { throw new AssertionError("A URL containing user info must never be opened"); }));
    }

    @Test
    void rejectsImageWhenStreamExceedsLimitDespiteSmallContentLength() throws Exception {
        byte[] oversized = new byte[10 * 1024 * 1024 + 1];
        FakeHttpConnection connection = new FakeHttpConnection(
                new URL("https://8.8.8.8/image.png"), 200, "image/png", oversized, 1);

        assertThrows(IOException.class, () -> HtmlImageEmbedder.download(
                "https://8.8.8.8/image.png", 600, url -> connection));
        assertTrue(connection.disconnected);
    }

    private static byte[] createPng(int width, int height) throws IOException {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }

    private static final class FakeHttpConnection extends HttpURLConnection {
        private final int status;
        private final String contentType;
        private final byte[] bytes;
        private final int contentLength;
        private boolean disconnected;

        private FakeHttpConnection(URL url, int status, String contentType, byte[] bytes, int contentLength) {
            super(url);
            this.status = status;
            this.contentType = contentType;
            this.bytes = bytes;
            this.contentLength = contentLength;
        }

        @Override
        public int getResponseCode() {
            return status;
        }

        @Override
        public String getContentType() {
            return contentType;
        }

        @Override
        public int getContentLength() {
            return contentLength;
        }

        @Override
        public InputStream getInputStream() {
            return new ByteArrayInputStream(bytes);
        }

        @Override
        public void disconnect() {
            disconnected = true;
        }

        @Override
        public boolean usingProxy() {
            return false;
        }

        @Override
        public void connect() {
            // No network connection is made in this test.
        }
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
