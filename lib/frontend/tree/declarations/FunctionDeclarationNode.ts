import type Token from "../../lexer/Token.ts";
import DeclarationNode from "../DeclarationNode.ts";
import type IdentifierNode from "../expressions/IdentifierNode.ts";
import type { TypeExpressionNode } from "../expressions/TypeExpressionNode.ts";
import type { Location } from "../Location.ts";
import NodeType from "../NodeType.ts";
import type BlockStatementNode from "../statements/BlockStatementNode.ts";
import type { AccessModifier } from "./AccessModifier.ts";
import { FunctionDeclarationModifier } from "./FunctionDeclarationModifier.ts";
import type FunctionParameterDeclarationNode from "./FunctionParameterDeclarationNode.ts";

class FunctionDeclarationNode extends DeclarationNode {
    public override readonly type = NodeType.FunctionDeclaration;
    public readonly identifier: IdentifierNode;
    public readonly returnType?: TypeExpressionNode;
    public readonly parameters: FunctionParameterDeclarationNode[];
    public readonly accessModifier: AccessModifier | null;
    public readonly accessModifierToken: Token | null;
    public readonly functionModifiers: FunctionDeclarationModifier;
    public readonly functionModifierTokens: Partial<
        Record<FunctionDeclarationModifier, Token>
    >;
    public readonly body: BlockStatementNode;

    public constructor(
        identifier: IdentifierNode,
        returnType: TypeExpressionNode | undefined,
        parameters: FunctionParameterDeclarationNode[],
        accessModifier: AccessModifier | null,
        accessModifierToken: Token | null,
        functionModifiers: FunctionDeclarationModifier | null,
        functionModifierTokens: Partial<
            Record<FunctionDeclarationModifier, Token>
        >,
        body: BlockStatementNode,
        location: Location
    ) {
        super(location);
        this.identifier = identifier;
        this.returnType = returnType;
        this.parameters = parameters;
        this.accessModifier = accessModifier;
        this.accessModifierToken = accessModifierToken;
        this.functionModifiers =
            functionModifiers ?? FunctionDeclarationModifier.None;
        this.functionModifierTokens = functionModifierTokens;
        this.body = body;
    }

    public override branches() {
        return [
            ...super.branches(),
            this.identifier,
            this.returnType,
            ...this.parameters,
            this.body
        ];
    }
}

export default FunctionDeclarationNode;
