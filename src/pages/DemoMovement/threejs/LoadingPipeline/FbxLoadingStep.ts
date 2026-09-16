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
    private _estimatedSize: number = 0;

    constructor() {
        this.init();
    }

    public get estimatedSize(): number {
        return this._estimatedSize;
    }

    public set estimatedSize(size: number) {
        this._estimatedSize = size;
        if (size > 0 && this.byteProgress.max === 0) {
            this.byteProgress.max = size;
        }
    }

    public get loadedBytes(): number {
        return this.byteProgress.current;
    }

    public get totalBytes(): number {
        return this.byteProgress.max > 0 ? this.byteProgress.max : this.estimatedSize;
    }

    public getFormattedBytes(unit: "B" | "KB" | "MB" = "MB"): string {
        const divisor = unit === "MB" ? 1024 * 1024 : unit === "KB" ? 1024 : 1;
        const currentFormatted = (this.byteProgress.current / divisor).toFixed(2);
        const total = this.totalBytes;
        if (total > 0) {
            const totalFormatted = (total / divisor).toFixed(2);
            return `${currentFormatted} / ${totalFormatted} ${unit}`;
        }
        return `${currentFormatted} ${unit}`;
    }

    public execute = async (): Promise<LoadingStepResult<Group>> => {
        return new Promise<LoadingStepResult<Group>>((resolve) => {
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
                    const total = (event.lengthComputable && event.total > 0)
                        ? event.total
                        : (this.estimatedSize > 0 ? this.estimatedSize : event.loaded);

                    this.byteProgress.update(event.loaded, total);
                    this.step.progress.update(this.byteProgress.normalized);

                    const loadedKB = (event.loaded / 1024).toFixed(1);
                    const totalKB = (total / 1024).toFixed(1);
                    console.log(`[FBX Load] ${loadedKB} KB / ${totalKB} KB`);
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