"""
Clean POML Renderer Script

Renders POML prompts with context variables and outputs the result.
"""

import poml
import json
import sys
from pathlib import Path


def load_context(context_file):
    """Load context variables from JSON file."""
    try:
        with open(context_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Context file {context_file} not found.")
        return {}
    except json.JSONDecodeError as e:
        print(f"Error parsing context file: {e}")
        return {}


def render_poml(prompt_file, context):
    """Render POML prompt with given context."""
    try:
        messages = poml.poml(prompt_file, context=context)
        return "\n".join([msg['content'] for msg in messages])
    except Exception as e:
        print(f"Error rendering POML: {e}")
        return None


def save_output(rendered_content, output_file=None):
    """Save rendered content to file or print to stdout."""
    if output_file:
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(rendered_content)
            print(f"Rendered content saved to {output_file}")
        except Exception as e:
            print(f"Error saving to file: {e}")
            print("Outputting to stdout instead:")
            print(rendered_content)
    else:
        print(rendered_content)


def main():
    """Main function."""
    # Default values
    prompt_file = "prompt.poml"
    context_file = "prompt_context.json"
    output_file = None
    
    # Parse command line arguments
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "-p" or args[i] == "--prompt":
            if i + 1 < len(args):
                prompt_file = args[i + 1]
                i += 1
        elif args[i] == "-c" or args[i] == "--context":
            if i + 1 < len(args):
                context_file = args[i + 1]
                i += 1
        elif args[i] == "-o" or args[i] == "--output":
            if i + 1 < len(args):
                output_file = args[i + 1]
                i += 1
        elif args[i] == "-h" or args[i] == "--help":
            print("Usage: python poml_renderer.py [options]")
            print("Options:")
            print("  -p, --prompt FILE      POML prompt file (default: prompt.poml)")
            print("  -c, --context FILE     Context JSON file (default: prompt_context.json)")
            print("  -o, --output FILE      Output file (default: stdout)")
            print("  -h, --help             Show this help message")
            return
        else:
            # Legacy positional arguments
            if i == 0:
                prompt_file = args[i]
            elif i == 1:
                context_file = args[i]
            elif i == 2:
                output_file = args[i]
        i += 1
    
    # Check if prompt exists
    if not Path(prompt_file).exists():
        print(f"Prompt file {prompt_file} not found.")
        sys.exit(1)
    
    # Load context
    print(f"Loading context from {context_file}...")
    context = load_context(context_file)
    
    # Render POML
    print(f"Rendering POML prompt {prompt_file}...")
    rendered = render_poml(prompt_file, context)
    
    if not rendered:
        print("Failed to render POML prompt.")
        sys.exit(1)
    
    # Output result
    save_output(rendered, output_file)


if __name__ == "__main__":
    main()
