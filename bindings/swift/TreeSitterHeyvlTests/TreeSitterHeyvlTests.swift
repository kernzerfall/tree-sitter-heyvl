import XCTest
import SwiftTreeSitter
import TreeSitterHeyvl

final class TreeSitterHeyvlTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_heyvl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading HeyVL grammar")
    }
}
