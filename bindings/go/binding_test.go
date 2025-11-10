package tree_sitter_heyvl_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_heyvl "github.com/kernzerfall/tree-sitter-heyvl/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_heyvl.Language())
	if language == nil {
		t.Errorf("Error loading HeyVL grammar")
	}
}
