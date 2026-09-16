// PREVIEW ONLY: src/pages/DemoMovement/threejs/LoadingPipeline/LoadingPipeline.ts

import { NormalizedProgress } from "./NormalizedProgress";

export interface LoadingStepResult<T = any> {
    ok: boolean;
    result: T;
}

export class LoadingStep<T = any> {
    public weight: number = 1;
    public progress = new NormalizedProgress();
    public response: LoadingStepResult<T>;
    public execute: () => Promise<LoadingStepResult<T>>;
}