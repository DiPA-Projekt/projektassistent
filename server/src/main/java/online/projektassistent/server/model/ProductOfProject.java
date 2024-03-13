package online.projektassistent.server.model;

import javax.validation.constraints.NotBlank;
import java.util.List;
import java.util.Objects;

@SuppressWarnings("unused")
public class ProductOfProject {

    @NotBlank(message = "productName is mandatory")
    private String productName;

    @NotBlank(message = "version is mandatory")
    private String version;
    @NotBlank(message = "model variant is mandatory")
    private String modelVariant;

    private String disciplineName;

    @NotBlank(message = "responsible is mandatory")
    private String responsible;

    private List<String> participants;

    //@NotEmpty(message = "at least one chapter is mandatory")
    private List<Chapter> chapters;

    private List<ExternalCopyTemplate> externalCopyTemplates;

    public String getProductName() {
        return productName;
    }
    public String getModelVariant() {
        return modelVariant;
    }
    public String getVersion() {
        return version;
    }

    public String getDisciplineName() {
        return disciplineName;
    }

    public String getResponsible() {
        return responsible;
    }

    public List<String> getParticipants() {
        return participants;
    }

    public List<Chapter> getChapters() {
        return chapters;
    }

    public List<ExternalCopyTemplate> getExternalCopyTemplates() {
        return externalCopyTemplates;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ProductOfProject singleProduct = (ProductOfProject) o;

        if (!Objects.equals(productName, singleProduct.productName)) return false;
        if (!Objects.equals(responsible, singleProduct.responsible)) return false;
        if (!Objects.equals(participants, singleProduct.participants)) return false;
        if (!Objects.equals(modelVariant, singleProduct.modelVariant)) return false;
        if (!Objects.equals(version, singleProduct.version)) return false;
        if (!Objects.equals(externalCopyTemplates, singleProduct.externalCopyTemplates)) return false;
        return Objects.equals(chapters, singleProduct.chapters);
    }

    @Override
    public int hashCode() {
        int result = productName != null ? productName.hashCode() : 0;
        result = 31 * result + (responsible != null ? responsible.hashCode() : 0);
        result = 31 * result + (participants != null ? participants.hashCode() : 0);
        result = 31 * result + (modelVariant != null ? modelVariant.hashCode() : 0);
        result = 31 * result + (version != null ? version.hashCode() : 0);
        result = 31 * result + (chapters != null ? chapters.hashCode() : 0);
        result = 31 * result + (externalCopyTemplates != null ? externalCopyTemplates.hashCode() : 0);
        return result;
    }
}
