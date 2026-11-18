package online.projektassistent.server.util;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Builds an MHTML alternative-format part with images stored as MIME resources. */
final class HtmlImageEmbedder {
    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 10000;
    private static final int MAX_IMAGE_BYTES = 10 * 1024 * 1024;
    private static final String HTML_AMPERSAND = "&amp;";
    private static final Pattern IMG = Pattern.compile("<img\\b[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern SRC = Pattern.compile("\\bsrc\\s*=\\s*([\"'])(.*?)\\1", Pattern.CASE_INSENSITIVE);
    private static final Pattern STYLE = Pattern.compile("\\bstyle\\s*=\\s*([\"'])(.*?)\\1", Pattern.CASE_INSENSITIVE);
    private static final Pattern DIMENSION = Pattern.compile("\\b(?:width|height)\\s*=\\s*([\"']?)[^\\s>]+\\1", Pattern.CASE_INSENSITIVE);

    private HtmlImageEmbedder() { }

    static String toMhtml(String html, String partName, int maxWidthPx) {
        return toMhtml(html, partName, maxWidthPx, HtmlImageEmbedder::download);
    }

    static String toMhtml(String html, String partName, int maxWidthPx, ImageDownloader downloader) {
        String boundary = "----=_Projektassistent_" + UUID.randomUUID().toString().replace("-", "");
        List<ImagePart> images = new ArrayList<>();
        Map<String, ImagePart> cache = new HashMap<>();
        Matcher matcher = IMG.matcher(html == null ? "" : html);
        StringBuffer rewritten = new StringBuffer();

        while (matcher.find()) {
            String updated = rewriteImageTag(matcher.group(), maxWidthPx, downloader, cache, images);
            matcher.appendReplacement(rewritten, Matcher.quoteReplacement(updated));
        }
        matcher.appendTail(rewritten);

        String body = rewritten.toString();
        if (!body.toLowerCase(Locale.ROOT).contains("<html")) {
            body = "<!DOCTYPE html><html><head><meta http-equiv=\"content-type\" content=\"text/html; charset=utf-8\"></head><body>"
                    + body + "</body></html>";
        }

        String rootLocation = "file:///word/" + partName + ".mht";
        StringBuilder mhtml = new StringBuilder()
                .append("MIME-Version: 1.0\r\n")
                .append("Content-Type: multipart/related; type=\"text/html\"; boundary=\"").append(boundary).append("\"\r\n\r\n")
                .append("This is a multi-part message in MIME format.\r\n\r\n")
                .append("--").append(boundary).append("\r\n")
                .append("Content-Type: text/html; charset=\"utf-8\"\r\n")
                .append("Content-Transfer-Encoding: base64\r\n")
                .append("Content-Location: ").append(rootLocation).append("\r\n\r\n")
                .append(base64(body.getBytes(StandardCharsets.UTF_8))).append("\r\n");

        for (ImagePart image : images) {
            mhtml.append("--").append(boundary).append("\r\n")
                    .append("Content-Type: ").append(image.contentType).append("\r\n")
                    .append("Content-Transfer-Encoding: base64\r\n")
                    .append("Content-Location: ").append(image.location).append("\r\n\r\n")
                    .append(base64(image.bytes)).append("\r\n");
        }
        return mhtml.append("--").append(boundary).append("--\r\n").toString();
    }

    private static String rewriteImageTag(
            String tag, int maxWidthPx, ImageDownloader downloader,
            Map<String, ImagePart> cache, List<ImagePart> images) {
        Matcher srcMatcher = SRC.matcher(tag);
        if (!srcMatcher.find()) {
            return tag;
        }

        String source = srcMatcher.group(2).replace(HTML_AMPERSAND, "&");
        try {
            ImagePart image = cache.get(source);
            if (image == null) {
                image = downloader.download(source, maxWidthPx);
                cache.put(source, image);
                images.add(image);
            }
            String updated = tag.replace(srcMatcher.group(), "src=\"" + escapeAttribute(image.location) + "\"");
            return applyWidth(updated, image.widthPx, image.heightPx);
        } catch (IOException ex) {
            String alt = extractAlt(tag);
            String fallback = alt.isBlank() ? "[Bild konnte nicht eingebettet werden]"
                    : "[Bild konnte nicht eingebettet werden: " + alt + "]";
            return "<span>" + escapeText(fallback) + "</span>";
        }
    }

    @FunctionalInterface
    interface ImageDownloader {
        ImagePart download(String source, int maxWidthPx) throws IOException;
    }

    private static ImagePart download(String source, int maxWidthPx) throws IOException {
        return download(source, maxWidthPx, url -> (HttpURLConnection) url.openConnection());
    }

    static ImagePart download(String source, int maxWidthPx, HttpConnectionFactory connectionFactory)
            throws IOException {
        URI uri = validateImageUri(source);
        URL url = uri.toURL();
        HttpURLConnection connection = connectionFactory.open(url);
        configureConnection(connection);

        try (DisconnectingConnection resource = new DisconnectingConnection(connection)) {
            int status = connection.getResponseCode();
            if (status < 200 || status >= 300) {
                throw new IOException("Image HTTP status " + status);
            }

            byte[] bytes = readImageBytes(connection);
            String contentType = imageContentType(connection.getContentType());
            BufferedImage dimensions = ImageIO.read(new ByteArrayInputStream(bytes));
            if (contentType == null || dimensions == null) {
                throw new IOException("Unsupported image format");
            }

            int displayWidth = Math.min(dimensions.getWidth(), maxWidthPx);
            int displayHeight = Math.max(1, (int) Math.round(
                    dimensions.getHeight() * (displayWidth / (double) dimensions.getWidth())));
            return new ImagePart(uri.toASCIIString(), contentType, bytes, displayWidth, displayHeight);
        }
    }

    @FunctionalInterface
    interface HttpConnectionFactory {
        HttpURLConnection open(URL url) throws IOException;
    }

    private static URI validateImageUri(String source) throws IOException {
        URI uri;
        try {
            uri = URI.create(source);
        } catch (IllegalArgumentException ex) {
            throw new IOException("Invalid image URL", ex);
        }

        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("https") && !scheme.equalsIgnoreCase("http"))
                || uri.getHost() == null || uri.getUserInfo() != null) {
            throw new IOException("Unsupported image URL");
        }

        String host = uri.getHost().toLowerCase(Locale.ROOT);
        if (host.equals("localhost") || host.endsWith(".localhost") || host.endsWith(".local")) {
            throw new IOException("Local image URLs are not allowed");
        }
        InetAddress address = InetAddress.getByName(host);
        if (address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress()
                || address.isSiteLocalAddress() || address.isMulticastAddress()) {
            throw new IOException("Private network image URLs are not allowed");
        }
        return uri;
    }

    private static void configureConnection(HttpURLConnection connection) {
        connection.setConnectTimeout(CONNECT_TIMEOUT_MS);
        connection.setReadTimeout(READ_TIMEOUT_MS);
        connection.setInstanceFollowRedirects(false);
        connection.setRequestProperty("Accept", "image/png,image/jpeg,image/gif,image/bmp");
        connection.setRequestProperty("User-Agent", "Projektassistent-Docx-Exporter");
    }

    private static byte[] readImageBytes(HttpURLConnection connection) throws IOException {
        if (connection.getContentLength() > MAX_IMAGE_BYTES) {
            throw new IOException("Image too large");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             var in = connection.getInputStream()) {
            byte[] buffer = new byte[8192];
            int total = 0;
            int count;
            while ((count = in.read(buffer)) != -1) {
                total += count;
                if (total > MAX_IMAGE_BYTES) {
                    throw new IOException("Image too large");
                }
                out.write(buffer, 0, count);
            }
            return out.toByteArray();
        }
    }

    private static final class DisconnectingConnection implements AutoCloseable {
        private final HttpURLConnection connection;

        private DisconnectingConnection(HttpURLConnection connection) {
            this.connection = connection;
        }

        @Override
        public void close() {
            connection.disconnect();
        }
    }

    private static String imageContentType(String value) {
        if (value == null) return null;
        String type = value.split(";")[0].trim().toLowerCase(Locale.ROOT);
        return switch (type) {
            case "image/png", "image/jpeg", "image/gif", "image/bmp" -> type;
            default -> null;
        };
    }

    private static String applyWidth(String tag, int widthPx, int heightPx) {
        // Word's MHTML importer does not consistently honor CSS image dimensions.
        // Set explicit HTML dimensions as well, preserving the source aspect ratio.
        String updated = DIMENSION.matcher(tag).replaceAll("");
        updated = updated.replaceFirst(
                "(?i)<img\\b",
                Matcher.quoteReplacement("<img width=\"" + widthPx + "\" height=\"" + heightPx + "\""));

        Matcher style = STYLE.matcher(updated);
        String widthStyle = "width:" + widthPx + "px;height:" + heightPx + "px;max-width:100%";
        if (style.find()) {
            String existing = style.group(2).trim();
            String combined = existing + (existing.isEmpty() || existing.endsWith(";") ? "" : ";") + widthStyle;
            return style.replaceFirst(Matcher.quoteReplacement("style=\"" + combined + "\""));
        }
        return updated.replaceFirst(
                "(?i)<img\\b",
                Matcher.quoteReplacement("<img style=\"" + widthStyle + "\""));
    }

    private static String base64(byte[] bytes) {
        return Base64.getMimeEncoder(76, "\r\n".getBytes(StandardCharsets.US_ASCII)).encodeToString(bytes);
    }

    private static String extractAlt(String tag) {
        Matcher matcher = Pattern.compile("\\balt\\s*=\\s*([\"'])(.*?)\\1", Pattern.CASE_INSENSITIVE).matcher(tag);
        return matcher.find() ? unescapeHtmlAttribute(matcher.group(2)) : "";
    }

    private static String unescapeHtmlAttribute(String value) {
        // Decode each entity exactly once. A sequence such as &amp;lt; must
        // remain &amp;lt; after the subsequent text escaping, not become '<'.
        Pattern entity = Pattern.compile("&(#\\d+|#x[0-9a-fA-F]+|amp|quot|apos|lt|gt);");
        Matcher matcher = entity.matcher(value);
        StringBuffer decoded = new StringBuffer();
        while (matcher.find()) {
            String original = matcher.group();
            String replacement = decodeHtmlEntity(matcher.group(1), original);
            matcher.appendReplacement(decoded, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(decoded);
        return decoded.toString();
    }

    private static String decodeHtmlEntity(String token, String original) {
        return switch (token) {
            case "amp" -> "&";
            case "quot" -> "\"";
            case "apos" -> "'";
            case "lt" -> "<";
            case "gt" -> ">";
            default -> decodeNumericEntity(token, original);
        };
    }

    private static String decodeNumericEntity(String token, String original) {
        try {
            int codePoint = token.startsWith("#x")
                    ? Integer.parseInt(token.substring(2), 16)
                    : Integer.parseInt(token.substring(1));
            if (!Character.isValidCodePoint(codePoint)
                    || (codePoint >= Character.MIN_SURROGATE && codePoint <= Character.MAX_SURROGATE)) {
                return original;
            }
            return new String(Character.toChars(codePoint));
        } catch (NumberFormatException ex) {
            return original;
        }
    }

    private static String escapeAttribute(String value) {
        return value.replace("&", HTML_AMPERSAND).replace("\"", "&quot;");
    }

    private static String escapeText(String value) {
        return value.replace("&", HTML_AMPERSAND).replace("<", "&lt;").replace(">", "&gt;");
    }

    record ImagePart(String location, String contentType, byte[] bytes, int widthPx, int heightPx) { }
}
