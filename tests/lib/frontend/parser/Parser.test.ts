import Tokenizer from "@lib/frontend/lexer/Tokenizer";
import Parser from "@lib/frontend/parser/Parser";
import BinaryExpressionNode from "@lib/frontend/tree/BinaryExpressionNode";
import type ExpressionNode from "@lib/frontend/tree/ExpressionNode";
import IdentifierNode from "@lib/frontend/tree/IdentifierNode";
import LiteralNode from "@lib/frontend/tree/LiteralNode";
import LiteralNodeKind from "@lib/frontend/tree/LiteralNodeKind";
import VariableDeclarationKind from "@lib/frontend/tree/VariableDeclarationKind";
import VariableDeclarationNode from "@lib/frontend/tree/VariableDeclarationNode";
import { describe, expect, it } from "vitest";

const FILENAME = "test.bl";
const LOC = {
    start: [0, 0],
    end: [0, 0],
    filename: FILENAME
} as const;

function toString(node: ExpressionNode): string {
    if (node instanceof BinaryExpressionNode) {
        return (
            "(" +
            toString(node.left) +
            " " +
            node.operator +
            " " +
            toString(node.right) +
            ")"
        );
    }

    if (node instanceof LiteralNode) {
        return node.value;
    }

    return "???";
}

describe("Parser", () => {
    it("parses complex binary expressions", () => {
        const tokenizer = new Tokenizer();
        const parser = new Parser();

        const node = parser.parse(
            tokenizer.tokenize(FILENAME, `5 + 38 * 5 - 25 / (3653 - 1) + 1`)
        );

        node.traverse(node => {
            Object.defineProperty(node, "location", {
                value: LOC
            });

            return true;
        });

        expect(toString(node.children[0]!)).toBe(
            "(((5 + (38 * 5)) - (25 / (3653 - 1))) + 1)"
        );
    });

    it("parses variable declarations", () => {
        const tokenizer = new Tokenizer();
        const parser = new Parser();

        const node = parser.parse(
            tokenizer.tokenize(FILENAME, `final age = 186;\nfinal num: Float = 5.5;`)
        );
        
        node.traverse(node => {
            Object.defineProperty(node, "location", {
                value: LOC,
            });

            return true;
        });

        expect(node.children).toStrictEqual([
            new VariableDeclarationNode(
                VariableDeclarationKind.Final,
                new IdentifierNode("age", LOC),
                undefined,
                new LiteralNode(LiteralNodeKind.Integer, "186", LOC),
                LOC
            ),
            new VariableDeclarationNode(
                VariableDeclarationKind.Final,
                new IdentifierNode("num", LOC),
                new IdentifierNode("Float", LOC),
                new LiteralNode(LiteralNodeKind.Float, "5.5", LOC),
                LOC
            )
        ]);
    });
});
