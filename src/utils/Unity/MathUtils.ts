export class MathUtils {
    public static clamp(value: number, min: number, max: number): number {
        let result = value;

        result = Math.min(max, result);
        result = Math.max(min, result);

        return result;
    }
}