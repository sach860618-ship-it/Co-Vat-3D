import * as THREE from 'three';

import * as CANNON from 'cannon-es';
import { ExtendThreeVector3 } from '../ExtendThreeVector3';
import { GUI } from "dat.gui";

export class CannonBodyAttachObject3D {
    public cannonBody: CANNON.Body;
    public object3D: THREE.Object3D;
    public offsetPosition: THREE.Vector3 = new THREE.Vector3();
    public syncRotation: boolean = true;

    public onUpdate(): void {
        if (this.cannonBody == null) {
            return;
        }
        if (this.object3D == null) {
            return;
        }

        this.object3D.position.set(
            this.cannonBody.position.x - this.offsetPosition.x,
            this.cannonBody.position.y - this.offsetPosition.y,
            this.cannonBody.position.z - this.offsetPosition.z
        );

        if (this.syncRotation) {
            this.object3D.quaternion.set(
                this.cannonBody.quaternion.x,
                this.cannonBody.quaternion.y,
                this.cannonBody.quaternion.z,
                this.cannonBody.quaternion.w
            );
        }
    }
}