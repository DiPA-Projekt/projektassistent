package online.projektassistent.server.rest;

import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import online.projektassistent.server.model.Product;

@RestApiController
public interface ProductController {

    @PostMapping("/test")
    String test(@RequestBody @NonNull Product product);

    @GetMapping("/example")
    String generateExample();
}
