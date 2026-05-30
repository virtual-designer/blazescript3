import { readFile } from "fs/promises";
import Tokenizer from "../frontend/lexer/Tokenizer.ts";
import Parser from "../frontend/parser/Parser.ts";
import type { CompilerTransaction } from "./CompilerTransaction.ts";

class Compiler {
    protected readonly tokenizer = new Tokenizer();
    protected readonly parser = new Parser();

    public async accept(tx: CompilerTransaction) {
        const source = tx.input ?? await readFile(tx.filepath!, 'utf-8');
        const tokens = this.tokenizer.tokenize(tx.filename, source);
        const rootNode = this.parser.parse(tokens);
        console.log("Compilation finished:");
        console.dir(rootNode, {
            depth: Infinity
        });
    }
}

export default Compiler;
