import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class AppTest {
    
    public static void main(String[] args) {
        boolean testPassed = testHelloWorld();
        
        System.out.println(testPassed ? "PASS - Hello World test passed" : "FAIL - Hello World test failed");
    }
    
    public static boolean testHelloWorld() {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintStream originalOut = System.out;
        System.setOut(new PrintStream(outputStream));
        
        try {
            App.main(new String[]{});
            
            String output = outputStream.toString();

            return output.contains("Hello World!");
        } catch (Exception e) {
            System.err.println("Exception thrown during test: " + e.getMessage());
            return false;
        } finally {
            System.setOut(originalOut);
        }
    }
}
