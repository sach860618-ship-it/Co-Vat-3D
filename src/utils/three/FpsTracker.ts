export interface FpsMetrics {
    fps: number;
    frameTimeMs: number;
}

export class FpsTracker {
    private frameCount = 0;
    private lastUpdateTime = performance.now();
    private updateIntervalMs: number;
    private onUpdate?: (metrics: FpsMetrics) => void;

    public currentFps = 0;
    public currentFrameTimeMs = 0;

    constructor(updateIntervalMs = 300, onUpdate?: (metrics: FpsMetrics) => void) {
        this.updateIntervalMs = updateIntervalMs;
        this.onUpdate = onUpdate;
    }

    public update(): void {
        this.frameCount++;
        const now = performance.now();
        const elapsed = now - this.lastUpdateTime;

        if (elapsed >= this.updateIntervalMs) {
            this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
            this.currentFrameTimeMs = parseFloat((elapsed / this.frameCount).toFixed(1));

            if (this.onUpdate) {
                this.onUpdate({
                    fps: this.currentFps,
                    frameTimeMs: this.currentFrameTimeMs,
                });
            }

            this.frameCount = 0;
            this.lastUpdateTime = now;
        }
    }

    public reset(): void {
        this.frameCount = 0;
        this.lastUpdateTime = performance.now();
        this.currentFps = 0;
        this.currentFrameTimeMs = 0;
    }
}
