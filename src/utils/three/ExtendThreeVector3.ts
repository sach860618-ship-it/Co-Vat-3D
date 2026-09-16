import * as THREE from 'three';

export class ExtendThreeVector3 {
    public static zero = new THREE.Vector3(0, 0, 0);
    public static one = new THREE.Vector3(1, 1, 1);
    public static up = new THREE.Vector3(0, 1, 0);
    public static down = new THREE.Vector3(0, -1, 0);
    public static left = new THREE.Vector3(-1, 0, 0);
    public static right = new THREE.Vector3(1, 0, 0);
}