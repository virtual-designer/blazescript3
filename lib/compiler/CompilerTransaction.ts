export type CompilerTransaction = {
    inputFiles?: string[];
    inputSources?: InputSource[];
    outputFile?: string;
    debugMode?: boolean;
};

export type InputSource = {
    filename: string;
    data: string | Buffer<ArrayBufferLike>;
};
