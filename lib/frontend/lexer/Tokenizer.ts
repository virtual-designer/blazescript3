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
        "=": TokenType.Equal,
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
            code >= this.aCharCode &&
            code <= this.zCharCode &&
            code >= this.ACharCode &&
            code <= this.ZCharCode
        );
    }

    private isAlnum(char: string) {
        return this.isDigit(char) || this.isAlpha(char);
    }

    private isHexDigit(char: string) {
        const code = char.toLowerCase().charCodeAt(0);
        return this.isDigit(char) || code >= this.aCharCode && code <= this.fCharCode;
    }

    public tokenize(filename: string, input: string) {
        let index = 0;
        let line = 1,
            col = 1;
        const tokens: Token[] = [];

        while (index < input.length) {
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

            throw new TokenizerError(
                `Unexpected token: ${input[index]}`,
                {
                    start: [line, col],
                    end: [line, col + 1],
                    filename
                }
            );
        }

        return tokens;
    }
}

export default Tokenizer;
