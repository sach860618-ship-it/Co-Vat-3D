import { ThreeBehaviour } from "../../../utils/three/ThreeBehaviour";

import * as THREE from 'three';

import * as CANNON from 'cannon-es';
export class CannonBehaviour {
    public behaviour = new ThreeBehaviour();
    public root: THREE.Object3D;
    public world = new CANNON.World();

    public createRoot(): void {
        this.root = new THREE.Object3D();
    }

    public createPhysicWorld(): void {
        this.world.gravity.set(0, -9.82, 0); // Thiết lập trọng lực
        this.world.defaultContactMaterial.friction = 0;
        this.world.defaultContactMaterial.restitution = 0;
    }

    public init(): void {
        this.createRoot();
        this.createPhysicWorld();

        this.behaviour.OnUpdateAction = (delta) => this.world.step(delta);
    }
}