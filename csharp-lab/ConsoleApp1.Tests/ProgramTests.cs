using System;
using System.IO;
using Xunit;
using ConsoleApp1;

namespace ConsoleApp1.Tests
{
    public class ProgramTests
    {
        [Fact]
        public void Main_ShouldOutputHelloWorldToConsole()
        {
            var originalOut = Console.Out;
            using var stringWriter = new StringWriter();
            Console.SetOut(stringWriter);

            try
            {
                Program.Main(new string[] { });

                var output = stringWriter.ToString().Trim();
                Assert.Equal("Hello, World!", output);
            }
            finally
            {
                Console.SetOut(originalOut);
            }
        }
    }
}
