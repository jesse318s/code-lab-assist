"""
Simple POML Renderer

Renders the default POML prompt with context variables.
"""

from pathlib import Path
import json
import poml

def main():
    """Render the default POML prompt."""
    prompt_file = "prompt.poml"
    context_file = "prompt_context.json"

    if not Path(prompt_file).exists():
        print(f"Prompt file {prompt_file} not found.")
        return

    context = {}

    if Path(context_file).exists():
        try:
            with open(context_file, 'r') as f:
                context = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error parsing context file: {e}")
            context = {}

    try:
        messages = poml.poml(prompt_file, context=context)
        rendered_content = "\n".join([msg['content'] for msg in messages])

        print(rendered_content)
    except Exception as e:
        print(f"Error rendering POML: {e}")

if __name__ == "__main__":
    main()
