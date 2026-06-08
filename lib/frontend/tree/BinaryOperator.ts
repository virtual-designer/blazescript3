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

export const ComparsionOperatorsExact = [
    BinaryOperator.Equal,
    BinaryOperator.NotEqual,
    BinaryOperator.LessThan,
    BinaryOperator.LessThanOrEqual,
    BinaryOperator.GreaterThan,
    BinaryOperator.GreaterThanOrEqual,
] as const;
export const ComparsionOperators = ComparsionOperatorsExact as readonly BinaryOperator[];
export type ComparsionOperator = (typeof ComparsionOperatorsExact)[Extract<
    keyof typeof ComparsionOperatorsExact,
    number
>];

export const AssignmentOperatorsExact = [BinaryOperator.Assignment] as const;
export const AssignmentOperators = AssignmentOperatorsExact as readonly BinaryOperator[];
export type AssignmentOperator = (typeof AssignmentOperatorsExact)[Extract<
    keyof typeof AssignmentOperatorsExact,
    number
>];

export default BinaryOperator;
