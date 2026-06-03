import type ESTree from "estree";
import { generate } from "astring";

class CodeGenerator {
    public generate(node: ESTree.BaseNode): string {
        return generate(node);
    }
}

export default CodeGenerator;
