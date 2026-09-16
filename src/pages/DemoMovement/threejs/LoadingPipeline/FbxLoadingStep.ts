// PREVIEW ONLY: src/pages/DemoMovement/threejs/LoadingPipeline/FbxLoadingStep.ts
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Group } from "three";
import { LoadingStep, LoadingStepResult } from "./LoadingStep";
import { RangeProgress } from "./RangeProgress";

export class FbxLoadingStep {
    public step = new LoadingStep<Group>();
    public url: string;
    public loader: FBXLoader;
    public byteProgress = new RangeProgress(0, 0);
    public estimatedSize: number = 0;

    constructor() {
        this.init();
    }

    public get loadedBytes(): number {
        return this.byteProgress.current;
    }

    public get totalBytes(): number {
        return this.byteProgress.max;
    }

    public getFormattedBytes(unit: "B" | "KB" | "MB" = "MB"): string {
        const divisor = unit === "MB" ? 1024 * 1024 : unit === "KB" ? 1024 : 1;
        const currentFormatted = (this.byteProgress.current / divisor).toFixed(2);
        const totalFormatted = (this.byteProgress.max / divisor).toFixed(2);
        return `${currentFormatted} / ${totalFormatted} ${unit}`;
    }

    public execute = async (): Promise<LoadingStepResult<Group>> => {
        return new Promise<LoadingStepResult<Group>>((resolve) => {
            this.loader.load(
                this.url,

                (fbx) => {
                    progressEl.textContent = 'Tải xong';
                },

                (xhr) => {
                    const loadedKB = (xhr.loaded / 1024).toFixed(1);
                    const totalKB = (xhr.total / 1024).toFixed(1);

                    progressEl.textContent =
                    `${loadedKB} KB / ${totalKB} KB`;
                }
                );
            this.loader.load(
                this.url,
                (fbx: Group) => {
                    this.byteProgress.complete();
                    this.step.progress.complete();
                    const result: LoadingStepResult<Group> = { ok: true, result: fbx };
                    this.step.response = result;
                    resolve(result);
                },
                (event: ProgressEvent) => {
                    if (event.lengthComputable && event.total > 0) {
                        this.byteProgress.update(event.loaded, event.total);
                        this.step.progress.update(this.byteProgress.normalized);
                    } else if (event.loaded > 0) {
                        const total = this.estimatedSize > 0 ? this.estimatedSize : event.loaded;
                        this.byteProgress.update(event.loaded, total);
                        this.step.progress.update(this.byteProgress.normalized);
                    }
                },
                (error) => {
                    console.error(`[FbxLoadingStep] Lỗi tải FBX: ${this.url}`, error);
                    const result: LoadingStepResult<Group> = { ok: false, result: undefined as any };
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