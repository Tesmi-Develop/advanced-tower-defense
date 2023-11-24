type Unpacked<T> = T extends (infer U)[] ? U : T;

type ReadonlyDeep<T> = {
    readonly [P in keyof T]: ReadonlyDeep<T[P]>;
};