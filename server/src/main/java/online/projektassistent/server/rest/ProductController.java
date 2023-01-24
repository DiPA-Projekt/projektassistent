package online.projektassistent.server.rest;

import javax.validation.Valid;

import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import online.projektassistent.server.model.SingleProduct;

@RestApiController
public interface ProductController {

    @PostMapping("/product")
    ResponseEntity<Resource> product(@RequestBody @Valid @NonNull SingleProduct singleProduct);

    @GetMapping("/example")
    String generateExample();
}
