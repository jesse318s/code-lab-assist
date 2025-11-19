import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class AppTest {
    @Test
    public void testExample() throws Exception {
        ByteArrayOutputStream outContent = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;

        System.setOut(new PrintStream(outContent));

        try {
            App.main(new String[] {});
            assertEquals("Hello World!", outContent.toString().trim());
        } finally {
            System.setOut(originalOut);
        }
    }
}
