---
name: poml-syntax
description: Use complete and proper POML markup syntax for creating POML prompts
---

Read this entire POML syntax reference.

POML Basic Syntax¶
Estimated time to read: 2 minutes

POML (Prompt Orchestration Markup Language) provides a convenient way to create prompts using a markup language that is easy to read and write. The standalone file mode is the most commonly used approach, where you create a file with a .poml extension. This file contains XML-like syntax that POML renders into a prompt. This mode is particularly useful for creating reusable templates and managing complex prompts without embedding POML directly in JSX files or using a Python SDK.

In this mode, you wrap your content with a top-level <poml> tag, allowing POML to parse and render your markup correctly. Below is a guide on how to effectively use the standalone file mode.

To create a POML file, simply create a file with the .poml extension and wrap your content within the <poml> tag:


<poml>
  <p>Hello, world!</p>
</poml>
You can also type anything without a poml tag, and it will be treated as a string. It's called "free text mode" in POML. However, it has several limitations currently, including unabling to render any XML tags wrapped with <>, unabling to use many special characters, and unabling to use all the wonderful features of POML. So, it's always recommended to use the poml tag before everything.

Tip: Glossary for Beginners:

Tag: A tag is a fundamental building block in XML (and POML). It's used to mark the beginning and end of an element. Tags are enclosed in angle brackets (< and >). For example, <p> is an opening tag, and </p> is a closing tag. Everything between the opening and closing tags is considered part of that element.
Attribute: An attribute provides additional information about an element. Attributes are placed inside the opening tag, and they consist of a name and a value (enclosed in double quotes). For example, in <p speaker="human">, speaker is the attribute name, and "human" is the attribute value.
Content: The content is the text or other elements that appear between the opening and closing tags of an element. For example, in <p>Hello, world!</p>, "Hello, world!" is the content of the <p> element.
Escape Characters: In POML, you can use escape characters to include special characters in your content and attribute values. Due to an implementation issue, the escape syntax in POML is slightly different from what you would know in HTML or XML. For example, to include a double quote (") in your content, you can use #quot; (rather than &quot;). Here are some common escape characters:

#quot; for "
#apos; for '
#amp; for &
#lt; for <
#gt; for >
#hash; for #
#lbrace; for {
#rbrace; for }
It's not necessary to use the escape characters for most cases, but they can be helpful when you are having trouble displaying those characters in certain cases.


Template Engine¶
Estimated time to read: 5 minutes

The template engine of POML allows you to incorporate dynamic content and control structures. Here are some key features.

Expressions¶
You can use expressions enclosed in double curly brackets ({{ }}) to evaluate variables or expressions dynamically:


<poml>
  <p>Hello, {{name}}!</p>
</poml>
In this example, if name is set to "Alice" (e.g., using a <let> tag, described below), the output will be "Hello, Alice!".

Usage in Attributes¶
Expressions can also be used within attribute values:


<poml>
  <task caption="Task #{{index}}">This is task No. {{index}}.</p>
</poml>
This renders to the following when index is set to 1.


# Task #1

This is task No. 1.
Expression Usages¶
POML supports various JavaScript expressions within the double curly brackets. This includes but is not limited to:

Variables: {{variableName}}
Arithmetic: {{a + b}}, {{x * y}}, {{count / total}}
String Concatenation: {{firstName + " " + lastName}}
Array Access: {{myArray[0]}}
Object Property Access: {{myObject.propertyName}}
Function Calls: {{myFunction(arg1, arg2)}} (if myFunction is defined in the context)
Ternary Operators: {{condition ? valueIfTrue : valueIfFalse}}
Accessing loop variables: {{loop.index}} (explained in the "For Attribute" section)
Let Expressions¶
The <let> tag allows you to define variables, import data from external files, and set values within your POML template.

Syntax 1: Setting a variable from a value¶

<poml>
  <let name="greeting">Hello, world!</let>
  <p>{{greeting}}</p>
</poml>
This will output "Hello, world!". When using the content approach (as shown above), the text is treated as a literal string.

Alternatively, you can use the value attribute which must contain an evaluatable JavaScript expression:


<poml>
  <let name="greeting" value="'Hello, world!'" />
  <p>{{greeting}}</p>
</poml>
Note that when using the value attribute, string literals must be properly quoted (e.g., "'Hello, world!'" or '"Hello, world!"') since the value is evaluated as JavaScript. The value attribute can contain strings, numbers, arrays, objects, or any valid JavaScript expression.

Syntax 2: Importing data from a file¶

<poml>
  <let name="users" src="users.json" />
  <p>First user: {{users[0].name}}</p>
</poml>
This imports the contents of users.json and assigns it to the users variable. The src attribute specifies the path to the file (relative to the POML file). The optional type attribute can specify the file type (e.g., "json", "text", "csv"). If not provided, POML attempts to infer it from the file extension.

Syntax 3: Importing data from a file without a name¶

<poml>
  <let src="config.json" />
  <p>API Key: {{apiKey}}</p>
</poml>
If config.json contains { "apiKey": "your_api_key" }, this will output "API Key: your_api_key". When you use src without name, and the file content is a JSON object, the properties of that object are directly added to the context.
Syntax 4: Setting a variable using inline JSON¶

<poml>
  <let name="person">
    {
      "name": "Alice",
      "age": 30
    }
  </let>
  <p>Name: {{person.name}}, Age: {{person.age}}</p>
</poml>
This defines a person variable with the given JSON object. You can also specify the type attribute:


<poml>
  <let name="count" type="integer">5</let>
  <p>Count: {{count}}</p>
</poml>
Syntax 5: Setting a variable from an expression¶

<poml>
  <let name="base" value="10" />
  <let name="increment" value="5" />
  <let name="total" value="{{ base + increment }}" />
  <p>Total: {{ total }}</p>  <!-- Output: Total: 15 -->
</poml>
Type-Autocasting in Attributes¶
The attributes of components will be automatically cast based on their defined types in the component documentation. This means you don't have to worry about manually converting types in many cases.

Boolean: If an attribute is defined as a boolean, values like "true", 1, "1", or {{true}} will be cast to the boolean value true. Similarly, "false", 0, "0", or {{false}} will be cast to false.
Number: If an attribute is defined as a number, values like "123", 45.6, {{anyNumber}} or {{myNumber+1.3}} will be cast to their corresponding numeric values.
Object: If an attribute is defined as an object, POML will attempt to parse the attribute value as a JSON string. For example, data="{{{name: 'John', age: 30}}}" or data='{"name":"John","age":30}' will be parsed into the corresponding JavaScript object.
String: If an attribute is a string, no casting is performed.
In the following example, the first auto-casting happened at let, where true is converted to boolean at let expression.


<poml>
  <let name="boolVar" type="boolean" value="true"/>
  <let name="numVar" type="number" value="42"/>
  <let name="objVar" type="object" value="{{ { key: 'value' } }}"/>

  <MyComponent boolProp="{{boolVar}}" numProp="{{numVar}}" objProp="{{objVar}}" stringProp="hello"/>
</poml>
If MyComponent is defined with boolProp as boolean, numProp as number, objProp as object, and stringProp as string, the values will be interpreted and auto-casted again when MyComponent is used.

For Attribute¶
To loop over a list, use the for attribute. The syntax is for="itemName in listName".


<poml>
  <list>
    <item for="item in ['apple', 'banana', 'cherry']">{{item}}</item>
  </list>
</poml>
This will render a list with "apple", "banana", and "cherry".

Loop Variables¶
Inside the loop, you have access to special loop variables:

loop.index: The current iteration index (starting from 0).
loop.length: The total number of items in the list.
loop.first: true if it's the first iteration, false otherwise.
loop.last: true if it's the last iteration, false otherwise.
Example:


<poml>
<let name="all_demos" value='[
    { "input": "What is your name?", "output": "My name is POML." },
    { "input": "What can you do?", "output": "I can generate prompts." }
]'/>
  <examples>
    <example for="example in all_demos" chat="false" caption="Example {{ loop.index + 1 }}" captionStyle="header">
      <input>{{ example.input }}</input>
      <output>{{ example.output }}</output>
    </example>
  </examples>
</poml>
This will generate two examples, with captions "Example 1" and "Example 2", displaying the input and output from each demo in the all_demos array. Note that we use loop.index + 1 because loop.index starts from 0.

If Condition¶
You can conditionally render elements using the if attribute:


<poml>
  <let name="isVisible" value="true"/>
  <let name="isHidden" value="{{ !isVisible }}"/>
  <p if="isVisible">This paragraph is visible.</p>
  <p if="isHidden">This paragraph is hidden.</p>
</poml>
If isVisible is true, the first paragraph will be rendered. The second paragraph will not be rendered because isHidden is false. The value of if can be a simple variable name (which is treated as a boolean) or a POML expression.

Include Files¶
You can split prompts into multiple files and include them using the <include> tag.


<poml>
  <include src="snippet.poml" />
</poml>
The file specified in src is read and its contents are injected as if they were written in place. Variables from the current context are available inside the included file. The for and if attributes work as expected:


<poml>
  <include src="row.poml" for="i in [1,2,3]" />
  <include src="footer.poml" if="showFooter" />
</poml>


Basic Components¶
Audio¶
Audio (<audio>) embeds an audio file in the content.

Accepts either a file path (src) or base64-encoded audio data (base64). The MIME type can be provided via type or will be inferred from the file extension.

Usages¶
<Audio src="path/to/audio.mp3" />
Parameters¶
src: Path to the audio file. If provided, the file will be read and encoded as base64.
base64: Base64-encoded audio data. Cannot be used together with src.
alt: The alternative text to show when the image cannot be displayed.
type: The MIME type of the audio (e.g., audio/mpeg, audio/wav). If not specified, it will be inferred from the file extension. The type must be consistent with the real type of the file. The consistency will NOT be checked or converted. The type can be specified with or without the audio/ prefix.
position: Can be one of: top, bottom, here. The position of the image. Default is here.
syntax: Can be one of: markdown, html, json, yaml, xml, multimedia. Only when specified as multimedia, the image will be shown. Otherwise, the alt text will be shown. By default, it's multimedia when alt is not specified. Otherwise, it's undefined (inherit from parent).
Bold¶
Bold (<b>) emphasizes text in a bold style when using markup syntaxes.

Usages¶
<p><b>Task:</b> Do something.</p>
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
CaptionedParagraph¶
CaptionedParagraph (<cp> for short) creates a paragraph with a customized caption title.

Usages¶
<cp caption="Constraints">
  <list>
    <item>Do not exceed 1000 tokens.</item>
    <item>Please use simple words.</item>
  </list>
</cp>
Parameters¶
caption: The title or label for the paragraph. Required.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. By default, it's same as caption.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is header.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionEnding: Can be one of: colon, newline, colon-newline, none. A caption can ends with a colon, a newline or simply nothing. If not specified, it defaults to colon for bold or plain captionStyle, and none otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Code¶
Code is used to represent code snippets or inline code in markup syntaxes.

Usages¶
<code inline="true">const x = 42;</code>
<code lang="javascript">
const x = 42;
</code>
Parameters¶
inline: Boolean. Whether to render code inline or as a block. Default is true.
lang: The language of the code snippet.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Header¶
Header (<h>) renders headings in markup syntaxes. It's commonly used to highlight titles or section headings. The header level will be automatically computed based on the context. Use SubContent (<section>) for nested content.

Usages¶
<Header syntax="markdown">Section Title</Header>
Parameters¶
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Inline¶
Inline (<span>) is a container for inline content. When used with markup syntaxes, it wraps text in an inline style, without any preceding or following blank characters. In serializer syntaxes, it's treated as a generic value. Inline elements are not designed to be used alone (especially in serializer syntaxes). One might notice problematic renderings (e.g., speaker not applied) when using it alone.

Usages¶
<p>I'm listening to <span>music</span> right now.</p>
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Italic¶
Italic (<i>) emphasizes text in an italic style when using markup syntaxes.

Usages¶
Your <i>italicized</i> text.
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
List¶
List (<list>) is a container for multiple ListItem (<item>) elements. When used with markup syntaxes, a bullet or numbering is added.

Usages¶
<list listStyle="decimal">
  <item>Item 1</item>
  <item>Item 2</item>
</list>
Parameters¶
listStyle: Can be one of: star, dash, plus, decimal, latin. The style for the list marker, such as dash or star. Default is dash.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
ListItem¶
ListItem (<item>) is an item within a List component. In markup mode, it is rendered with the specified bullet or numbering style.

Usages¶
<list listStyle="decimal">
  <item blankLine="true">Item 1</item>
  <item>Item 2</item>
</list>
Parameters¶
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Newline¶
Newline (<br>) explicitly adds a line break, primarily in markup syntaxes. In serializer syntaxes, it's ignored.

Usages¶
<br />
Parameters¶
newLineCount: Number. The number of linebreaks to add.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Paragraph¶
Paragraph (<p>) is a standalone section preceded by and followed by two blank lines in markup syntaxes. It's mostly used for text contents.

Usages¶
<p>Contents of the paragraph.</p>
Parameters¶
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Strikethrough¶
Strikethrough (<s>, <strike>) indicates removed or invalid text in markup syntaxes.

Usages¶
<s>This messages is removed.</s>
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
SubContent¶
SubContent (<section>) renders nested content, often following a header. The headers within the section will be automatically adjusted to a lower level.

Usages¶
<h>Section Title</h>
<section>
  <h>Sub-section Title</h>  <!-- Nested header -->
  <p>Sub-section details</p>
</section>
Parameters¶
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Text¶
Text (<text>, <poml>) is a wrapper for any contents. By default, it uses markdown syntax and writes the contents within it directly to the output. When used with "markup" syntaxes, it renders a standalone section preceded and followed by one blank line. It's mostly used in the root element of a prompt, but it should also work in any other places. This component will be automatically added as a wrapping root element if it's not provided: 1. If the first element is pure text contents, <poml syntax="text"> will be added. 2. If the first element is a POML component, <poml syntax="markdown"> will be added.

Usages¶
<poml syntax="text">
Contents of the whole prompt.

1. Your customized list.
2. You don't need to know anything about POML.
</poml>
To render the whole prompt in markdown syntax with a "human" speaker:

<poml syntax="markdown" speaker="human">
  <p>You are a helpful assistant.</p>
  <p>What is the capital of France?</p>
</poml>
Experimental usage with limits and priority:

<poml syntax="markdown" tokenLimit="10">
  <p priority="1">This has lower priority and may be truncated first.</p>
  <p priority="3">This has higher priority and will be preserved longer.</p>
</poml>
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Underline¶
Underline (<u>) draws a line beneath text in markup syntaxes.

Usages¶
This text is <u>underlined</u>.
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Intentions¶
Example¶
Example is useful for providing a context, helping the model to understand what kind of inputs and outputs are expected. It can also be used to demonstrate the desired output style, clarifying the structure, tone, or level of detail in the response.

Usages¶
<example>
  <input>What is the capital of France?</input>
  <output>Paris</output>
</example>
<task>Summarize the following passage in a single sentence.</task>
<example>
  <input caption="Passage">The sun provides energy for life on Earth through processes like photosynthesis.</input>
  <output caption="Summary">The sun is essential for energy and life processes on Earth.</output>
</example>
Parameters¶
caption: The title or label for the example paragraph. Default is Example.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is example.
captionStyle: Determines the style of the caption, applicable only for "markup" syntaxes. Default is hidden. Options include header, bold, plain, or hidden.
chat: Boolean. Indicates whether the example should be rendered in chat format. When used in a example set (<examples>), this is inherited from the example set. Otherwise, it defaults to false for "serializer" syntaxes and true for "markup" syntaxes.
captionTextTransform: Specifies text transformation for the caption, applicable only for "markup" syntaxes. Options are upper, lower, capitalize, or none. Default is none.
captionColon: Boolean. Indicates whether to append a colon after the caption. By default, this is true for bold or plain captionStyle, and false otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
ExampleInput¶
ExampleInput (<input>) is a paragraph that represents an example input. By default, it's spoken by a human speaker in a chat context, but you can manually specify the speaker.

Usages¶
<input>What is the capital of France?</input>
When used with a template:

<input>What is the capital of {{country}}?</input>
Parameters¶
caption: The title or label for the example input paragraph. Default is Input.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is input.
speaker: The speaker for the example input. Default is human if chat context is enabled (see <example>).
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is hidden if chat context is enabled. Otherwise, it's bold.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionColon: Boolean. Indicates whether to append a colon after the caption. By default, this is true for bold or plain captionStyle, and false otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
ExampleOutput¶
ExampleOutput (<output>) is a paragraph that represents an example output. By default, it's spoken by a AI speaker in a chat context, but you can manually specify the speaker.

Usages¶
<output>The capital of France is Paris.</output>
When used with a template:

<output>The capital of {{country}} is {{capital}}.</output>
Parameters¶
caption: The title or label for the example output paragraph. Default is Output.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is output.
speaker: The speaker for the example output. Default is ai if chat context is enabled (see <example>).
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is hidden if chat context is enabled. Otherwise, it's bold.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionColon: Boolean. Indicates whether to append a colon after the caption. By default, this is true for bold or plain captionStyle, and false otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
ExampleSet¶
Example set (<examples>) is a collection of examples that are usually presented in a list. With the example set, you can manage multiple examples under a single title and optionally an introducer, as well as the same chat format. You can also choose to use <example> purely without example set.

Usages¶
<examples chat={{true}}>
  <example>
    <input>What is the capital of France?</input>
    <output>Paris</output>
  </example>
  <example>
    <input>What is the capital of Germany?</input>
    <output>Berlin</output>
  </example>
</examples>
Parameters¶
caption: The title or label for the example set paragraph. Default is Examples.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is examples.
chat: Boolean. Indicates whether the examples should be rendered in chat format. By default, it's true for "markup" syntaxes and false for "serializer" syntaxes.
introducer: An optional introducer text to be displayed before the examples. For example, Here are some examples:.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is header.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionEnding: Can be one of: colon, newline, colon-newline, none. A caption can ends with a colon, a newline or simply nothing. If not specified, it defaults to colon for bold or plain captionStyle, and none otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Hint¶
Hint can be used anywhere in the prompt where you want to provide a helpful tip or explanation. It is usually a short and concise statement that guides the LLM in the right direction.

Usages¶
<hint>Alice first purchased 4 apples and then 3 more, so she has 7 apples in total.</hint>
Parameters¶
caption: The title or label for the hint paragraph. Default is Hint.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is hint.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is bold.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionColon: Boolean. Indicates whether to append a colon after the caption. By default, this is true for bold or plain captionStyle, and false otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Introducer¶
Introducer is a paragraph before a long paragraph (usually a list of examples, steps, or instructions). It serves as a context introducing what is expected to follow.

Usages¶
<introducer>Here are some examples.</introducer>
Parameters¶
caption: The title or label for the introducer paragraph. Default is Introducer.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is introducer.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is hidden.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionEnding: Can be one of: colon, newline, colon-newline, none. A caption can ends with a colon, a newline or simply nothing. If not specified, it defaults to colon for bold or plain captionStyle, and none otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
OutputFormat¶
Output format deals with the format in which the model should provide the output. It can be a specific format such as JSON, XML, or CSV, or a general format such as a story, a diagram or steps of instructions. Please refrain from specifying too complex formats that the model may not be able to generate, such as a PDF file or a video.

Usages¶
<output-format>Respond with a JSON without additional characters or punctuations.</output-format>
Parameters¶
caption: The title or label for the output format paragraph. Default is Output Format.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is outputFormat.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is header.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionEnding: Can be one of: colon, newline, colon-newline, none. A caption can ends with a colon, a newline or simply nothing. If not specified, it defaults to colon for bold or plain captionStyle, and none otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Question¶
Question (<qa>) is actually a combination of a question and a prompt for the answer. It's usually used at the end of a prompt to ask a question. The question is followed by a prompt for answer (e.g., Answer:) to guide the model to respond.

Usages¶
<qa>What is the capital of France?</qa>
Parameters¶
questionCaption: The title or label for the question paragraph. Default is Question.
answerCaption: The title or label for the answer paragraph. Default is Answer.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is question.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is bold.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionEnding: Can be one of: colon, newline, colon-newline, none. A caption can ends with a colon, a newline or simply nothing. If not specified, it defaults to colon for bold or plain captionStyle, and none otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Role¶
Specifies the role you want the language model to assume when responding. Defining a role provides the model with a perspective or context, such as a scientist, poet, child, or any other persona you choose.

Usages¶
<role>You are a data scientist.</role>
Parameters¶
caption: The title or label for the role paragraph. Default is Role.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is role.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is header.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionEnding: Can be one of: colon, newline, colon-newline, none. A caption can ends with a colon, a newline or simply nothing. If not specified, it defaults to colon for bold or plain captionStyle, and none otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
StepwiseInstructions¶
StepwiseInstructions that elaborates the task by providing a list of steps or instructions. Each step should be concise and clear, and the list should be easy to follow.

Usages¶
<stepwise-instructions>
  <list>
    <item>Interpret and rewrite user's query.</item>
    <item>Think of a plan to solve the query.</item>
    <item>Generate a response based on the plan.</item>
  </list>
</stepwise-instructions>
Parameters¶
caption: The title or label for the stepwise instructions paragraph. Default is Stepwise Instructions.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is stepwiseInstructions.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is header.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionEnding: Can be one of: colon, newline, colon-newline, none. A caption can ends with a colon, a newline or simply nothing. If not specified, it defaults to colon for bold or plain captionStyle, and none otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Task¶
Task represents the action you want the language model to perform. It is a directive or instruction that you want the model to follow. Task is usually not long, but rather a concise and clear statement. Users can also include a list of steps or instructions to complete the task.

Usages¶
<task>Cook a recipe on how to prepare a beef dish.</task>
When including a list of steps:

<task>
  Planning a schedule for a travel.
  <list>
    <item>Decide on the destination and plan the duration.</item>
    <item>Find useful information about the destination.</item>
    <item>Write down the schedule for each day.</item>
  </list>
</task>
Parameters¶
caption: The title or label for the task paragraph. Default is Task.
captionSerialized: The serialized version of the caption when using "serializer" syntaxes. Default is task.
captionStyle: Can be one of: header, bold, plain, hidden. Determines the style of the caption, applicable only for "markup" syntaxes. Default is header.
captionTextTransform: Can be one of: upper, level, capitalize, none. Specifies text transformation for the caption, applicable only for "markup" syntaxes. Default is none.
captionEnding: Can be one of: colon, newline, colon-newline, none. A caption can ends with a colon, a newline or simply nothing. If not specified, it defaults to colon for bold or plain captionStyle, and none otherwise.
blankLine: Boolean. Whether to add one more blank line (2 in total) before and after the paragraph.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Data Displays¶
Document¶
Displaying an external document like PDF, TXT or DOCX.

Usages¶
To display a Word document without including the real multimedia:

<Document src="sample.docx" multimedia="false"/>
Parameters¶
src: The source file to read the data from. This must be provided if records is not provided.
buffer: Buffer. Document data buffer. Recommended to use src instead unless you want to use a string.
base64: Base64 encoded string of the document data. Mutually exclusive with src and buffer.
parser: Can be one of: auto, pdf, docx, txt. The parser to use for reading the data. If not provided, it will be inferred from the file extension.
multimedia: Boolean. If true, the multimedias will be displayed. If false, the alt strings will be displayed at best effort. Default is true.
selectedPages: The pages to be selected. This is only available for PDF documents. If not provided, all pages will be selected. You can use a string like 2 to specify a single page, or slice like 2:4 to specify a range of pages (2 inclusive, 4 exclusive). The pages selected are 0-indexed. Negative indexes like -1 is not supported here.
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Image¶
Image (<img>) displays an image in the content. Alternatively, it can also be shown as an alt text by specifying the syntax prop. Note that syntax must be specified as multimedia to show the image.

Usages¶
<Image src="path/to/image.jpg" alt="Image description" position="bottom" />
Parameters¶
src: The path to the image file.
alt: The alternative text to show when the image cannot be displayed.
base64: The base64 encoded image data. It can not be specified together with src.
type: The MIME type of the image to be shown. If not specified, it will be inferred from the file extension. If specified, the image will be converted to the specified type. Can be image/jpeg, image/png, etc., or without the image/ prefix.
position: Can be one of: top, bottom, here. The position of the image. Default is here.
maxWidth: Number. The maximum width of the image to be shown.
maxHeight: Number. The maximum height of the image to be shown.
resize: Number. The ratio to resize the image to to be shown.
syntax: Can be one of: markdown, html, json, yaml, xml, multimedia. Only when specified as multimedia, the image will be shown. Otherwise, the alt text will be shown. By default, it's multimedia when alt is not specified. Otherwise, it's undefined (inherit from parent).
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Object¶
Object (<obj>, <dataObj>) displays external data or object content. When in serialize mode, it's serialized according to the given serializer.

Usages¶
<Object syntax="json" data="{ key: 'value' }" />
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml. The syntax or serializer of the content. Default is json.
data: Object. The data object to render.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Table¶
Displaying a table with records and columns.

Usages¶
<table records="{{[{ name: 'Alice', age: 20 }, { name: 'Bob', age: 30 }]}}" />
To import an excel file, and display the first 10 records in csv syntax:

<table src="data.xlsx" parser="excel" maxRecords="10" syntax="csv" />
Parameters¶
syntax: Can be one of: markdown, html, json, text, csv, tsv, xml. The output syntax of the content.
records: Object. A list, each element is an object / dictionary / list of elements. The keys are the fields and the values are the data in cells.
columns: Object. A list of column definitions. Each column definition is an object with keys "field", "header", and "description". The field is the key in the record object, the header is displayed in the top row, and the description is meant to be an explanation. Columns are optional. If not provided, the columns are inferred from the records.
src: The source file to read the data from. This must be provided if records is not provided.
parser: Can be one of: auto, csv, tsv, excel, json, jsonl. The parser to use for reading the data. If not provided, it will be inferred from the file extension.
selectedColumns: Object. The selected columns to display. If not provided, all columns will be displayed. It should be an array of column field names, e.g. ["name", "age"]; or a string like 2:4 to select columns 2 (inclusive) to 4 (exclusive). There is a special column name called index which is the enumeration of the records starting from 0. You can also use a special value called +index to add the index column to the original table.
selectedRecords: Object. The selected records to display. If not provided, all records will be displayed. It should be an array of record indices, e.g. [0, 1]; or a string like 2:4 to select records 2 (inclusive) to 4 (exclusive).
maxRecords: Number. The maximum number of records to display. If not provided, all records will be displayed.
maxColumns: Number. The maximum number of columns to display. If not provided, all columns will be displayed.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Utilities¶
AiMessage¶
Wrap the contents in a AI message.

Usages¶
<ai-msg>Paris</ai-msg>
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
Conversation¶
Display a conversation between system, human and AI.

Usages¶
<conversation messages="{{[{ speaker: 'human', content: 'What is the capital of France?' }, { speaker: 'ai', content: 'Paris' }]}}" />
Parameters¶
messages: Object. A list of message. Each message should have a speaker and a content field.
selectedMessages: The messages to be selected. If not provided, all messages will be selected. You can use a string like 2 to specify a single message, or slice like 2:4 to specify a range of messages (2 inclusive, 4 exclusive). Or use -6: to select the last 6 messages.
Folder¶
Displays a directory structure as a tree.

Usages¶
To display a directory structure with a filter for Python files:

<folder src="project_dir" filter=".*\.py$" maxDepth="3" />
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, text, xml. The output syntax of the content.
src: The source directory path to display.
data: TreeItemData[]. Alternative to src, directly provide tree data structure.
filter: RegExp. A regular expression to filter files. The regex is applied to the folder names and file names (not the full path). Directories are included by default unless all of their nested content is filtered out. When filter is on, empty directories will not be shown.
maxDepth: Number. Maximum depth of directory traversal. Default is 3.
showContent: Boolean. Whether to show file contents. Default is false.
HumanMessage¶
Wrap the contents in a user message.

Usages¶
<user-msg>What is the capital of France?</user-msg>
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
MessageContent¶
Display a message content.

Usages¶
<msg-content content="What is the capital of France?" />
Parameters¶
content: Object. The content of the message. It can be a string, or an array of strings and multimedia content.
SystemMessage¶
Wrap the contents in a system message.

Usages¶
<system-msg>Answer concisely.</system-msg>
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content. Note xml and text are experimental.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
name: The name of the content, used in serialization.
type: The type of the content, used in serialization.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.
ToolRequest¶
ToolRequest represents an AI-generated tool request with parameters. Used to display tool calls made by AI models.

Usages¶
<ToolRequest id="123" name="search" parameters={{ query: "hello" }} />
Parameters¶
id: Tool request ID
name: Tool name
parameters: Any. Tool input parameters
speaker: Can be one of: human, ai, system. The speaker of the content. Default is ai.
ToolResponse¶
ToolResponse represents the result of a tool execution. Used to display tool execution results with rich content.

Usages¶
<ToolResponse id="123" name="search">
 <Paragraph>Search results for "hello":</Paragraph>
 <List>
  <ListItem>Result 1</ListItem>
  <ListItem>Result 2</ListItem>
 </List>
</ToolResponse>
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of ToolResponse is special. It is always multimedia for itself. The syntax is used to render the content inside. If not specified, it will inherit from the parent context.
id: Tool call ID to respond to
name: Tool name
speaker: Can be one of: human, ai, system, tool. The speaker of the content. Default is tool.
Tree¶
Renders a tree structure in various formats.

Usages¶
<Tree items={treeData} syntax="markdown" showContent={true} />
Parameters¶
syntax: Can be one of: markdown, html, json, yaml, text, xml. The output syntax to use for rendering the tree
items: TreeItemData[]. Array of tree items to render
showContent: Boolean. Whether to show content values of tree items
Webpage¶
Displays content from a webpage.

Usages¶
Display content from a URL:

<webpage url="https://example.com" />
Extract only specific content using a selector:

<webpage url="https://example.com" selector="main article" />
Convert HTML to structured POML components:

<webpage url="https://example.com" extractText="false" />
Parameters¶
url: The URL of the webpage to fetch and display.
src: Local file path to an HTML file to display.
buffer: Buffer. HTML content as string or buffer.
base64: Base64 encoded HTML content.
extractText: Boolean. Whether to extract plain text content (true) or convert HTML to structured POML (false). Default is false.
selector: CSS selector to extract specific content from the page (e.g., "article", ".content", "#main"). Default is "body".
syntax: Can be one of: markdown, html, json, yaml, xml, text. The syntax of the content.
className: A class name for quickly styling the current block with stylesheets.
speaker: Can be one of: human, ai, system. The speaker of the content. By default, it's determined by the context and the content.
writerOptions: Object. Experimental.. Optional JSON string to customize the format of markdown headers, JSON indents, etc.
whiteSpace: Can be one of: pre, filter, trim. Experimental. Controls how whitespace is handled in text content. 'pre' (default when syntax is text): Preserves all whitespace as-is; 'filter' (default when syntax is not text): Removes leading/trailing whitespace and normalizes internal whitespace in the gaps; 'trim': Trims whitespace from the beginning and end.
charLimit: Number. Experimental. Soft character limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
tokenLimit: Number. Experimental. Soft token limit before truncation is applied. Content exceeding this limit will be truncated with a marker.
priority: Number. Experimental. Priority used when truncating globally. Lower numbers are dropped first when content needs to be reduced to fit limits.