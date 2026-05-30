import path from "path";
import type { CompilerTransaction } from "./CompilerTransaction.ts";

class CompilerTransactionBuilder {
    private filepath?: string;
    private input?: string;
    private filename?: string;

    public setFile(path: string) {
        this.filepath = path;
        this.input = undefined;
        return this;
    }

    public setFileName(filename: string) {
        this.filename = filename;
        return this;
    }

    public setInput(data: string | Buffer<ArrayBufferLike>) {
        this.input = data.toString('utf8');
        this.filepath = undefined;
        return this;
    }

    public build(): CompilerTransaction {
        if (!((!this.filepath && this.input) || (!this.input && this.filepath))) {
            throw new Error("Invalid transaction data");
        }

        if (!this.filepath && !this.filename) {
            throw new Error("No file name provided");
        }

        return {
            filepath: this.filepath,
            filename: this.filename ?? path.basename(this.filepath!),
            input: this.input
        };
    }
}

export default CompilerTransactionBuilder;