;; Comments
(comment) @comment @spell

;; --- Literals ---
(string_literal) @string
(integer_literal) @number
(decimal_literal) @number.float
(infinity_literal) @number
(boolean_literal) @boolean

;; --- Punctuation ---
[
  "{"
  "}"
  "["
  "]"
  "("
  ")"
] @punctuation.bracket

[
  ":"
  ";"
  ","
  "."
] @punctuation.delimiter

;; --- Keywords ---
[
  "domain"
  "func"
  "axiom"
  "proc"
  "coproc"
  "pre"
  "post"
  "var"
  "label"
] @keyword

[
  "assert"
  "coassert"
  "assume"
  "coassume"
  "compare"
  "cocompare"
  "havoc"
  "cohavoc"
  "negate"
  "conegate"
  "validate"
  "covalidate"
  "reward"
  "tick"
] @keyword.control

[
  "if"
  "else"
  "while"
] @keyword.control.conditional

[
  "let"
  "ite"
] @keyword.control.builtin

[
  "forall"
  "exists"
  "inf"
  "sup"
] @keyword.operator

;; --- Operators ---
[
  "->"
  "="
  "||"
  "&&"
  "=="
  "!="
  "<"
  "<="
  ">="
  ">"
  "⊓"
  "\\cap"
  "⊔"
  "\\cup"
  "→"
  "==>"
  "←"
  "<=="
  "↘"
  "↖"
  "+"
  "-"
  "*"
  "/"
  "%"
  "!"
  "~"
  "?"
  "[]"
] @operator

;; Iverson brackets
(iverson_expression
  "[" @operator
  "]" @operator)

;; --- Types ---
(type_identifier) @type
(list_type "[]") @type.builtin ; Highlight the '[]' part of a list type

;; --- Functions and Variables ---

;; Axioms
(axiom_declaration
  name: (identifier) @property)

;; Procedure/Function Definitions
(proc_declaration
  name: (identifier) @function)
(function_declaration
  name: (identifier) @function)

;; Function calls
(call_expression
  function: (identifier) @function.call)

;; Parameters
(parameter
  name: (identifier) @variable.parameter)
(quantifier_variable
  name: (identifier) @variable.parameter)

;; Variable definitions
(variable_declaration_statement
  name: (identifier) @variable)

;; Let variables
(let_expression
  name: (identifier) @variable.local)

;; Labels
(label_statement
  (identifier) @label)

;; --- Declarations and Scopes ---
(domain_declaration
  name: (identifier) @namespace)

;; --- Annotations ---
(annotation_calculus
  (identifier) @tag)
(annotated_statement
  name: (identifier) @tag)
(quantifier_annotation
  "@trigger" @tag)
(function_declaration
  "@computable" @tag)

;; --- Identifiers (default fallback) ---
(identifier) @variable
