# POML Renderer Usage Guide

## Overview
The `poml_renderer.py` script provides a clean way to render POML prompts with context variables and output the result.

## Usage

### Basic Usage
```bash
python poml_renderer.py
```
Uses default files: `prompt.poml` and `prompt_context.json`, outputs to stdout

### Custom Prompt
```bash
python poml_renderer.py -t my_prompt.poml
```
Uses custom prompt with default context file

### Custom Prompt and Context
```bash
python poml_renderer.py -t my_prompt.poml -c my_context.json
```

### Save to File
```bash
python poml_renderer.py -o output.txt
```
Saves rendered output to file instead of stdout

### Help
```bash
python poml_renderer.py --help
```

## Command Line Options

- `-t, --prompt FILE` - POML prompt file (default: prompt.poml)
- `-c, --context FILE` - Context JSON file (default: prompt_context.json)  
- `-o, --output FILE` - Output file (default: stdout)
- `-h, --help` - Show help message

## Features

✅ **Clean modular design** with separate functions for each step
✅ **Error handling** for missing files and parsing errors  
✅ **Flexible command line interface** with both named and positional arguments
✅ **File output support** - save to file or print to stdout
✅ **Clear status messages** showing progress
✅ **Robust POML rendering** with proper variable substitution

## Key Functions

- `load_context()` - Loads JSON context variables
- `render_poml()` - Renders POML prompt with context
- `save_output()` - Saves to file or prints to stdout
- `main()` - Orchestrates the entire workflow

## File Structure

```
project/
├── poml_renderer.py          # Main renderer script
├── prompt.poml               # POML prompt
├── prompt_context.json       # Context variables
└── output.txt                # Optional output file
```

## Context File Format

```json
{
  "lab_language": "Python",
  "difficulty": "advanced",
  "topic": "data_structures"
}
```

## POML Prompt Format

Uses `{{variable}}` syntax for substitution:
```xml
<p>{{lab_language}}</p>
<p>{{difficulty}}</p>
<p>{{topic}}</p>
```

## Example Output

The script will render the POML prompt with all variables substituted and output the final content, ready for use with any AI system or manual processing.
