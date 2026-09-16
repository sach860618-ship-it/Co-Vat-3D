export class LinqUtils {
    public static sum<T>(
        list: T[],
        selector: (item: T) => number
    ): number {
        return list.reduce(
            (total, item) => total + selector(item),
            0
        );
    }
}