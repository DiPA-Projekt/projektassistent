package online.projektassistent.server.rest;

import online.dipa.projektassistent.openapi.api.StatusApi;
import online.dipa.projektassistent.openapi.model.Status;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class StatusController implements StatusApi {

    @Override
    public ResponseEntity<Status> getStatus() {
        return new ResponseEntity<>(new Status(), HttpStatus.OK);
    }

}
