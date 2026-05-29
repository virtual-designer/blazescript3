import { defineConfig } from "vitest/config";
import path from 'path';

export default defineConfig({
    test: {
        dir: path.resolve(import.meta.dirname, "tests"),
        alias: {
            "@lib": path.resolve(import.meta.dirname, "lib"),
        }
    }
});
