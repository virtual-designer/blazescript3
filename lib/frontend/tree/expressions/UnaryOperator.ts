enum UnaryOperator {
    Plus = "+",
    Minus = "-",
    Not = "!",
    Increment = "++",
    Decrement = "--"
}

export const PrefixUnaryOperators = [
    UnaryOperator.Plus,
    UnaryOperator.Minus,
    UnaryOperator.Not,
    UnaryOperator.Increment,
    UnaryOperator.Decrement
];

export const PostfixUnaryOperators = [
    UnaryOperator.Increment,
    UnaryOperator.Decrement
];

export default UnaryOperator;
