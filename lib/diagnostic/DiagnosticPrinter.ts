import chalk from "chalk";
import type { Diagnostic } from "./Diagnostic.ts";
import { DiagnosticLevel } from "./DiagnosticLevel.ts";

class DiagnosticPrinter {
    private warnings = 0;
    private errors = 0;
    private fileMap = new Map<string, string>();
    private cachedLineMap = new Map<string, readonly string[]>();

    public setFileMap(map: Map<string, string>) {
        this.fileMap = map;
    }

    public getLineList(filename: string) {
        let list = this.cachedLineMap.get(filename);

        if (list !== undefined) {
            return list;
        }

        const contents = this.fileMap.get(filename);

        if (contents === undefined) {
            return undefined;
        }

        list = contents.split("\n");
        this.cachedLineMap.set(filename, list);
        return list;
    }

    public reset() {
        this.warnings = 0;
        this.errors = 0;
    }

    private getLevelChalk(level: DiagnosticLevel) {
        switch (level) {
            case DiagnosticLevel.Note:
            case DiagnosticLevel.Debug:
                return chalk.gray;

            case DiagnosticLevel.Info:
                return chalk.cyan;

            case DiagnosticLevel.Warning:
                return chalk.yellow;

            case DiagnosticLevel.Error:
                return chalk.red;
        }
    }

    private printLog(diagnostic: Diagnostic, ...args: unknown[]) {
        console[
            diagnostic.level === DiagnosticLevel.Warning ||
            diagnostic.level === DiagnosticLevel.Error
                ? "error"
                : "info"
        ].call(console, ...args);
    }

    public print(...diagnostics: Diagnostic[]) {
        for (const diagnostic of diagnostics) {
            if (diagnostic.level === DiagnosticLevel.Warning) {
                this.warnings++;
            } else if (diagnostic.level === DiagnosticLevel.Error) {
                this.errors++;
            }

            this.printLog(
                diagnostic,
                chalk.whiteBright.bold(
                    `${diagnostic.location.filename}:${diagnostic.location.start[0]}:${diagnostic.location.start[1]}: `
                ) +
                    this.getLevelChalk(diagnostic.level).bold(
                        diagnostic.level + ": "
                    ) +
                    chalk.whiteBright(diagnostic.message) +
                    chalk.whiteBright(" [") +
                    this.getLevelChalk(diagnostic.level).bold(
                        `BL${diagnostic.code.toString().padStart(4, "0")}`
                    ) +
                    chalk.whiteBright("]")
            );

            this.printSource(diagnostic);
            this.printLog(diagnostic, "");
        }
    }

    private printSource(diagnostic: Diagnostic) {
        const lineCount =
            diagnostic.location.end[0] - diagnostic.location.start[0] + 1;
        const begin = Math.min(
            diagnostic.location.start[0],
            Math.max(
                1,
                lineCount < 2
                    ? diagnostic.location.start[0] - (2 - lineCount)
                    : 0
            )
        );

        const endLineNumberString = diagnostic.location.end[0].toString();
        const pad = Math.max(endLineNumberString.length, 3);
        let line = "";

        for (let i = begin; i <= diagnostic.location.end[0]; i++) {
            line =
                this.getLineList(diagnostic.location.filename)?.[i - 1] ?? "";
            const lineNumber = i.toString().padStart(pad, " ");
            const inNode =
                i >= diagnostic.location.start[0] &&
                i <= diagnostic.location.end[0];

            this.printLog(
                diagnostic,
                (inNode
                    ? this.getLevelChalk(diagnostic.level)
                    : chalk.gray
                ).bold(` ${lineNumber} | `) +
                    chalk.whiteBright(`${this.highlight(line)}`)
            );
        }

        const colStart =
            diagnostic.location.end[0] !== diagnostic.location.start[0]
                ? 1
                : diagnostic.location.start[1];
        const colEnd = diagnostic.location.end[1];
        const colLength = colEnd - colStart;

        const suggestions = diagnostic.suggestions ?? [];
        const sortedSuggestions = suggestions.toSorted(
            (a, b) => (b.columnOffset ?? 0) - (a.columnOffset ?? 0)
        );
        const barOffsets: number[] = [];

        for (const suggestion of sortedSuggestions) {
            barOffsets.unshift(suggestion.columnOffset ?? 0);
        }

        const smallestOffset = Math.min(...barOffsets);
        let underline = "";

        for (let i = 0; i < line.length; i++) {
            const computedIndex = smallestOffset < 0 ? smallestOffset + i : i;

            if (i === colStart - 1) {
                underline += "^" + "~".repeat(colLength - 1);
            } else if (i >= colStart - 1 && i <= colStart + colLength - 1) {
                continue;
            } else if (barOffsets.includes(computedIndex)) {
                underline += chalk.gray.bold("|");
            } else {
                underline += " ";
            }
        }

        this.printLog(
            diagnostic,
            ` ${" ".repeat(pad)}${this.getLevelChalk(diagnostic.level).bold(` | ${underline}`)}`
        );

        for (const suggestion of sortedSuggestions) {
            let suggestionPad = "";

            for (
                let i = 0;
                i <= colStart + (suggestion.columnOffset ?? 0) - 1;
                i++
            ) {
                const computedIndex =
                    smallestOffset < 0 ? smallestOffset + i : i;

                if (barOffsets.includes(computedIndex)) {
                    suggestionPad +=
                        computedIndex === (suggestion.columnOffset ?? 0)
                            ? chalk.white.bold("=>")
                            : chalk.gray.bold("|");

                    if (computedIndex === (suggestion.columnOffset ?? 0)) {
                        break;
                    }
                } else {
                    suggestionPad += " ";
                }
            }

            this.printLog(
                diagnostic,
                ` ${" ".repeat(pad)}${this.getLevelChalk(diagnostic.level).bold(`   ${suggestionPad}`)} ${chalk.white(suggestion.message)}`
            );
        }
    }

    private highlight(line: string) {
        return line
            .replaceAll(/[\[\]]/g, match => `${chalk.yellowBright.bold(match)}`)
            .replaceAll(
                /(\x1b\[\d+(;\d+)*m)?([A-Za-z_$][A-Za-z0-9_$]*)/g,
                match => `${chalk.whiteBright(this.stripANSI(`${match}`))}`
            )
            .replaceAll(
                /let|final|const|function|class|type|public|private|protected|override|extends|implements|uses|import|static|operator/g,
                match => `${chalk.blueBright.bold(this.stripANSI(match))}`
            )
            .replaceAll(
                /if|else|for|while|do|switch|match/g,
                match => `${chalk.magentaBright.bold(this.stripANSI(match))}`
            )
            .replaceAll(
                /[+\-*/%&|?~=]|(>>)|(<<)/g,
                match => `${chalk.yellow(match)}`
            )
            .replaceAll(/[\(\)]/g, match => `${chalk.magenta(match)}`)
            .replaceAll(/[\{\}]/g, match => `${chalk.whiteBright.bold(match)}`)
            .replaceAll(/;/g, match => `${chalk.gray(match)}`)
            .replaceAll(/:/g, match => `${chalk.whiteBright.dim(match)}`)
            .replaceAll(
                /("(.*)(!?"))|('(.*)(!?'))/g,
                match => `${chalk.green(this.stripANSI(match))}`
            );
    }

    private stripANSI(str: string) {
        return str.replaceAll(/\x1b\[\d+(;\d+)*m/gi, "");
    }

    public printSummary() {
        if (this.warnings > 0 || this.errors > 0) {
            let str = "";

            if (this.errors > 0) {
                str += `${this.errors} error${this.errors === 1 ? "" : "s"} `;
            }

            if (this.warnings > 0) {
                if (str) {
                    str += "and ";
                }

                str += `${this.warnings} warning${this.warnings === 1 ? "" : "s"} `;
            }

            str += "generated.";
            console.info(chalk.whiteBright.bold(str));
        }
    }

    public hasErrors(): boolean {
        return this.errors > 0;
    }
}

export default DiagnosticPrinter;
