import Tokenizer from "@lib/frontend/lexer/Tokenizer";
import Parser from "@lib/frontend/parser/Parser";
import BinaryExpressionNode from "@lib/frontend/tree/BinaryExpressionNode";
import type ExpressionNode from "@lib/frontend/tree/ExpressionNode";
import LiteralNode from "@lib/frontend/tree/LiteralNode";
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
});
