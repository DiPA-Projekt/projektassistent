package online.projektassistent.server.rest;

import online.projektassistent.server.model.MultiProducts;
import online.projektassistent.server.model.SingleProduct;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import javax.validation.Valid;
import java.io.IOException;

@RestApiController
public interface ProductController {

    /**
     * Creates a single product and returns a docx file.
     *
     * @param singleProduct container for all parameters
     * @return doxc
     */

    @CrossOrigin(origins = "http://localhost:8080")
    @PostMapping("/product")
    ResponseEntity<Resource> product(@RequestBody @Valid @NonNull SingleProduct singleProduct) throws IOException;

    /**
     * Creates multiple products for one project and returns a zip file.
     *
     * @param multiProducts container for all parameters
     * @return zip file
     */
    @CrossOrigin(origins = "http://localhost:8080")
    @PostMapping("/products")
    ResponseEntity<Resource> products(@RequestBody @Valid @NonNull MultiProducts multiProducts) throws IOException;

    @GetMapping("/example")
    String generateExample();
}
