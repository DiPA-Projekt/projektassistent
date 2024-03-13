package online.projektassistent.server.rest;

import online.projektassistent.server.model.MultiProducts;
import online.projektassistent.server.model.SingleProduct;
import online.projektassistent.server.util.FileUtil;
import online.projektassistent.server.util.ProductBuilder;
import org.apache.poi.common.usermodel.PictureType;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;
import org.springframework.util.ResourceUtils;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;

import javax.imageio.ImageIO;
import javax.validation.Valid;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Controller
public class ProductControllerImpl implements ProductController {

    public String generateExample() {
        try (XWPFDocument doc = new XWPFDocument()) {

            XWPFParagraph p1 = doc.createParagraph();
            p1.setAlignment(ParagraphAlignment.CENTER);
            p1.setBorderBottom(Borders.DOUBLE);
            p1.setBorderTop(Borders.DOUBLE);

            p1.setBorderRight(Borders.DOUBLE);
            p1.setBorderLeft(Borders.DOUBLE);
            p1.setBorderBetween(Borders.SINGLE);

            p1.setVerticalAlignment(TextAlignment.TOP);

            XWPFRun r1 = p1.createRun();
            r1.setBold(true);
            r1.setText("The quick brown fox");
            r1.setBold(true);
            r1.setFontFamily("Courier");
            r1.setUnderline(UnderlinePatterns.DOT_DOT_DASH);
            r1.setTextPosition(100);

            XWPFParagraph p2 = doc.createParagraph();
            p2.setAlignment(ParagraphAlignment.RIGHT);

            //BORDERS
            p2.setBorderBottom(Borders.DOUBLE);
            p2.setBorderTop(Borders.DOUBLE);
            p2.setBorderRight(Borders.DOUBLE);
            p2.setBorderLeft(Borders.DOUBLE);
            p2.setBorderBetween(Borders.SINGLE);

            XWPFRun r2 = p2.createRun();
            r2.setText("jumped over the lazy dog");
            r2.setStrikeThrough(true);
            r2.setFontSize(20);

            XWPFRun r3 = p2.createRun();
            r3.setText("and went away");
            r3.setStrikeThrough(true);
            r3.setFontSize(20);
            r3.setSubscript(VerticalAlign.SUPERSCRIPT);

            // hyperlink
            XWPFHyperlinkRun hyperlink = p2.insertNewHyperlinkRun(0, "http://poi.apache.org/");
            hyperlink.setUnderline(UnderlinePatterns.SINGLE);
            hyperlink.setColor("0000ff");
            hyperlink.setText("Apache POI");

            XWPFParagraph p3 = doc.createParagraph();
            p3.setWordWrapped(true);
            p3.setPageBreak(true);

            //p3.setAlignment(ParagraphAlignment.DISTRIBUTE);
            p3.setAlignment(ParagraphAlignment.BOTH);
            p3.setSpacingBetween(15, LineSpacingRule.EXACT);

            p3.setIndentationFirstLine(600);


            XWPFRun r4 = p3.createRun();
            r4.setTextPosition(20);
            r4.setText("To be, or not to be: that is the question: "
                    + "Whether 'tis nobler in the mind to suffer "
                    + "The slings and arrows of outrageous fortune, "
                    + "Or to take arms against a sea of troubles, "
                    + "And by opposing end them? To die: to sleep; ");
            r4.addBreak(BreakType.PAGE);
            r4.setText("No more; and by a sleep to say we end "
                    + "The heart-ache and the thousand natural shocks "
                    + "That flesh is heir to, 'tis a consummation "
                    + "Devoutly to be wish'd. To die, to sleep; "
                    + "To sleep: perchance to dream: ay, there's the rub; "
                    + ".......");
            r4.setItalic(true);
//This would imply that this break shall be treated as a simple line break, and break the line after that word:

            XWPFRun r5 = p3.createRun();
            r5.setTextPosition(-10);
            r5.setText("For in that sleep of death what dreams may come");
            r5.addCarriageReturn();
            r5.setText("When we have shuffled off this mortal coil, "
                    + "Must give us pause: there's the respect "
                    + "That makes calamity of so long life;");
            r5.addBreak();
            r5.setText("For who would bear the whips and scorns of time, "
                    + "The oppressor's wrong, the proud man's contumely,");

            r5.addBreak(BreakClear.ALL);
            r5.setText("The pangs of despised love, the law's delay, "
                    + "The insolence of office and the spurns " + ".......");

            File file = ResourceUtils.getFile("classpath:snowboarder.jpg");
            try (FileInputStream fileInputStream = new FileInputStream(file)) {
                XWPFRun imageRun = p3.createRun();
                BufferedImage bimg1 = ImageIO.read(file);
                int width = bimg1.getWidth();
                int height = bimg1.getHeight();
                imageRun.addPicture(fileInputStream, PictureType.JPEG, "snowboarder.jpg", Units.toEMU(width), Units.toEMU(height));
            }

            try (FileOutputStream out = new FileOutputStream("example.docx")) {
                doc.write(out);
            }
        } catch (IOException | InvalidFormatException e) {
            throw new RuntimeException(e);
        }
        return "success";
    }

    @Override
    public ResponseEntity<Resource> product(@Valid @NonNull SingleProduct singleProduct) throws IOException {

        ProductBuilder builder = new ProductBuilder();
        byte[] productBytes = builder.createSingleProduct(singleProduct);

        return createResponse(productBytes, FileUtil.sanitizeFilename(singleProduct.getProductName()) + ".docx");
    }

    @Override
    public ResponseEntity<Resource> products(@Valid @NonNull MultiProducts multiProducts) throws IOException {

        ProductBuilder builder = new ProductBuilder();
        Path zipFile = builder.createMultipleProducts(multiProducts);

        return createResponse(zipFile, FileUtil.sanitizeFilename(multiProducts.getProjectName()) + "_products.zip");
    }

    /**
     * Writes document to a new resource and creates response
     *
     * @param fileContent      file content for the response
     * @param downloadFilename filename used in response
     * @return response
     */
    private ResponseEntity<Resource> createResponse(byte[] fileContent, String downloadFilename) {
        ByteArrayResource byteArrayResource = new ByteArrayResource(fileContent);
        HttpHeaders header = getHttpHeaders(downloadFilename);

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(fileContent.length)
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(byteArrayResource);
    }

    /**
     * Creates response for an existing path
     *
     * @param path             path to file of the response
     * @param downloadFilename filename used in response
     * @return response
     */
    private ResponseEntity<Resource> createResponse(Path path, String downloadFilename) throws IOException {
        FileSystemResource fileResource = new FileSystemResource(path);
        HttpHeaders header = getHttpHeaders(downloadFilename);

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(fileResource.contentLength())
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(fileResource);
    }

    private HttpHeaders getHttpHeaders(String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");

        List<String> customHeaders = new ArrayList<String>();
        customHeaders.add("Content-Disposition");
        headers.setAccessControlExposeHeaders(customHeaders);

        return headers;
    }

    /**
     * Handle validation exceptions to create error response
     *
     * @param ex validation exception
     * @return map containing invalid field names and error messages
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

    /**
     * Handle IOExceptions to create error response
     *
     * @param ex IOExceptions
     * @return error message of IOException
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(IOException.class)
    public Map<String, String> handleIOExceptions(IOException ex) {
        ex.printStackTrace();

        Map<String, String> errors = new HashMap<>();
        errors.put("IOException", ex.getMessage());
        return errors;
    }
}
