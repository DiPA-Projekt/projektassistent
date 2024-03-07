package online.projektassistent.server.model;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Objects;

@SuppressWarnings("unused")
public class MultiProducts {

    @NotBlank(message = "projectName is mandatory")
    private String projectName;

    @NotBlank(message = "version is mandatory")
    private String version;
    @NotBlank(message = "model variant is mandatory")
    private String modelVariant;

    @NotEmpty(message = "at least one product is mandatory")
    private List<ProductOfProject> products;

    public String getProjectName() {
        return projectName;
    }
    public String getModelVariant() {
        return modelVariant;
    }
    public String getVersion() {
        return version;
    }

    public List<ProductOfProject> getProducts() {
        return products;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        MultiProducts that = (MultiProducts) o;

        if (!Objects.equals(projectName, that.projectName)) return false;
        if (!Objects.equals(modelVariant, that.modelVariant)) return false;
        if (!Objects.equals(version, that.version)) return false;
        return Objects.equals(products, that.products);
    }

    @Override
    public int hashCode() {
        int result = projectName != null ? projectName.hashCode() : 0;
        result = 31 * result + (products != null ? products.hashCode() : 0);
        result = 31 * result + (modelVariant != null ? modelVariant.hashCode() : 0);
        result = 31 * result + (version != null ? version.hashCode() : 0);
        return result;
    }
}
