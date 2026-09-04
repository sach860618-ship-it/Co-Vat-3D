import * as THREE from 'three';
export class ExtendThreeScene {
    /**
     * Khởi tạo một THREE.Scene cơ bản với màu nền mặc định giống Unity
     * @param backgroundColor Mã màu nền (mặc định: màu xanh xám của Unity 0x314D79)
     */
    static createDefaultScene(): THREE.Scene {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x314D79); // Màu nền mặc định giống Unity
        scene.fog = new THREE.Fog(0x314D79, 10, 100); // Thêm hiệu ứng sương mù để tạo chiều sâu
        return scene;
    }
}