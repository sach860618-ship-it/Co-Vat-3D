
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { CannonBodyAttachObject3D } from '../../../../utils/three/CANNON/CannonBodyAttachObject3D';

export class Chair {
    public cannonBodyAttachBox = new CannonBodyAttachObject3D();
    public createDisplay(): { object3D: THREE.Group; cannonBody: CANNON.Body } {
        const chairGroup = new THREE.Group();
        chairGroup.name = "Chair";

        const chairMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b5a2b,
            roughness: 0.6,
            metalness: 0.1,
        });

        // 1. Mặt ghế (Seat) - 0.6 x 0.08 x 0.6
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), chairMaterial);
        seat.position.set(0, 0.45, 0);
        seat.castShadow = true;
        seat.receiveShadow = true;
        chairGroup.add(seat);

        // 2. Lưng tựa (Backrest) - 0.6 x 0.55 x 0.08
        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.08), chairMaterial);
        backrest.position.set(0, 0.725, -0.26);
        backrest.castShadow = true;
        backrest.receiveShadow = true;
        chairGroup.add(backrest);

        // 3. 4 Chân ghế (Legs) - 0.08 x 0.41 x 0.08
        const legGeometry = new THREE.BoxGeometry(0.08, 0.41, 0.08);
        const legOffsets: [number, number, number][] = [
            [-0.24, 0.205, -0.24],
            [0.24, 0.205, -0.24],
            [-0.24, 0.205, 0.24],
            [0.24, 0.205, 0.24],
        ];

        legOffsets.forEach(([x, y, z]) => {
            const leg = new THREE.Mesh(legGeometry, chairMaterial);
            leg.position.set(x, y, z);
            leg.castShadow = true;
            leg.receiveShadow = true;
            chairGroup.add(leg);
        });

        // Physics Body (CANNON)
        const cannonBody = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.KINEMATIC,
            position: new CANNON.Vec3(0, 0, 0),
        });

        // Shape mặt ghế
        cannonBody.addShape(
            new CANNON.Box(new CANNON.Vec3(0.3, 0.04, 0.3)),
            new CANNON.Vec3(0, 0.45, 0)
        );

        // Shape lưng tựa
        cannonBody.addShape(
            new CANNON.Box(new CANNON.Vec3(0.3, 0.275, 0.04)),
            new CANNON.Vec3(0, 0.725, -0.26)
        );

        // Shape 4 chân ghế
        const legHalfExtents = new CANNON.Vec3(0.04, 0.205, 0.04);
        legOffsets.forEach(([x, y, z]) => {
            cannonBody.addShape(new CANNON.Box(legHalfExtents), new CANNON.Vec3(x, y, z));
        });

        return { object3D: chairGroup, cannonBody };
    }
}