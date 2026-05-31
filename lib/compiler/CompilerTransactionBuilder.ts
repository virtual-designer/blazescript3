import type {
    CompilerTransaction,
    InputSource
} from "./CompilerTransaction.ts";

class CompilerTransactionBuilder {
    private inputFiles?: string[];
    private inputSources?: InputSource[];
    private outputFile?: string;

    public addInputFile(file: string) {
        this.inputFiles ??= [];
        this.inputFiles?.push(file);
        return this;
    }

    public addInputFiles(...files: string[]) {
        this.inputFiles ??= [];
        this.inputFiles?.push(...files);
        return this;
    }

    public addInputSource(
        filename: string,
        data: string | Buffer<ArrayBufferLike>
    ) {
        this.inputSources ??= [];
        this.inputSources?.push({ filename, data });
        return this;
    }
    
    public addInputSources(sources: InputSource[]) {
        this.inputSources ??= [];
        this.inputSources?.push(...sources);
        return this;
    }

    public setOutputFile(file: string) {
        this.outputFile = file;
        return this;
    }

    public build(): CompilerTransaction {
        if (!this.inputFiles?.length && !this.inputSources?.length) {
            throw new Error("No input provided");
        }

        return {
            inputFiles: this.inputFiles,
            inputSources: this.inputSources,
            outputFile: this.outputFile
        };
    }
}

export default CompilerTransactionBuilder;
