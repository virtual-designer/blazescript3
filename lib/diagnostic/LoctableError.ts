import type { Location } from "../frontend/tree/Location.ts";

export type LoctableError = Error & { location: Location };
export const isLocatableError = (error: unknown): error is LoctableError =>
    error instanceof Error && "location" in error;
