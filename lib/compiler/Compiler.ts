import { readFile, writeFile } from "fs/promises";
import Tokenizer from "../frontend/lexer/Tokenizer.ts";
import Parser from "../frontend/parser/Parser.ts";
import type { CompilerTransaction } from "./CompilerTransaction.ts";
import type RootNode from "../frontend/tree/RootNode.ts";
import Transformer from "../transformer/Transformer.ts";
import CodeGenerator from "../codegen/CodeGenerator.ts";

class Compiler {
    protected readonly tokenizer = new Tokenizer();
    protected readonly parser = new Parser();
    protected readonly transformer = new Transformer();
    protected readonly generator = new CodeGenerator();

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

        console.dir(compiledRootNodes, {
            depth: Infinity
        });

        const compiledJSNodes = [];

        for (const rootNode of compiledRootNodes) {
            compiledJSNodes.push(this.transformer.transform(rootNode));
        }

        console.log("Compilation finished:");
        console.dir(compiledJSNodes, { depth: Infinity });

        const generatedCodeString = compiledJSNodes
            .map(node => this.generator.generate(node))
            .join("\n");

        if (tx.outputFile) {
            await writeFile(tx.outputFile, generatedCodeString, "utf8");
        }

        return generatedCodeString;
    }
}

export default Compiler;
