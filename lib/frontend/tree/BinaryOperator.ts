enum BinaryOperator {
    Plus = "+",
    Minus = "-",
    Multiply = "*",
    Divide = "/",
    Modulus = "%",
    Assignment = "=",
    Equal = "==",
    NotEqual = "!=",
    LessThan = "<",
    LessThanOrEqual = "<=",
    GreaterThan = ">",
    GreaterThanOrEqual = ">=",
    Union = "|",
    Intersection = "&"
}

export const ComparisonOperatorsExact = [
    BinaryOperator.Equal,
    BinaryOperator.NotEqual,
    BinaryOperator.LessThan,
    BinaryOperator.LessThanOrEqual,
    BinaryOperator.GreaterThan,
    BinaryOperator.GreaterThanOrEqual,
] as const;
export const ComparisonOperators = ComparisonOperatorsExact as readonly BinaryOperator[];
export type ComparisonOperator = (typeof ComparisonOperatorsExact)[Extract<
    keyof typeof ComparisonOperatorsExact,
    number
>];

export const AssignmentOperatorsExact = [BinaryOperator.Assignment] as const;
export const AssignmentOperators = AssignmentOperatorsExact as readonly BinaryOperator[];
export type AssignmentOperator = (typeof AssignmentOperatorsExact)[Extract<
    keyof typeof AssignmentOperatorsExact,
    number
>];

export default BinaryOperator;
