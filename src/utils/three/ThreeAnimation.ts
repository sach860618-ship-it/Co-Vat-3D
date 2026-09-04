import * as THREE from "three";

export class ThreeAnimation {
    public mixer: THREE.AnimationMixer;

    private states = new Map<string, THREE.AnimationAction>();
    private currentState?: THREE.AnimationAction;

    public setRoot(root: THREE.Object3D): void {
        this.mixer = new THREE.AnimationMixer(root);
    }

    public add(
        name: string,
        clip: THREE.AnimationClip
    ): THREE.AnimationAction {
        const action = this.mixer.clipAction(clip);

        this.states.set(name, action);

        return action;
    }

  /**
   * Chuyển sang animation khác
   */
  public play(
    name: string,
    fadeDuration
  ): void {
    const next = this.states.get(name);

    if (!next) {
      console.warn(`Animation "${name}" not found`);
      return;
    }

    // Đang play animation này
    if (this.currentState === next) {
      return;
    }

    const previous = this.currentState;

    next
      .reset()
      .setLoop(THREE.LoopRepeat, Infinity)
      .setEffectiveTimeScale(1)
      .play();

    if (previous) {
      next.crossFadeFrom(
        previous,
        fadeDuration,
        true
      );
    }

    this.currentState = next;
  }

  /**
   * Animation hiện tại
   */
  public get current(): THREE.AnimationAction | undefined {
    return this.currentState;
  }

  /**
   * Kiểm tra animation hiện tại
   */
  public is(name: string): boolean {
    return this.states.get(name) === this.currentState;
  }

  /**
   * Dừng animation hiện tại
   */
  public stop(): void {
    this.currentState?.stop();
    this.currentState = undefined;
  }

  /**
   * Pause animation hiện tại
   */
  public pause(): void {
    if (this.currentState) {
      this.currentState.paused = true;
    }
  }

  /**
   * Resume animation hiện tại
   */
  public resume(): void {
    if (this.currentState) {
      this.currentState.paused = false;
    }
  }

  /**
   * Set tốc độ animation hiện tại
   */
  public setSpeed(speed: number): void {
    this.currentState?.setEffectiveTimeScale(speed);
  }

  /**
   * Update mixer
   */
  public update(deltaTime: number): void {
    if(!this.mixer) {
      return;
    }
    this.mixer.update(deltaTime);
  }

  /**
   * Lấy animation
   */
  public get(name: string): THREE.AnimationAction | undefined {
    return this.states.get(name);
  }

  /**
   * Kiểm tra animation tồn tại
   */
  public has(name: string): boolean {
    return this.states.has(name);
  }

  /**
   * Xóa animation
   */
  public remove(name: string): void {
    const action = this.states.get(name);

    if (!action) return;

    action.stop();
    this.states.delete(name);

    if (this.currentState === action) {
      this.currentState = undefined;
    }
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    this.mixer.stopAllAction();
    this.states.clear();
    this.currentState = undefined;
  }
}