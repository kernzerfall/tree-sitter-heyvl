/**
 * @file Grammar for HeyVL, the Intermediate Verification Language (IVL) used by the Caesar Verifier
 * @author kernzerfall <me@kernzerfall.eu>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Helper function for comma-separated lists
// Comma<T> in LALRPOP is: (<T> ",")* <T>?
// CommaPlus<T> is: (<T> ",")* <T>
const commaSep = rule => optional(seq(rule, repeat(seq(',', rule))));
const commaSep1 = rule => seq(rule, repeat(seq(',', rule)));

module.exports = grammar({
  name: 'heyvl',

  // Whitespace and comments
  extras: $ => [
    $.comment,
    /\s/
  ],

  // Specify 'identifier' as the "word" rule
  word: $=>$.identifier,
  
  // Define the grammar rules
  rules: {
    // --- Top Level (from `Decls`) ---
    source_file: $ => repeat($._declaration),

    _declaration: $ => choice(
      $.proc_declaration,
      $.domain_declaration
    ),

    // --- Domain Declarations (from `DomainDecl`, `DomainSpec`) ---
    domain_declaration: $ => seq(
      'domain',
      field('name', $.identifier),
      '{',
      repeat($._domain_spec),
      '}'
    ),

    _domain_spec: $ => choice(
      $.function_declaration,
      $.axiom_declaration
    ),

    function_declaration: $ => seq(
      'func',
      field('name', $.identifier),
      field('inputs', $.parameter_list),
      ':',
      field('output', $._type),
      choice(
        seq('=', field('body', $._expression)),
        optional(token('@computable')) // Handle `@computable` as a token
      )
    ),

    axiom_declaration: $ => seq(
      'axiom',
      field('name', $.identifier),
      field('axiom', $._expression)
    ),

    // --- Procedure Declarations (from `ProcDecl`) ---
    proc_declaration: $ => seq(
      optional(field('annotation', $.annotation_calculus)),
      field('direction', choice('proc', 'coproc')),
      field('name', $.identifier),
      field('inputs', $.parameter_list),
      '->',
      field('outputs', $.parameter_list),
      repeat($._procedure_spec),
      field('body', optional($.block))
    ),

    annotation_calculus: $=> seq('@',$.identifier),

    parameter_list: $ => seq(
      '(',
      commaSep($.parameter),
      ')'
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type)
    ),

    _procedure_spec: $ => choice(
      $.pre_condition,
      $.post_condition
    ),

    pre_condition: $=> seq('pre',$._expression),
    post_condition: $=> seq('post',$._expression),

    // --- Statements (from `StmtKind`, `Block`) ---
    block: $ => seq(
      '{',
      // Implements OptSemi<Stmt>
      repeat(seq($._statement, optional(';'))),
      '}'
    ),

    _statement: $ => choice(
      $.block,
      $.variable_declaration_statement,
      $.assignment_statement,
      $.call_statement,
      $.havoc_statement,
      $.assert_statement,
      $.assume_statement,
      $.compare_statement,
      $.reward_statement,
      $.tick_statement,
      $.negate_statement,
      $.validate_statement,
      $.demonic_if_statement,
      $.angelic_if_statement,
      $.if_statement,
      $.while_statement,
      $.annotated_statement,
      $.label_statement
    ),

    variable_declaration_statement: $ => seq(
      'var',
      field('name', $.identifier),
      ':',
      field('type', $._type),
      optional(seq('=', field('value', $._expression)))
    ),

    assignment_statement: $ => seq(
      commaSep1($.identifier),
      '=',
      $._expression
    ),
    
    // A call expression used as a statement
    call_statement: $=>$.call_expression,

    havoc_statement: $ => seq(
      choice('havoc', 'cohavoc'),
      commaSep1($.identifier)
    ),

    assert_statement: $=> seq(choice('assert', 'coassert'),$._expression),
    assume_statement: $=> seq(choice('assume', 'coassume'),$._expression),
    compare_statement: $=> seq(choice('compare', 'cocompare'),$._expression),
    reward_statement: $=> seq('reward',$._expression),
    tick_statement: $=> seq('tick',$._expression),
    negate_statement: $ => choice('negate', 'conegate'),
    validate_statement: $ => choice('validate', 'covalidate'),

    demonic_if_statement: $ => seq(
      'if', choice('⊓', '\\cap'), field('then', $.block),
      'else', field('else', $.block)
    ),
    
    angelic_if_statement: $ => seq(
      'if', choice('⊔', '\\cup'), field('then', $.block),
      'else', field('else', $.block)
    ),

    if_statement: $ => seq(
      'if', field('condition', $._expression),
      field('then', $.block),
      'else', field('else', $.block)
    ),
    
    while_statement: $ => seq(
      'while', field('condition', $._expression),
      field('body', $.block)
    ),

    annotated_statement: $ => seq(
      '@',
      field('name', $.identifier),
      optional($.annotation_inputs),
      field('statement', $._statement)
    ),
    
    annotation_inputs: $ => seq(
      '(', commaSep($._expression), ')'
    ),

    label_statement: $=> seq('label',$.identifier),

    // --- Types (from `Ty`) ---
    _type: $ => choice(
      $.type_identifier,
      $.list_type
    ),
    
    type_identifier: $=>$.identifier,
    list_type: $=> seq('[]',$._type), // Recursive list type

    // --- Expressions (from `ExprKind...`) ---
    _expression: $ => choice(
      $.quantifier_expression,
      $.binary_expression,
      $.unary_expression,
      $.let_expression,
      $.ite_expression,
      $.call_expression,
      $.iverson_expression,
      $.parenthesized_expression,
      $.literal,
      $.identifier
    ),

    // Precedence is based on the LALRPOP chain:
    // 1: Quant (weakest)
    // 2: Or
    // 3: And
    // 4: Compare
    // 5: Lattice
    // 6: Summand
    // 7: Factor
    // 8: Unary (strongest)

    quantifier_expression: $ => prec.right(1, seq(
      field('quantifier', choice('inf', 'sup', 'exists', 'forall')),
      field('variables', commaSep1($.quantifier_variable)),
      repeat($.quantifier_annotation),
      '.',
      field('expression', $._expression)
    )),

    binary_expression: $ => choice(
      prec.left(2, seq($._expression, '||', $._expression)),
      prec.left(3, seq($._expression, '&&', $._expression)),
      prec.left(4, seq($._expression, choice('==', '!=', '<', '<=', '>=', '>'), $._expression)),
      prec.left(5, seq($._expression, choice('⊓', '\\cap', '⊔', '\\cup', '→', '==>', '←', '<==', '↘', '↖'), $._expression)),
      prec.left(6, seq($._expression, choice('+', '-'), $._expression)),
      prec.left(7, seq($._expression, choice('*', '/', '%'), $._expression))
    ),
    
    unary_expression: $ => prec.right(8, seq(
      field('operator', choice('!', '~', '?')),
      $._expression
    )),
    
    iverson_expression: $ => prec.right(8, seq(
      '[', $._expression, ']'
    )),

    let_expression: $ => seq(
      'let', '(', $.identifier, ',', $._expression, ',', $._expression, ')'
    ),
    ite_expression: $ => seq(
      'ite', '(', $._expression, ',', $._expression, ',', $._expression, ')'
    ),
    call_expression: $ => seq(
      field('function', $.identifier),
      '(',
      commaSep($._expression),
      ')'
    ),
    parenthesized_expression: $ => seq(
      '(', $._expression, ')'
    ),

    quantifier_variable: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type)
    ),

    quantifier_annotation: $ => seq(
      token('@trigger'), // Specific token
      '(',
      commaSep($._expression),
      ')'
    ),

    // --- Literals (from `LitKind`) ---
    literal: $ => choice(
      $.string_literal,
      $.integer_literal,
      $.decimal_literal,
      $.infinity_literal,
      $.boolean_literal
    ),
    
    // Match decimal first, as it's more specific
    decimal_literal: $ => token(/[0-9]+\.[0-9]+/),
    integer_literal: $ => token(/[0-9]+/),
    
    string_literal: $ => token(/"[^"]*"/),
    infinity_literal: $ => token(choice('∞', '\\infty')),
    boolean_literal: $ => token(choice('true', 'false')),

    // --- Identifier (from `Symbol`) ---
    identifier: $ => token(/[_a-zA-Z][_a-zA-Z0-9']*/),

    // --- Comments (from previous tmLanguage) ---
    comment: $ => token(choice(
      // Single-line comment: // ...
      seq('//', /.*/),
      
      // Block comment: /* ... */
      seq(
        '/*',
        /[^*]*\*+([^/*][^*]*\*+)*/,
        '/'
      )
    )),
  }
});
