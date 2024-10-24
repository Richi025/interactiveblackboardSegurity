package co.edu.escuelaing.interactiveblackboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DrawingServiceController {
    @GetMapping(value = "/status", produces = "application/json")
    public String status() {
        return "{\"status\":\"Greetings from Spring Boot. "
                + java.time.LocalDate.now() + ", "
                + java.time.LocalTime.now()
                + ". " + "The server is Running!\"}";
    }
}
