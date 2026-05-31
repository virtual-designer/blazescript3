import { readFile } from "fs/promises";
import Tokenizer from "../frontend/lexer/Tokenizer.ts";
import Parser from "../frontend/parser/Parser.ts";
import type { CompilerTransaction } from "./CompilerTransaction.ts";
import type RootNode from "../frontend/tree/RootNode.ts";

class Compiler {
    protected readonly tokenizer = new Tokenizer();
    protected readonly parser = new Parser();

    public async accept(tx: CompilerTransaction) {
        const compiledRootNodes: RootNode[] = [];
        const inputSources = [...(tx.inputSources ?? [])];

        for (const filename of tx.inputFiles ?? []) {
            inputSources.push({
                filename,
                data: await readFile(filename, "utf8")
            });
        }

        for (const { filename, data } of inputSources) {
            const tokens = this.tokenizer.tokenize(
                filename,
                data.toString("utf8")
            );
            const rootNode = this.parser.parse(tokens);
            compiledRootNodes.push(rootNode);
        }

        console.log("Compilation finished:");
        console.dir(compiledRootNodes, {
            depth: Infinity
        });
    }
}

export default Compiler;
