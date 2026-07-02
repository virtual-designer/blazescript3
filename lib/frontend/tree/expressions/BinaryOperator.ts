enum BinaryOperator {
    Plus = "+",
    Minus = "-",
    Multiply = "*",
    Divide = "/",
    Modulus = "%",
    Equal = "==",
    NotEqual = "!=",
    LessThan = "<",
    LessThanOrEqual = "<=",
    GreaterThan = ">",
    GreaterThanOrEqual = ">=",
    Union = "|",
    Intersection = "&",
    Spaceship = "<=>"
}

export const ComparisonOperatorsExact = [
    BinaryOperator.Equal,
    BinaryOperator.NotEqual,
    BinaryOperator.LessThan,
    BinaryOperator.LessThanOrEqual,
    BinaryOperator.GreaterThan,
    BinaryOperator.GreaterThanOrEqual,
    BinaryOperator.Spaceship
] as const;
export const ComparisonOperators =
    ComparisonOperatorsExact as readonly BinaryOperator[];
export type ComparisonOperator = (typeof ComparisonOperatorsExact)[Extract<
    keyof typeof ComparisonOperatorsExact,
    number
>];

export default BinaryOperator;
