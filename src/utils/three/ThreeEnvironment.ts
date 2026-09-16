import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export class ThreeEnvironment {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public clock = new THREE.Clock();



    public gridHelper: THREE.GridHelper;
    public createGridHelper(parent: THREE.Object3D): THREE.GridHelper {
        const gridHelper = new THREE.GridHelper(50, 50, 0x38bdf8, 0x334155);
        parent.add(gridHelper);
        return gridHelper;
    }

    public axesHelper: THREE.AxesHelper;
    public createAxesHelper(parent: THREE.Object3D): THREE.AxesHelper {
        const axesHelper = new THREE.AxesHelper(40);
        parent.add(axesHelper);
        return axesHelper;
    }

    public directionalLight: THREE.DirectionalLight;
    public createDirectionalLight(parent: THREE.Object3D): THREE.DirectionalLight {
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(15, 25, 15);
        directionalLight.castShadow = true;
        parent.add(directionalLight);
        return directionalLight;
    }

    public controls: OrbitControls;
    public createOrbitControls(): OrbitControls {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 60;
        controls.minDistance = 2;
        return controls;
    }

    public createDefaultBox(): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(0, 0.5, 0);
        cube.castShadow = true;
        cube.receiveShadow = true;
        this.scene.add(cube);
        return cube;
    }


    public createDefaultPlane(): THREE.Mesh {
        const geometry = new THREE.PlaneGeometry(1, 1);
        const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(0, 0, 0);
        plane.scale.set(1, 1, 1);
        plane.castShadow = true;
        plane.receiveShadow = true;
        this.scene.add(plane);
        return plane;
    }


    public directionalLightHelper: THREE.DirectionalLightHelper;
    public createDirectionalLightHelper(light: THREE.DirectionalLight): THREE.DirectionalLightHelper {
        const helper = new THREE.DirectionalLightHelper(light, 5, 0xff0000);
        this.scene.add(helper);
        return helper;
    }
}
