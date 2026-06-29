enum NodeType {
    Root,
    Literal,
    UnaryExpression,
    BinaryExpression,
    VariableDeclaration,
    CallExpression,
    Identifier,
    MatchExpression,
    MatchExpressionCase,
    IfStatement,
    BlockStatement,
    ExpressionStatement,
    ForStatement,
    ForInStatement,
    EmptyStatement,
    WhileStatement,
    DoStatement,
    RangeExpression,
    FunctionDeclaration,
    FunctionParameterDeclaration,
}

export default NodeType;
