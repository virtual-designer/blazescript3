import { readFile, writeFile } from "fs/promises";
import Tokenizer from "../frontend/lexer/Tokenizer.ts";
import Parser from "../frontend/parser/Parser.ts";
import type { CompilerTransaction } from "./CompilerTransaction.ts";
import type RootNode from "../frontend/tree/RootNode.ts";
import Transformer from "../transformer/Transformer.ts";
import CodeGenerator from "../codegen/CodeGenerator.ts";
import { isLocatableError } from "../diagnostic/LoctableError.ts";
import DiagnosticPrinter from "../diagnostic/DiagnosticPrinter.ts";
import { DiagnosticCode } from "../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../diagnostic/DiagnosticLevel.ts";

class Compiler {
    protected readonly tokenizer = new Tokenizer();
    protected readonly parser = new Parser();
    protected readonly transformer = new Transformer();
    protected readonly generator = new CodeGenerator();
    protected readonly diagnosticPrinter = new DiagnosticPrinter();

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
            const dataBuffer = data.toString("utf8");

            try {
                const tokens = this.tokenizer.tokenize(filename, dataBuffer);
                const rootNode = this.parser.parse(tokens);
                compiledRootNodes.push(rootNode);
            } catch (error) {
                if (isLocatableError(error)) {
                    return this.diagnosticPrinter.print({
                        code: DiagnosticCode.SyntaxError,
                        level: DiagnosticLevel.Error,
                        inputLines: dataBuffer.split("\n"),
                        location: error.location,
                        message: error.message
                    });
                } else {
                    throw error;
                }
            }
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
