export type InputSource = {
    filename: string;
    data: string | Buffer<ArrayBufferLike>;
};

class CompilerTransaction {
    private inputFiles: string[] = [];
    private inputSources: InputSource[] = [];
    private outputFile?: string;
    private classPaths: string[] = [];
    private debugMode: boolean = false;
    private mkdirAllowed: boolean = false;

    public getInputFiles() {
        return this.inputFiles ?? [];
    }

    public getInputSources() {
        return this.inputSources ?? [];
    }

    public getOutputFile() {
        return this.outputFile;
    }

    public getClassPaths() {
        return this.classPaths;
    }

    public isDebugMode() {
        return this.debugMode;
    }

    public isMkdirAllowed() {
        return this.mkdirAllowed;
    }

    public setDebugMode(value: boolean) {
        this.debugMode = value;
        return this;
    }

    public setMkdirAllowed(value: boolean) {
        this.mkdirAllowed = value;
        return this;
    }

    public addClassPaths(...roots: string[]) {
        this.classPaths?.push(...roots);
        return this;
    }

    public addInputFile(file: string) {
        this.inputFiles?.push(file);
        return this;
    }

    public addInputFiles(...files: string[]) {
        this.inputFiles?.push(...files);
        return this;
    }

    public addInputSource(
        filename: string,
        data: string | Buffer<ArrayBufferLike>
    ) {
        this.inputSources?.push({ filename, data });
        return this;
    }

    public addInputSources(sources: InputSource[]) {
        this.inputSources?.push(...sources);
        return this;
    }

    public setOutputFile(file: string) {
        this.outputFile = file;
        return this;
    }

    public validate() {
        if (!this.inputFiles?.length && !this.inputSources?.length) {
            throw new Error("No input provided");
        }
    }
}

export default CompilerTransaction;
