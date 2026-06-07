import type { Location } from "../frontend/tree/Location.ts";
import type { DiagnosticCode } from "./DiagnosticCode.ts";
import type { DiagnosticLevel } from "./DiagnosticLevel.ts";

export type Diagnostic = {
    inputLines: string[];
    message: string;
    location: Location;
    code: DiagnosticCode;
    level: DiagnosticLevel;
};
