import ESTree from "estree";
import { existsSync } from "node:fs";
import path from "node:path";
import ImportStatementNode from "../../frontend/tree/statements/ImportStatementNode.ts";
import type { EmitterResult } from "../EmitterResult.ts";
import { ESTreeEmitter } from "../ESTreeEmitter.ts";
import type { TransformerContext } from "../TransformerContext.ts";
import IdentifierEmitter from "./IdentifierEmitter.ts";

class ImportStatementEmitter extends ESTreeEmitter<
    ImportStatementNode,
    ESTree.ImportDeclaration
> {
    public override readonly NODE_TYPE = ImportStatementNode;

    public override emit(
        node: ImportStatementNode,
        context: TransformerContext
    ): EmitterResult<ESTree.ImportDeclaration> {
        let filepath = [
            ...node.path.map(id => id.symbol),
            `${node.identifier.symbol}.js`
        ].join("/");

        let sourceFilePath = [
            ...node.path.map(id => id.symbol),
            `${node.identifier.symbol}.bl`
        ].join("/");

        let sourceClasspath = "";

        for (const classpath of ["", ...context.transaction.getClassPaths()]) {
            const fullpath = path.join(classpath, sourceFilePath);

            if (!existsSync(fullpath)) {
                continue;
            }

            sourceClasspath = classpath;
            break;
        }

        const sourcePackageWithClassPath = path.dirname(
            context.currentFile.startsWith(sourceClasspath)
                ? context.currentFile
                      .slice(sourceClasspath.length)
                      .replaceAll(/^\/+/g, "")
                : context.currentFile
        );

        filepath = filepath.startsWith(sourcePackageWithClassPath)
            ? filepath
                  .slice(sourcePackageWithClassPath.length)
                  .replaceAll(/^\/+/g, "")
            : filepath;
        filepath = filepath.startsWith("/") ? filepath : "./" + filepath;

        const identifier = this.transformer
            .getEmitter(IdentifierEmitter)
            .emit(node.identifier, context);

        return this.combine(
            {
                type: "ImportDeclaration",
                source: {
                    type: "Literal",
                    value: filepath
                },
                specifiers: [
                    {
                        type: "ImportSpecifier",
                        local: identifier.node,
                        imported: identifier.node
                    }
                ],
                attributes: []
            },
            identifier
        );
    }
}

export default ImportStatementEmitter;
