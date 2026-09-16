export interface BackgroundAssetStatus {
    total: number;
    loaded: number;
    failed?: number;
    currentName: string;
    isComplete: boolean;
}
