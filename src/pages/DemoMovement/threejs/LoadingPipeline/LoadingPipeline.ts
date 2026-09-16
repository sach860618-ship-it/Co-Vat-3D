// PREVIEW ONLY: src/pages/DemoMovement/threejs/LoadingPipeline/LoadingPipeline.ts
import { LinqUtils } from "../../../../utils/Unity/LinqUtils";
import { LoadingStep } from "./LoadingStep";

export interface LoadingStepItem<TData> {
    step: LoadingStep;
    data?: TData;
}

export class LoadingPipeline<TData> {
    public items: LoadingStepItem<TData>[] = [];
    public onProgress: (percent: number, data: TData, step: LoadingStep) => void;
    public onComplete: () => void;

    public getTotalWeight(): number {
        return LinqUtils.sum(this.items, (item) => item.step.weight);
    }

    public add(step: LoadingStep, data?: TData): this {
        this.items.push({ step, data });
        return this;
    }

    public getCurrentProgress(): number {
        const totalWeight = this.getTotalWeight();
        if (totalWeight === 0) return 0;
        const currentWeight = LinqUtils.sum(
            this.items,
            (item) => item.step.weight * item.step.progress.progress
        );
        return Math.min(currentWeight / totalWeight, 1);
    }

    public async executeSequentialAsync(): Promise<boolean> {
        for (const item of this.items) {
            const { step, data } = item;

            step.progress.onProgress = () => {
                this.onProgress?.(Math.round(this.getCurrentProgress() * 100), data, step);
            };
            this.onProgress?.(Math.round(this.getCurrentProgress() * 100), data, step);

            const response = await step.execute();
            step.response = response;

            if (!response?.ok) {
                continue;
            }

            step.progress.complete(); // Đảm bảo step đạt 100% khi xong
            this.onProgress?.(Math.round(this.getCurrentProgress() * 100), data, step);
        }

        this.onComplete?.();
        return true;
    }
}