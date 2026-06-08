import type { Location } from "../frontend/tree/Location.ts";
import type { DiagnosticCode } from "./DiagnosticCode.ts";
import type { DiagnosticLevel } from "./DiagnosticLevel.ts";

export type Diagnostic = {
    message: string;
    location: Location;
    code: DiagnosticCode;
    level: DiagnosticLevel;
    suggestions?: DiagnosticSuggestion[];
};

export type DiagnosticSuggestion = {
    columnOffset?: number;
    message: string;
};
