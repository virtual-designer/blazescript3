import chalk from "chalk";
import type { Diagnostic } from "./Diagnostic.ts";
import { DiagnosticLevel } from "./DiagnosticLevel.ts";

class DiagnosticPrinter {
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
            this.printLog(
                diagnostic,
                chalk.whiteBright.bold(
                    `${diagnostic.location.filename}:${diagnostic.location.start[0]}:${diagnostic.location.start[1]}: `
                ) +
                    this.getLevelChalk(diagnostic.level).bold(
                        diagnostic.level + ": "
                    ) +
                    chalk.whiteBright(diagnostic.message)
            );

            this.printSource(diagnostic);
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

        for (let i = begin; i <= diagnostic.location.end[0]; i++) {
            const line = diagnostic.inputLines[i - 1] ?? "";
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

        const underline =
            " ".repeat(colStart - 1) +
            "^" +
            "~".repeat(Math.max(colLength - 1, 0));

        this.printLog(
            diagnostic,
            ` ${" ".repeat(pad)}${this.getLevelChalk(diagnostic.level)(` | ${underline}`)}`
        );
    }

    private highlight(line: string) {
        return line
            .replaceAll(
                /[A-Za-z_$][A-Za-z0-9_$]+/g,
                match => `${chalk.whiteBright.bold(match)}`
            )
            .replaceAll(
                /let|final|const|function|class|type|public|private|protected|override|extends|implements|uses|import|static|operator/g,
                match => `${chalk.blueBright.bold(match)}`
            )
            .replaceAll(
                /[+\-*/%&(&&)|(||)?~(>>)(<<)]?=/g,
                match => `${chalk.yellow(match)}`
            )
            .replaceAll(/;/g, match => `${chalk.gray(match)}`);
    }
}

export default DiagnosticPrinter;
