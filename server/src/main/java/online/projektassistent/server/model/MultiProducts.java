package online.projektassistent.server.model;

import java.util.List;
import java.util.Objects;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

@SuppressWarnings("unused")
public class MultiProducts {

    @NotBlank(message = "projectName is mandatory")
    private String projectName;

    @NotEmpty(message = "at least one product is mandatory")
    private List<ProductOfProject> products;

    public String getProjectName() {
        return projectName;
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
        return Objects.equals(products, that.products);
    }

    @Override
    public int hashCode() {
        int result = projectName != null ? projectName.hashCode() : 0;
        result = 31 * result + (products != null ? products.hashCode() : 0);
        return result;
    }
}
