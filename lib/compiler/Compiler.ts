import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import SemanticAnalyzer from "../analysis/SemanticAnalyzer.ts";
import CodeGenerator from "../codegen/CodeGenerator.ts";
import { DiagnosticCode } from "../diagnostic/DiagnosticCode.ts";
import { DiagnosticLevel } from "../diagnostic/DiagnosticLevel.ts";
import DiagnosticPrinter from "../diagnostic/DiagnosticPrinter.ts";
import { isLocatableError } from "../diagnostic/LocatableError.ts";
import Tokenizer from "../frontend/lexer/Tokenizer.ts";
import Parser from "../frontend/parser/Parser.ts";
import ParserError from "../frontend/parser/ParserError.ts";
import type RootNode from "../frontend/tree/RootNode.ts";
import NodeTransformer from "../transformer/NodeTransformer.ts";
import type CompilerTransaction from "./CompilerTransaction.ts";

class Compiler {
    protected readonly tokenizer = new Tokenizer();
    protected readonly parser = new Parser();
    protected readonly transformer = new NodeTransformer();
    protected readonly generator = new CodeGenerator();
    protected readonly analyzer = new SemanticAnalyzer();
    protected readonly diagnosticPrinter = new DiagnosticPrinter();

    public async accept(tx: CompilerTransaction): Promise<string | undefined> {
        tx.validate();

        const rootNodes: RootNode[] = [];
        const inputSources = [...(tx.getInputSources() ?? [])];

        for (const filename of tx.getInputFiles() ?? []) {
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
                    this.diagnosticPrinter.print(
                        error instanceof ParserError && error.diagnostic
                            ? error.diagnostic
                            : {
                                  code: DiagnosticCode.SyntaxError,
                                  level: DiagnosticLevel.Error,
                                  location: error.location,
                                  message: error.message
                              }
                    );

                    this.diagnosticPrinter.print(...this.parser.diagnostics);
                } else {
                    throw error;
                }
            }
        }

        if (this.diagnosticPrinter.hasErrors()) {
            return void this.end();
        }

        if (tx.isDebugMode()) {
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
        }

        if (this.diagnosticPrinter.hasErrors()) {
            return void this.end();
        }

        for (const rootNode of rootNodes) {
            compiledJSNodes.push(
                this.transformer.transformStatement(rootNode, {
                    transaction: tx,
                    currentFile: rootNode.location.filename
                })
            );
        }

        if (tx.isDebugMode()) {
            console.log("Compilation finished:");
            console.dir(compiledJSNodes, { depth: Infinity });
        }

        const generatedCodeString = compiledJSNodes
            .map(node => this.generator.generate(node))
            .join("\n");

        const outputFile = tx.getOutputFile();

        if (outputFile) {
            if (tx.isMkdirAllowed()) {
                const dir = path.dirname(outputFile);
                await mkdir(dir, { recursive: true });
            }

            await writeFile(outputFile, generatedCodeString, "utf8");
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
