import * as THREE from 'three';
import React from 'react';

export class ExtendThreeRenderer {
    /**
     * Khởi tạo WebGLRenderer với các cài đặt chuẩn (antialias, pixel ratio, shadow map).
     */
    static createDefaultRenderer(
        width: number,
        height: number,
        options?: THREE.WebGLRendererParameters
    ): THREE.WebGLRenderer {
        const renderer = new THREE.WebGLRenderer({ antialias: true, ...options });
        renderer.setSize(width, height);
        // Giới hạn pixelRatio tối đa là 1.5 để cân bằng độ nét và hiệu năng
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        
        // Cấu hình đổ bóng (Shadow Map)
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        return renderer;
    }

    /**
     * Tự động trích xuất kích thước từ React Ref để khởi tạo Renderer.
     */
    public static createDefaultRendererFromRef(
        containerRef: React.RefObject<HTMLElement | null>,
        defaultWidth: number = window.innerWidth,
        defaultHeight: number = window.innerHeight,
        options?: THREE.WebGLRendererParameters
    ): THREE.WebGLRenderer {
        const width = containerRef.current?.clientWidth || defaultWidth;
        const height = containerRef.current?.clientHeight || defaultHeight;
        
        return this.createDefaultRenderer(width, height, options);
    }
}