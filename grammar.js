/**
 * @file Grammar for HeyVL, the Intermediate Verification Language (IVL) used by the Caesar Verifier
 * @author kernzerfall <me@kernzerfall.eu>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "heyvl",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
