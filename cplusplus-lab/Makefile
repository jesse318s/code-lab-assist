CXX = g++
CXXFLAGS = -g -Wall -std=c++11

SRCS := $(wildcard *.cpp)
OBJS := $(SRCS:.cpp=.o)
HEADERS := $(wildcard *.h)
TARGET = program.exe

$(TARGET): $(OBJS)
	$(CXX) $(OBJS) -o $(TARGET)
	@if errorlevel 1 exit 1

%.o: %.cpp $(HEADERS)
	$(CXX) $(CXXFLAGS) -c $< -o $@
	@if errorlevel 1 exit 1

.PHONY: clean run

clean:
	@echo Cleaning up...
	-del /Q *.o $(TARGET)
	@if errorlevel 1 echo "Error occurred during cleanup"

run: $(TARGET)
	@echo Running $(TARGET)...
	./$(TARGET)
	@if errorlevel 1 echo "Error occurred during execution"