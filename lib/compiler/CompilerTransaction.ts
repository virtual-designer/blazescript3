export type CompilerTransaction = {
    inputFiles?: string[];
    inputSources?: InputSource[];
    outputFile?: string;
};

export type InputSource = {
    filename: string;
    data: string | Buffer<ArrayBufferLike>;
};