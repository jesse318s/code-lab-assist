import { printHelloWorld } from "./index";

test('printHelloWorld function outputs "Hello World!" to console', () => {
  const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  printHelloWorld();
  expect(consoleSpy).toHaveBeenCalledWith("Hello World!");
  consoleSpy.mockRestore();
});
