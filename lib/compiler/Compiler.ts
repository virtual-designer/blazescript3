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
import SemanticAnalyzer from "../analysis/SemanticAnalyzer.ts";

class Compiler {
    protected readonly tokenizer = new Tokenizer();
    protected readonly parser = new Parser();
    protected readonly transformer = new Transformer();
    protected readonly generator = new CodeGenerator();
    protected readonly analyzer = new SemanticAnalyzer();
    protected readonly diagnosticPrinter = new DiagnosticPrinter();

    public async accept(tx: CompilerTransaction): Promise<string | undefined> {
        const rootNodes: RootNode[] = [];
        const inputSources = [...(tx.inputSources ?? [])];

        for (const filename of tx.inputFiles ?? []) {
            inputSources.push({
                filename,
                data: await readFile(filename, "utf8")
            });
        }

        const fileMap = new Map<string, string>();
        this.diagnosticPrinter.setFileMap(fileMap);

        for (const { filename, data } of inputSources) {
            const dataBuffer = data.toString("utf8");
            fileMap.set(filename, dataBuffer);

            try {
                const tokens = this.tokenizer.tokenize(filename, dataBuffer);
                const rootNode = this.parser.parse(tokens);
                rootNodes.push(rootNode);
            } catch (error) {
                if (isLocatableError(error)) {
                    this.diagnosticPrinter.print({
                        code: DiagnosticCode.SyntaxError,
                        level: DiagnosticLevel.Error,
                        location: error.location,
                        message: error.message
                    });
                } else {
                    throw error;
                }
            }
        }

        if (this.diagnosticPrinter.hasErrors()) {
            return void this.end();
        }

        if (tx.debugMode) {
            console.dir(rootNodes, {
                depth: Infinity
            });
        }

        const compiledJSNodes = [];

        for (const rootNode of rootNodes) {
            const diagnostics = this.analyzer.analyze(rootNode);

            if (diagnostics.length) {
                this.diagnosticPrinter.print(...diagnostics);
            }

            compiledJSNodes.push(this.transformer.transformStatement(rootNode));
        }

        if (this.diagnosticPrinter.hasErrors()) {
            return void this.end();
        }

        if (tx.debugMode) {
            console.log("Compilation finished:");
            console.dir(compiledJSNodes, { depth: Infinity });
        }

        const generatedCodeString = compiledJSNodes
            .map(node => this.generator.generate(node))
            .join("\n");

        if (tx.outputFile) {
            await writeFile(tx.outputFile, generatedCodeString, "utf8");
        }

        this.end();

        if (this.diagnosticPrinter.hasErrors()) {
            return undefined;
        }

        return generatedCodeString;
    }

    private end(): boolean {
        this.diagnosticPrinter.printSummary();
        return this.diagnosticPrinter.hasErrors();
    }
}

export default Compiler;
