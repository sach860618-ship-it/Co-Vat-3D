// PREVIEW ONLY: src/pages/DemoMovement/threejs/LoadingPipeline/RetryLoadingStep.ts
import { LoadingStep, LoadingStepResult } from "./LoadingStep";

export class RetryLoadingStep<T = any> {
    public step = new LoadingStep<T>();
    private innerStep: LoadingStep<T>;
    public maxRetries: number;
    public retryDelayMs: number;

    constructor(innerStep: LoadingStep<T>, maxRetries: number = 2, retryDelayMs: number = 1000) {
        this.innerStep = innerStep;
        this.step.weight = innerStep.weight;
        this.maxRetries = maxRetries;
        this.retryDelayMs = retryDelayMs;
        this.init();
    }

    public execute = async (): Promise<LoadingStepResult<T>> => {
        const totalAttempts = 1 + this.maxRetries;
        let lastResult: LoadingStepResult<T> = { ok: false, result: undefined };

        for (let attempt = 1; attempt <= totalAttempts; attempt++) {
            if (attempt > 1) {
                this.innerStep.progress.reset();
                this.step.progress.reset();
                await new Promise((res) => setTimeout(res, this.retryDelayMs));
            }

            // Đồng bộ tiến độ từ innerStep ra step bên ngoài
            this.innerStep.progress.onProgress = (val) => {
                this.step.progress.update(val);
            };

            const res = await this.innerStep.execute();
            lastResult = res;
            this.step.response = res;

            if (res.ok) {
                this.step.progress.complete();
                return res;
            }
        }

        return lastResult;
    };

    public init(): void {
        this.step.execute = this.execute;
    }
}