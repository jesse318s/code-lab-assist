CC = gcc
CFLAGS = -Wall -std=c11

SRCS := $(wildcard *.c)
OBJS := $(SRCS:.c=.o)
HEADERS := $(wildcard *.h)
TARGET = program.exe

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET)
	@if errorlevel 1 exit 1

%.o: %.c $(HEADERS)
	$(CC) $(CFLAGS) -c $< -o $@
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