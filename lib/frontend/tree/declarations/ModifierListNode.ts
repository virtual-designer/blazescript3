import type Token from "../../lexer/Token.ts";
import AbstractNode from "../AbstractNode.ts";
import { combineLocations } from "../Location.ts";
import NodeType from "../NodeType.ts";

class ModifierListNode<T extends PropertyKey> extends AbstractNode {
    public override readonly type = NodeType.ModifierList;
    public readonly modifierMap: ReadonlyMap<T, Token>;
    public readonly modifiers: ReadonlySet<T>;
    public readonly tokens: ReadonlyArray<Token>;

    public constructor(modifiers: Map<T, Token>) {
        super(combineLocations(...modifiers.values()));
        this.modifierMap = modifiers;
        this.modifiers = new Set(this.modifierMap.keys());
        this.tokens = [...this.modifierMap.values()];
    }

    public has(modifier: T) {
        return this.modifierMap.has(modifier);
    }
}

export default ModifierListNode;
