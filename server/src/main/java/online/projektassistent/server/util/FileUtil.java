package online.projektassistent.server.util;

import org.springframework.lang.NonNull;

public final class FileUtil {

    private FileUtil() {
    }

    /**
     * replace illegal characters in a filename with "_"
     * illegal characters :
     * : \ / * ? | < >
     *
     * @param name filename to check
     * @return valid filename
     */
    public static String sanitizeFilename(@NonNull String name) {
        return name.replaceAll("[:\\\\/*?|<>]", "_");
    }
}
