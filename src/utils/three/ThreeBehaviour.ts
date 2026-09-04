import * as THREE from "three";

export type Action = () => void;
export type UpdateAction = (deltaTime: number) => void;

export class ThreeBehaviour {
  public object!: THREE.Object3D;

  public OnStartAction?: Action;
  public OnUpdateAction?: UpdateAction;
  public OnLateUpdateAction?: UpdateAction;

  public Start() {
    this.OnStartAction?.();
  }

  public Update(deltaTime: number) {
    this.OnUpdateAction?.(deltaTime);
  }

  public LateUpdate(deltaTime: number) {
    this.OnLateUpdateAction?.(deltaTime);
  }
}

export class ThreeBehaviours {
  public Dictionary: Map<THREE.Object3D, ThreeBehaviour[]> = new Map();

  public Register<T extends ThreeBehaviour>(
    object: THREE.Object3D,
    behaviour: T
  ): T {
    behaviour.object = object;

    let behaviours = this.Dictionary.get(object);
    if (!behaviours) {
      behaviours = [];
      this.Dictionary.set(object, behaviours);
    }
    behaviours.push(behaviour);

    return behaviour;
  }

  public Start() {
    for (const behaviours of this.Dictionary.values()) {
      for (const behaviour of behaviours) {
        behaviour.Start();
      }
    }
  }

  public Update(deltaTime: number) {
    for (const behaviours of this.Dictionary.values()) {
      for (const behaviour of behaviours) {
        behaviour.Update(deltaTime);
      }
    }
  }

  public LateUpdate(deltaTime: number) {
    for (const behaviours of this.Dictionary.values()) {
      for (const behaviour of behaviours) {
        behaviour.LateUpdate(deltaTime);
      }
    }
  }

  public Remove(object: THREE.Object3D, behaviour?: ThreeBehaviour) {
    if (!behaviour) {
      this.Dictionary.delete(object);
      return;
    }

    const behaviours = this.Dictionary.get(object);
    if (behaviours) {
      const index = behaviours.indexOf(behaviour);
      if (index !== -1) {
        behaviours.splice(index, 1);
      }
      if (behaviours.length === 0) {
        this.Dictionary.delete(object);
      }
    }
  }

  public Get(object: THREE.Object3D): ThreeBehaviour[] | undefined {
    return this.Dictionary.get(object);
  }

  public GetFirst<T extends ThreeBehaviour>(
    object: THREE.Object3D,
    type?: new (...args: any[]) => T
  ): T | undefined {
    const behaviours = this.Dictionary.get(object);
    if (!behaviours || behaviours.length === 0) return undefined;

    if (type) {
      return behaviours.find((b): b is T => b instanceof type);
    }
    return behaviours[0] as T;
  }

  public Clear() {
    this.Dictionary.clear();
  }
}