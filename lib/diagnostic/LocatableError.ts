import type { Location } from "../frontend/tree/Location.ts";

export type LocatableError = Error & { location: Location };
export const isLocatableError = (error: unknown): error is LocatableError =>
    error instanceof Error && "location" in error;
