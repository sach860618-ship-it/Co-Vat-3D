import * as THREE from 'three';
import { ThreeBehaviour } from '../../../utils/three/ThreeBehaviour';

export class ArtifactRotateBehaviour extends ThreeBehaviour {
    public rotationSpeed: THREE.Vector3;

    constructor(speed: THREE.Vector3 = new THREE.Vector3(0, 0.3, 0)) {
        super();
        this.rotationSpeed = speed;
    }

    public override Update(deltaTime: number) {
        if (this.object) {
            this.object.rotation.x += this.rotationSpeed.x * deltaTime;
            this.object.rotation.y += this.rotationSpeed.y * deltaTime;
            this.object.rotation.z += this.rotationSpeed.z * deltaTime;
        }
        super.Update(deltaTime);
    }
}