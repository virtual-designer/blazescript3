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
    RangeExpression,
    FunctionDeclaration,
    FunctionParameterDeclaration,
    AwaitExpression,
    ReturnStatement,
    ImportStatement,
    AssignmentExpression
}

export default NodeType;
