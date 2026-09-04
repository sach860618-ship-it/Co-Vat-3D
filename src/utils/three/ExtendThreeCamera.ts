import * as THREE from 'three';

export class ExtendThreeCamera {
    static createDefaultPerspectiveCamera(width: number, height: number): THREE.PerspectiveCamera {
        const fov = 60;
        const near = 0.1;
        const far = 1000;

        const camera = new THREE.PerspectiveCamera(
            fov,
            width / height,
            near,
            far
        );

        // Unity-like default transform
        camera.position.set(0, 0, -10);
        camera.lookAt(0, 0, 0);

        return camera;
    }

    // Hàm mới: Tự động trích xuất kích thước từ React Ref
    public static createDefaultPerspectiveCameraFromRef(containerRef: React.RefObject<HTMLElement>): THREE.PerspectiveCamera {
        
        const width = containerRef.current?.clientWidth || window.innerWidth;
        const height = containerRef.current?.clientHeight || window.innerHeight;
        // Tái sử dụng logic khởi tạo ở hàm gốc
        return this.createDefaultPerspectiveCamera(width, height);
    }

    static resize(
        camera,
        width = window.innerWidth,
        height = window.innerHeight
    ) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}