import * as THREE from 'three';
import { ArtifactInfo } from './ArtifactInfo';

export interface IArtifactTransform {
  position: THREE.Vector3;
  rotation?: THREE.Vector3;
  scale?: THREE.Vector3;
}

export interface IArtifactDisplayConfig {
  color?: number;              // Màu đèn bục/điểm nhấn đặc trưng của phòng trưng bày
  spotlightIntensity?: number; // Cường độ ánh sáng riêng tại vị trí đặt
}

export class ArtifactPlacement {
  public readonly artifact: ArtifactInfo;
  public readonly position: THREE.Vector3;
  public readonly rotation: THREE.Vector3;
  public readonly scale: THREE.Vector3;
  public readonly color: number;
  public readonly spotlightIntensity?: number;

  constructor(
    artifact: ArtifactInfo,
    transform: IArtifactTransform,
    displayConfig?: IArtifactDisplayConfig
  ) {
    this.artifact = artifact;
    this.position = transform.position;
    this.rotation = transform.rotation ?? new THREE.Vector3(0, 0, 0);
    this.scale = transform.scale ?? new THREE.Vector3(1, 1, 1);
    this.color = displayConfig?.color ?? 0x38bdf8;
    this.spotlightIntensity = displayConfig?.spotlightIntensity;
  }

  // Getters tiện ích tương thích ngược với Three.js render loop & pipeline
  get id(): string {
    return this.artifact.id;
  }

  get name(): string {
    return this.artifact.name;
  }

  get tagline(): string {
    return this.artifact.tagline;
  }

  get description(): string {
    return this.artifact.description;
  }

  get thumbnail(): string {
    return this.artifact.thumbnail;
  }

  get modelUrl(): string {
    return this.artifact.modelUrl;
  }

  get audioUrl(): string | undefined {
    return this.artifact.audioUrl;
  }

  public getModelUrl(errorRate: number = 0): string {
    return this.artifact.getModelUrl(errorRate);
  }

  public getmodelUrl(errorRate: number = 0): string {
    return this.artifact.getModelUrl(errorRate);
  }
}

export default ArtifactPlacement;
