import type CompilerTransaction from "../compiler/CompilerTransaction.ts";

export type TransformerContext = {
    transaction: CompilerTransaction;
    currentFile: string;
};
