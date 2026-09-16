import { MathUtils } from "three";

export class NormalizedProgress {
    private static readonly MIN_PROGRESS = 0;
    private static readonly MAX_PROGRESS = 1;

    private currentProgress = NormalizedProgress.MIN_PROGRESS;

    public onProgress: (progress: number) => void;


    public get progress(): number {
        return this.currentProgress;
    }

    public reset(): void {
        this.update(NormalizedProgress.MIN_PROGRESS);
    }

    public complete(): void {
        this.update(NormalizedProgress.MAX_PROGRESS);
    }

    public update(progress: number): void {
        this.currentProgress = MathUtils.clamp(
            progress,
            NormalizedProgress.MIN_PROGRESS,
            NormalizedProgress.MAX_PROGRESS
        );

        this.onProgress?.(this.currentProgress);
    }
}