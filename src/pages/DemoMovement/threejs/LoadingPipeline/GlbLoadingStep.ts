// PREVIEW ONLY: src/pages/DemoMovement/threejs/LoadingPipeline/GlbLoadingStep.ts
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { LoadingStep, LoadingStepResult } from "./LoadingStep";

export interface GlbLoadingStepOptions {
    loader?: GLTFLoader;
    weight?: number;
}

export class GlbLoadingStep {
    public step = new LoadingStep<GLTF>();
    public url: string;
    public loader: GLTFLoader;

    constructor() {
        this.init();
    }

    public execute = async (): Promise<LoadingStepResult<GLTF>> => {
        return new Promise<LoadingStepResult<GLTF>>((resolve) => {
            this.loader.load(
                this.url,
                (gltf: GLTF) => {
                    this.step.progress.complete();
                    const result: LoadingStepResult<GLTF> = { ok: true, result: gltf };
                    this.step.response = result;
                    resolve(result);
                },
                (event: ProgressEvent<EventTarget>) => {
                    if (event.lengthComputable && event.total > 0) {
                        const ratio = event.loaded / event.total;
                        this.step.progress.update(ratio);
                    }
                },
                (error: unknown) => {
                    console.error(`[GlbLoadingStep] Lỗi tải GLB: ${this.url}`, error);
                    const result: LoadingStepResult<GLTF> = { ok: false, result: undefined };
                    this.step.response = result;
                    resolve(result);
                }
            );
        });
    };

    public init(): void {
        this.step.execute = this.execute;
    }
}