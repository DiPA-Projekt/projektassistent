package online.projektassistent.server.model;

import javax.validation.constraints.NotBlank;
import java.util.Objects;

@SuppressWarnings("unused")
public class Chapter {

    @NotBlank(message = "title is mandatory")
    private String title;
    private String text;
    private String samplesText;

    public String getTitle() {
        return title;
    }

    public String getText() {
        return text;
    }

    public String getSamplesText() {
        return samplesText;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Chapter chapter = (Chapter) o;

        if (!Objects.equals(title, chapter.title)) return false;
        if (!Objects.equals(text, chapter.text)) return false;
        return Objects.equals(samplesText, chapter.samplesText);
    }

    @Override
    public int hashCode() {
        int result = title != null ? title.hashCode() : 0;
        result = 31 * result + (text != null ? text.hashCode() : 0);
        result = 31 * result + (samplesText != null ? samplesText.hashCode() : 0);
        return result;
    }
}
