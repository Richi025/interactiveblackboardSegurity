package co.edu.escuelaing.interactiveblackboard;

import java.io.IOException;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import jakarta.websocket.OnClose;
import jakarta.websocket.OnError;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@Component
@ServerEndpoint("/bbService")
public class BBEndpoint {
    private static final Logger logger = LoggerFactory.getLogger(BBEndpoint.class);
    /* Queue for all open WebSocket sessions */
    static Queue<Session> queue = new ConcurrentLinkedQueue<>();
    Session ownSession = null;

    /* Call this method to send a message to all clients */
    public void send(String msg) {
        try {
            /* Send updates to all open WebSocket sessions */
            for (Session session : queue) {
                if (!session.equals(this.ownSession)) {
                    session.getBasicRemote().sendText(msg);
                }
                logger.info("Sent: {}", msg);
            }
        } catch (IOException e) {
            logger.error("Error sending message: {}", e.toString());
        }
    }

    @OnMessage
    public void processPoint(String message, Session session) {
        logger.info("Point received: {}. From session: {}", message, session);
        this.send(message);
    }

    @OnOpen
    public void openConnection(Session session) {
        /* Register this connection in the queue */
        queue.add(session);
        ownSession = session;
        logger.info("Connection opened.");
        try {
            session.getBasicRemote().sendText("Connection established.");
        } catch (IOException ex) {
            logger.error("Error during connection establishment: {}", ex.toString());
        }
    }

    @OnClose
    public void closedConnection(Session session) {
        /* Remove this connection from the queue */
        queue.remove(session);
        logger.info("Connection closed.");
    }

    @OnError
public void error(Session session, Throwable t) {
    // Check if the session is open before processing the error
    if (session.isOpen()) {
        queue.remove(session);
        
        // Use static string formatting to avoid unnecessary evaluation
        String errorMessage = String.format("Connection error: %s", t.toString());
        logger.error(errorMessage);
    } else {
        // Log a warning with a pre-computed message
        logger.warn("Session is not open. No action taken for error: {}", t.getMessage());
    }
}

}
