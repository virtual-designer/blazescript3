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

export const AssignmentOperatorsExact = [BinaryOperator.Assignment] as const;
export const AssignmentOperators = AssignmentOperatorsExact as readonly BinaryOperator[];
export type AssignmentOperator = (typeof AssignmentOperatorsExact)[Extract<
    keyof typeof AssignmentOperatorsExact,
    number
>];

export default BinaryOperator;
