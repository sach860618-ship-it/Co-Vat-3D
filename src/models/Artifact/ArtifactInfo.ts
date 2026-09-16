export interface IArtifactInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  thumbnail: string;
  modelUrl: string;
  audioUrl?: string;
}

export class ArtifactInfo implements IArtifactInfo {
  public readonly id: string;
  public readonly name: string;
  public readonly tagline: string;
  public readonly description: string;
  public readonly thumbnail: string;
  public readonly modelUrl: string;
  public readonly audioUrl?: string;

  constructor(data: IArtifactInfo) {
    this.id = data.id;
    this.name = data.name;
    this.tagline = data.tagline;
    this.description = data.description;
    this.thumbnail = data.thumbnail;
    this.modelUrl = data.modelUrl;
    this.audioUrl = data.audioUrl;
  }

  get hasAudio(): boolean {
    return Boolean(this.audioUrl);
  }

  get hasModel(): boolean {
    return Boolean(this.modelUrl);
  }

  get formattedTitle(): string {
    return `${this.name} (${this.tagline})`;
  }

  public getModelUrl(errorRate: number = 0): string {
    if (!this.modelUrl) {
      return '';
    }

    if (errorRate > 0 && Math.random() < errorRate) {
      return this.modelUrl.match(/(\.glb|\.gltf)$/i)
        ? this.modelUrl.replace(/(\.glb|\.gltf)$/i, '_error$1')
        : `${this.modelUrl}_error`;
    }

    return this.modelUrl;
  }

  public getmodelUrl(errorRate: number = 0): string {
    return this.getModelUrl(errorRate);
  }
}

export default ArtifactInfo;
