import { expect, it } from "vitest";
import { describe } from "vitest";
import Tokenizer from "@lib/frontend/lexer/Tokenizer.ts";
import Token from "@lib/frontend/lexer/Token";
import TokenType from "@lib/frontend/lexer/TokenType";

describe("Tokenizer", () => {
    it("can tokenize basic characters", () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize("test.bl", `.;,-+=`);
        expect(tokens).toStrictEqual([
            new Token(TokenType.Dot, ".", {
                start: [1, 1],
                end: [1, 2],
                filename: "test.bl"
            }),
            new Token(TokenType.Semicolon, ";", {
                start: [1, 2],
                end: [1, 3],
                filename: "test.bl"
            }),
            new Token(TokenType.Comma, ",", {
                start: [1, 3],
                end: [1, 4],
                filename: "test.bl"
            }),
            new Token(TokenType.Minus, "-", {
                start: [1, 4],
                end: [1, 5],
                filename: "test.bl"
            }),
            new Token(TokenType.Plus, "+", {
                start: [1, 5],
                end: [1, 6],
                filename: "test.bl"
            }),
            new Token(TokenType.Equal, "=", {
                start: [1, 6],
                end: [1, 7],
                filename: "test.bl"
            })
        ]);
    });

    it("can tokenize numeric literals", () => {
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize("test.bl", `;26357;29874.234746;0xfea0`);
        expect(tokens).toStrictEqual([
            new Token(TokenType.Semicolon, ";", {
                start: [1, 1],
                end: [1, 2],
                filename: "test.bl"
            }),
            new Token(TokenType.IntegerLiteral, "26357", {
                start: [1, 2],
                end: [1, 7],
                filename: "test.bl"
            }),
            new Token(TokenType.Semicolon, ";", {
                start: [1, 7],
                end: [1, 8],
                filename: "test.bl"
            }),
            new Token(TokenType.FloatLiteral, "29874.234746", {
                start: [1, 8],
                end: [1, 20],
                filename: "test.bl"
            }),
            new Token(TokenType.Semicolon, ";", {
                start: [1, 20],
                end: [1, 21],
                filename: "test.bl"
            }),
            new Token(TokenType.IntegerLiteral, "fea0", {
                start: [1, 21],
                end: [1, 27],
                filename: "test.bl"
            }),
        ]);
    });
});
