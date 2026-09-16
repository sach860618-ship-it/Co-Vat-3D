// PREVIEW ONLY: src/pages/DemoMovement/threejs/LoadingPipeline/RangeProgress.ts
import { MathUtils } from "three";

export class RangeProgress {
    public min: number;
    public max: number;
    private _current: number;

    public onProgress?: (current: number, max: number, normalized: number) => void;

    constructor(min: number = 0, max: number = 100) {
        this.min = min;
        this.max = max;
        this._current = min;
    }

    /** Giá trị hiện tại (ví dụ: bytes đã tải) */
    public get current(): number {
        return this._current;
    }

    /** Tỷ lệ chuẩn hóa về [0, 1] để LoadingPipeline tính % tổng thể */
    public get normalized(): number {
        const range = this.max - this.min;
        if (range <= 0) return 0;
        return MathUtils.clamp((this._current - this.min) / range, 0, 1);
    }

    public setRange(min: number, max: number): void {
        this.min = min;
        this.max = max;
    }

    public update(value: number, newMax?: number): void {
        if (newMax !== undefined) {
            this.max = newMax;
        }
        this._current = MathUtils.clamp(value, this.min, this.max);
        this.onProgress?.(this._current, this.max, this.normalized);
    }

    public complete(): void {
        this.update(this.max);
    }

    public reset(): void {
        this.update(this.min);
    }
}