import type Token from "../lexer/Token.ts";
import type AbstractNode from "./AbstractNode.ts";

export type Location = {
    start: readonly [line: number, column: number];
    end: readonly [line: number, column: number];
    filename: string;
};

export const combineLocations = (
    ...nodes: (AbstractNode | Token | null | undefined)[]
) => {
    let start = [
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY
    ] as readonly [number, number];

    let end = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY] as readonly [
        number,
        number
    ];

    let firstNonNullNode;

    for (const node of nodes) {
        if (!node) {
            continue;
        }

        firstNonNullNode = node;

        if (
            node.location.end[0] > end[0] ||
            (node.location.end[0] === end[0] && node.location.end[1] > end[1])
        ) {
            end = node.location.end;
        }

        if (
            node.location.start[0] < start[0] ||
            (node.location.start[0] === start[0] &&
                node.location.start[1] < start[1])
        ) {
            start = node.location.start;
        }
    }

    if (!firstNonNullNode) {
        throw new Error("No node provided");
    }

    return {
        start,
        end,
        filename: firstNonNullNode.location.filename
    };
};
