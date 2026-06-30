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
        "&": TokenType.Ampersand
    } as const;

    public static readonly MULTI_CHAR_TOKENS = {
        "==": TokenType.EqualEqual,
        "!=": TokenType.NotEqual,
        ">=": TokenType.GreaterThanEqual,
        "<=": TokenType.LessThanEqual,
        "=>": TokenType.FatArrow,
        "++": TokenType.PlusPlus,
        "--": TokenType.MinusMinus,
        "..": TokenType.DotDot
    } as const;

    public static readonly KEYWORDS = {
        let: TokenType.Let,
        const: TokenType.Const,
        final: TokenType.Final,
        match: TokenType.Match,
        true: TokenType.BooleanLiteral,
        false: TokenType.BooleanLiteral,
        null: TokenType.NullLiteral,
        if: TokenType.If,
        else: TokenType.Else,
        case: TokenType.Case,
        default: TokenType.Default,
        for: TokenType.For,
        while: TokenType.While,
        do: TokenType.Do,
        in: TokenType.In,
        function: TokenType.Function,
        public: TokenType.Public,
        private: TokenType.Private,
        protected: TokenType.Protected,
        internal: TokenType.Internal,
        async: TokenType.Async,
        override: TokenType.Override,
        operator: TokenType.Operator,
        await: TokenType.Await,
        return: TokenType.Return
    } as const;

    private readonly zeroCharCode = "0".charCodeAt(0);
    private readonly oneCharCode = "1".charCodeAt(0);
    private readonly sevenCharCode = "7".charCodeAt(0);
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

    private isBinDigit(char: string) {
        const code = char.toLowerCase().charCodeAt(0);
        return code >= this.zeroCharCode && code <= this.oneCharCode;
    }

    private isOctalDigit(char: string) {
        const code = char.toLowerCase().charCodeAt(0);
        return code >= this.zeroCharCode && code <= this.sevenCharCode;
    }

    private isHexDigit(char: string) {
        const code = char.toLowerCase().charCodeAt(0);
        return (
            this.isDigit(char) ||
            (code >= this.aCharCode && code <= this.fCharCode)
        );
    }

    private isDigitRadix(char: string, radix = 10) {
        switch (radix) {
            case 2:
                return this.isBinDigit(char);
            case 8:
                return this.isOctalDigit(char);
            case 10:
                return this.isDigit(char);
            case 16:
                return this.isHexDigit(char);
            default:
                throw new Error(`Unsupported radix: ${radix}`);
        }
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
                    (this.isDigitRadix(input[index]!, radix) ||
                        input[index] === "." ||
                        input[index] === "_")
                ) {
                    if (input[index] === ".") {
                        if (input[index + 1] == ".") {
                            break;
                        }

                        if (isFloat || radix !== 10) {
                            break;
                        }

                        isFloat = true;
                    }

                    if (input[index] !== "_") {
                        str += input[index]!;
                    }

                    index++;
                    col++;
                }

                if (
                    radix === 10 &&
                    str[0] == "0" &&
                    str.length > 1 &&
                    !isFloat
                ) {
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

                if (!str.length) {
                    throw new TokenizerError(
                        `Invalid or unexpected end of numeric literal`,
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
                        `${num.toString(10)}`,
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

            if (input[index] === '"' || input[index] === "'") {
                const start = [line, col] as const;
                const quote = input[index]!;
                let str = "";
                index++;
                col++;

                while (index < input.length && input[index] !== quote) {
                    if (input[index] === "\\") {
                        index++;
                        col++;

                        if (index >= input.length) {
                            throw new TokenizerError(
                                "Unterminated string literal: Reached EOF",
                                {
                                    start,
                                    end: [line, col],
                                    filename
                                }
                            );
                        }

                        switch (input[index]) {
                            case '"':
                                str += '"';
                                break;

                            case "'":
                                str += "'";
                                break;

                            case "n":
                                str += "\n";
                                break;

                            case "t":
                                str += "\t";
                                break;

                            case "f":
                                str += "\f";
                                break;

                            case "v":
                                str += "\v";
                                break;

                            case "a":
                                str += "\a";
                                break;

                            case "r":
                                str += "\r";
                                break;

                            case "c":
                                str += "\c";
                                break;

                            case "b":
                                str += "\b";
                                break;

                            case "\\":
                                str += "\\";
                                break;

                            default: {
                                if (
                                    input[index] === "u" ||
                                    input[index] === "x" ||
                                    input[index] === "o" ||
                                    input[index] === "b" ||
                                    this.isDigit(input[index]!)
                                ) {
                                    const radix =
                                        input[index] === "u"
                                            ? 16
                                            : input[index] === "x"
                                              ? 16
                                              : input[index] === "b"
                                                ? 2
                                                : 8;

                                    const char = input[index];
                                    let unicodeVariableLength = false;

                                    if (!this.isDigit(input[index]!)) {
                                        index++;
                                        col++;
                                    }

                                    if (char === "u" && input[index] === "{") {
                                        unicodeVariableLength = true;
                                        index++;
                                        col++;
                                    }

                                    const limit = unicodeVariableLength
                                        ? Infinity
                                        : radix === 16
                                          ? 4
                                          : radix === 8
                                            ? 3
                                            : Infinity;

                                    let digits = "";

                                    while (
                                        index < input.length &&
                                        digits.length < limit &&
                                        this.isDigitRadix(input[index]!, radix)
                                    ) {
                                        digits += input[index];
                                        index++;
                                        col++;
                                    }

                                    if (char === "u" && unicodeVariableLength) {
                                        if (input[index] !== "}") {
                                            throw new TokenizerError(
                                                "Unterminated unicode escape character",
                                                {
                                                    start,
                                                    end: [line, col],
                                                    filename
                                                }
                                            );
                                        }

                                        index++;
                                        col++;
                                    }

                                    const value = Number.parseInt(
                                        digits,
                                        radix
                                    );

                                    str += String.fromCharCode(value);
                                    continue;
                                }

                                throw new TokenizerError(
                                    "Unrecognized escape character: \\" +
                                        input[index],
                                    {
                                        start,
                                        end: [line, col],
                                        filename
                                    }
                                );
                            }
                        }

                        index++;
                        col++;
                        continue;
                    }

                    str += input[index];

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

                    index++;
                    col++;
                }

                if (index >= input.length || input[index] !== quote) {
                    throw new TokenizerError(
                        "Unterminated string literal: Reached EOF",
                        {
                            start,
                            end: [line, col],
                            filename
                        }
                    );
                }

                index++;
                col++;

                tokens.push(
                    new Token(TokenType.StringLiteral, str, {
                        start,
                        end: [line, col],
                        filename
                    })
                );

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
