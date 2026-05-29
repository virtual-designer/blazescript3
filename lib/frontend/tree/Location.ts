export type Location = {
    start: readonly [line: number, column: number];
    end: readonly [line: number, column: number];
    filename: string;
};