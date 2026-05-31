import Token from "./Token.ts";
import TokenizerError from "./TokenizerError.ts";
import TokenType from "./TokenType.ts";

class Tokenizer {
    public static readonly SINGLE_CHAR_TOKENS = {
        ",": TokenType.Comma,
        ".": TokenType.Dot,
        "-": TokenType.Minus,
        "%": TokenType.Modulus,
        "+": TokenType.Plus,
        "*": TokenType.Times,
        "/": TokenType.Slash,
        ";": TokenType.Semicolon,
        ":": TokenType.Colon,
        "=": TokenType.Equal,
        "!": TokenType.Not,
        ">": TokenType.GreaterThan,
        "<": TokenType.LessThan,
        "(": TokenType.ParenthesisOpen,
        ")": TokenType.ParenthesisClose,
        "{": TokenType.BraceOpen,
        "}": TokenType.BraceClose,
        "[": TokenType.BracketOpen,
        "]": TokenType.BracketClose,
        "|": TokenType.Pipe,
        "&": TokenType.Ampersand,
    } as const;

    public static readonly MULTI_CHAR_TOKENS = {
        "==": TokenType.EqualEqual,
        "!=": TokenType.NotEqual,
        ">=": TokenType.GreaterThanEqual,
        "<=": TokenType.LessThanEqual
    } as const;

    public static readonly KEYWORDS = {
        let: TokenType.Let,
        const: TokenType.Const,
        final: TokenType.Final,
        match: TokenType.Match
    } as const;

    private readonly zeroCharCode = "0".charCodeAt(0);
    private readonly nineCharCode = "9".charCodeAt(0);
    private readonly aCharCode = "a".charCodeAt(0);
    private readonly fCharCode = "f".charCodeAt(0);
    private readonly zCharCode = "z".charCodeAt(0);
    private readonly ACharCode = "A".charCodeAt(0);
    private readonly ZCharCode = "Z".charCodeAt(0);

    private isDigit(char: string) {
        const code = char.charCodeAt(0);
        return code >= this.zeroCharCode && code <= this.nineCharCode;
    }

    private isAlpha(char: string) {
        const code = char.charCodeAt(0);

        return (
            (code >= this.aCharCode && code <= this.zCharCode) ||
            (code >= this.ACharCode && code <= this.ZCharCode)
        );
    }

    private isAlnum(char: string) {
        return this.isDigit(char) || this.isAlpha(char);
    }

    private isSpace(char: string) {
        return (
            char === " " ||
            char === "\n" ||
            char === "\r" ||
            char === "\t" ||
            char === "\v" ||
            char === "\f"
        );
    }

    private isHexDigit(char: string) {
        const code = char.toLowerCase().charCodeAt(0);
        return (
            this.isDigit(char) ||
            (code >= this.aCharCode && code <= this.fCharCode)
        );
    }

    public tokenize(filename: string, input: string) {
        let index = 0;
        let line = 1,
            col = 1;
        const tokens: Token[] = [];

        mainLoop: while (index < input.length) {
            if (this.isSpace(input[index]!)) {
                if (input[index]! === "\n" || input[index]! === "\r") {
                    col = 1;
                    line++;
                } else {
                    col++;
                }

                index++;
                continue;
            }

            if (this.isDigit(input[index]!)) {
                let str = "";
                let isFloat = false;
                let radix = 10;
                const start = [line, col] as const;

                switch (input.slice(index, index + 2)) {
                    case "0x":
                        radix = 16;
                        break;
                    case "0o":
                        radix = 8;
                        break;
                    case "0b":
                        radix = 2;
                        break;
                }

                if (radix !== 10) {
                    index += 2;
                    col += 2;
                }

                while (
                    index < input.length &&
                    (this.isHexDigit(input[index]!) ||
                        input[index] === "." ||
                        input[index] === "_")
                ) {
                    if (input[index] === ".") {
                        if (isFloat) {
                            throw new TokenizerError(
                                `Unexpected dot after numeric literal: ${str}`,
                                {
                                    start,
                                    end: [line, col + 1],
                                    filename
                                }
                            );
                        }

                        isFloat = true;
                    }

                    if (input[index] !== "_") {
                        str += input[index]!;
                    }

                    index++;
                    col++;
                }

                if (radix === 10 && str[0] == "0") {
                    radix = 8;
                    str = str.slice(1);
                }

                if (radix !== 10 && isFloat) {
                    throw new TokenizerError(
                        `Float literals cannot be in anything other than decimal format`,
                        {
                            start,
                            end: [line, col],
                            filename
                        }
                    );
                }

                if (!str) {
                    throw new TokenizerError(
                        `Unexpected end of literal: ${str}`,
                        {
                            start,
                            end: [line, col],
                            filename
                        }
                    );
                }

                const num = isFloat
                    ? Number.parseFloat(str)
                    : Number.parseInt(str, radix);

                if (Number.isNaN(num)) {
                    throw new TokenizerError(
                        `Invalid numeric literal: ${str}`,
                        {
                            start,
                            end: [line, col],
                            filename
                        }
                    );
                }

                tokens.push(
                    new Token(
                        isFloat
                            ? TokenType.FloatLiteral
                            : TokenType.IntegerLiteral,
                        `${num.toString(radix)}`,
                        {
                            start,
                            end: [line, col],
                            filename
                        }
                    )
                );

                continue;
            }

            if (this.isAlpha(input[index]!) || input[index] === "_") {
                const start = [line, col] as const;
                let str = "";

                while (
                    index < input.length &&
                    (this.isAlnum(input[index]!) || input[index] === "_")
                ) {
                    str += input[index];
                    col++;
                    index++;
                }

                if (str in Tokenizer.KEYWORDS) {
                    tokens.push(
                        new Token(
                            Tokenizer.KEYWORDS[
                                str as keyof typeof Tokenizer.KEYWORDS
                            ],
                            str,
                            {
                                start,
                                end: [line, col],
                                filename
                            }
                        )
                    );
                } else {
                    tokens.push(
                        new Token(TokenType.Identifier, str, {
                            start,
                            end: [line, col],
                            filename
                        })
                    );
                }

                continue;
            }

            for (const tokenValue in Tokenizer.MULTI_CHAR_TOKENS) {
                const start = [line, col] as const;

                if (
                    input.slice(index, index + tokenValue.length) !== tokenValue
                ) {
                    continue;
                }

                col += tokenValue.length;
                index += tokenValue.length;

                tokens.push(
                    new Token(
                        Tokenizer.MULTI_CHAR_TOKENS[
                            tokenValue as keyof typeof Tokenizer.MULTI_CHAR_TOKENS
                        ],
                        tokenValue,
                        {
                            start,
                            end: [line, col],
                            filename
                        }
                    )
                );

                continue mainLoop;
            }

            if (input[index]! in Tokenizer.SINGLE_CHAR_TOKENS) {
                tokens.push(
                    new Token(
                        Tokenizer.SINGLE_CHAR_TOKENS[
                            input[
                                index
                            ]! as keyof typeof Tokenizer.SINGLE_CHAR_TOKENS
                        ],
                        input[index]!,
                        {
                            start: [line, col],
                            end: [line, col + 1],
                            filename
                        }
                    )
                );

                index++;
                col++;
                continue;
            }

            throw new TokenizerError(`Unexpected token: ${input[index]}`, {
                start: [line, col],
                end: [line, col + 1],
                filename
            });
        }

        tokens.push(
            new Token(TokenType.EOF, "[EOF]", {
                start: [line, col],
                end: [line, col + 1],
                filename
            })
        );

        return tokens;
    }
}

export default Tokenizer;
