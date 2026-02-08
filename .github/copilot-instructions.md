# Rules

## Formatting:

- If if statements can be a single line, make them so and don't use brackets
- Use a line of space after variable declarations
- If/if else/if elseif statements, and loops should always have a line of space after them (unless the nesting/indentation
  decreases on the next line)

## Lab Code Generation:

- Always use the Lab Template to generate new labs in chat
- When generating solutions for Lab Template problems:
  - Always use the cplusplus-lab and c-lab directories appropriately (including creating header files for imports)
  - Avoid modifying or adding Makefiles
  - Use the following testing frameworks:
    - unittest for Python tests
    - No framework for Java tests (do not use JUnit unless specified)
    - No framework for JavaScript tests (do not use Jest or Node unless specified;
      always use the built-in JavaScript module scripts,
      and always use appropriate import statements and exports instead of require and module.exports)
    - Jest for TypeScript tests
    - No framework for C tests
    - No framework for C++ tests
    - xUnit for C# tests
- Start with pseudocode explanations in chat
- Document function parameters
- Include error handling
- Add unit tests where applicable
- Show example usage

# Lab Template

## Language:

{lab_language}

## Type (function, class, or interface):

{code_type} (lowercase function, class, or interface)

## Name:

{name_for_lab_code} (matches lab language and code type)

## Description:

(never use bulletpoints or numbered lists in the description)

{problem_instructions}

## Parameters:

(never use bullet points or numbered lists when listing the parameters)

{parameter_names_and_types}
(comma separated name and type combos. Only list the parameters for the generated function, class constructor,
or interface method)
