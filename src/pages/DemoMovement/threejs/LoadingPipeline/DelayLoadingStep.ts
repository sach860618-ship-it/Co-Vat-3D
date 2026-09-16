// PREVIEW ONLY: src/pages/DemoMovement/threejs/LoadingPipeline/DelayLoadingStep.ts
import { LoadingStep, LoadingStepResult } from "./LoadingStep";

export class DelayLoadingStep {
    public step = new LoadingStep<void>();
    public durationSec: number = 3;

    constructor(durationSec: number = 3, weight: number = 1) {
        this.durationSec = durationSec;
        this.step.weight = weight;
        this.init();
    }

    public execute = async (): Promise<LoadingStepResult<void>> => {
        const intervalMs = 50;
        const totalMs = this.durationSec * 1000;
        let elapsed = 0;

        return new Promise<LoadingStepResult<void>>((resolve) => {
            const timer = setInterval(() => {
                elapsed += intervalMs;
                const ratio = Math.min(elapsed / totalMs, 1);
                this.step.progress.update(ratio);

                if (ratio >= 1) {
                    clearInterval(timer);
                    this.step.progress.complete();
                    const result: LoadingStepResult<void> = { ok: true, result: undefined };
                    this.step.response = result;
                    resolve(result);
                }
            }, intervalMs);
        });
    };

    public init(): void {
        this.step.execute = this.execute;
    }
}