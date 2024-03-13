package online.projektassistent.server.model;

import javax.validation.constraints.NotBlank;
import java.util.Objects;

@SuppressWarnings("unused")
public class ExternalCopyTemplate {

    @NotBlank(message = "title is mandatory")
    private String title;
    @NotBlank(message = "uri is mandatory")
    private String uri;

    public String getTitle() {
        return title;
    }

    public String getUri() {
        return uri;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ExternalCopyTemplate chapter = (ExternalCopyTemplate) o;

        if (!Objects.equals(title, chapter.title)) return false;
        return Objects.equals(uri, chapter.uri);
    }

    @Override
    public int hashCode() {
        int result = title != null ? title.hashCode() : 0;
        result = 31 * result + (uri != null ? uri.hashCode() : 0);
        return result;
    }
}
