export class ValueRange {
    public readonly Min: number;
    public readonly Max: number;

    constructor(min: number, max: number) {
        this.Min = min;
        this.Max = max;
    }

    public GetRandomValue() {
        return math.random(this.Min, this.Max);
    }
}