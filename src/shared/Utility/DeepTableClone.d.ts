declare function DeepTableClone<V>(value: ReadonlyArray<V>): Array<V>;
declare function DeepTableClone<V>(value: ReadonlySet<V>): Set<V>;
declare function DeepTableClone<K, V>(value: ReadonlyMap<K, V>): Map<K, V>;
declare function DeepTableClone<T extends object>(value: T): T;

export = DeepTableClone;
