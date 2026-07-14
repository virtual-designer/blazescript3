const { ReflectionException } = require("./ReflectionException.cjs");
const { println } = require("../io/print.cjs");

const REFLECT_ANNOTATIONS_SYMBOL = Symbol("blaze.reflect.Annotations");
exports.REFLECT_ANNOTATIONS_SYMBOL = REFLECT_ANNOTATIONS_SYMBOL;

exports.debugDumpClassAnnotations = targetClass => {
    if (typeof targetClass !== "function") {
        throw new ReflectionException("Target is not a valid class");
    }

    const annotations = targetClass[REFLECT_ANNOTATIONS_SYMBOL];

    if (!annotations?.size) {
        return;
    }

    println("--- Annotation list begin: " + targetClass.name);
    let i = 0;

    for (const [annotationClass, factoryCallbacks] of annotations) {
        for (const factorCallback of factoryCallbacks) {
            const instance = factorCallback();
            print(`${i++}: `);
            println(instance);
        }
    }

    println("--- Annotation list end: " + targetClass.name);
};

exports.applyAnnotationToClass = (
    targetClass,
    annotationClass,
    argumentFactory
) => {
    if (typeof targetClass !== "function") {
        throw new ReflectionException("Target is not a valid class");
    }

    if (typeof annotationClass !== "function") {
        throw new ReflectionException("Annotation is not a valid class");
    }

    if (!(REFLECT_ANNOTATIONS_SYMBOL in targetClass)) {
        targetClass[REFLECT_ANNOTATIONS_SYMBOL] = new Map();
    }

    let instance = null;
    const factory = () =>
        argumentFactory
            ? (instance ??= new annotationClass(...argumentFactory()))
            : (instance ??= new annotationClass());

    const existingList =
        targetClass[REFLECT_ANNOTATIONS_SYMBOL].get(annotationClass);

    if (existingList) {
        existingList.push(factory);
    } else {
        targetClass[REFLECT_ANNOTATIONS_SYMBOL].set(annotationClass, [factory]);
    }
};
