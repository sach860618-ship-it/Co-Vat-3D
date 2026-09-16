// PREVIEW ONLY: src/pages/DemoMovement/threejs/LoadingProgress.ts
import { FBXLoader } from "three/examples/jsm/Addons.js";
import { FbxLoadingStep } from "./LoadingPipeline/FbxLoadingStep";

export class LoadingProgress {
    public getFBXLoader: () => FBXLoader;

    public createPlayerLoader(): FbxLoadingStep {
        const playerFbxUrl = new URL('../src/fbx/Player.fbx', import.meta.url).href;
        const playerLoadProgress = new FbxLoadingStep();
        playerLoadProgress.url = playerFbxUrl;
        playerLoadProgress.estimatedSize = 3375184; // ~3.3MB
        playerLoadProgress.loader = this.getFBXLoader();
        return playerLoadProgress;
    }

    public createPlayerIdleLoader(): FbxLoadingStep {
        // Đổi /public/... thành /models/...
        const playerFbxUrl = '/models/Animation/Happy Idle.fbx';
        const playerLoadProgress = new FbxLoadingStep();
        playerLoadProgress.url = playerFbxUrl;
        playerLoadProgress.estimatedSize = 637840; // ~622KB
        playerLoadProgress.loader = this.getFBXLoader();
        return playerLoadProgress;
    }

    public createPlayerWalkLoader(): FbxLoadingStep {
        // Đổi /public/... thành /models/...
        const playerFbxUrl = '/models/Animation/Strut Walking.fbx';
        const playerLoadProgress = new FbxLoadingStep();
        playerLoadProgress.url = playerFbxUrl;
        playerLoadProgress.estimatedSize = 419536; // ~410KB
        playerLoadProgress.loader = this.getFBXLoader();
        return playerLoadProgress;
    }
}