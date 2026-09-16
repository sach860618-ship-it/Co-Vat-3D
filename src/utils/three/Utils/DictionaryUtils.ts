export class DictionaryUtils {
    public static TryAddIfNotContains<TKey, TValue>(
        dictionary: Map<TKey, TValue>,
        key: TKey,
        value: TValue
    ): boolean {
        if (!dictionary.has(key)) {
            dictionary.set(key, value);
            return true;
        }
        return false;
    }
}