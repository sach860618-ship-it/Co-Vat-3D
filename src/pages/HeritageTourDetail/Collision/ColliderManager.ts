import * as THREE from 'three';
import { MeshBVH, BVHHelper, StaticGeometryGenerator } from 'three-mesh-bvh';

export interface BVHColliderOptions {
    playerRadius?: number;
    playerHeight?: number;
}

interface DynamicCollider {
    mesh: THREE.Mesh;
    helper?: BVHHelper;
}

export class ColliderManager {
    private scene: THREE.Scene | null = null;
    private staticColliderMesh: THREE.Mesh | null = null;
    private staticBVHHelper?: BVHHelper;
    private dynamicColliders: DynamicCollider[] = [];

    private playerHelper?: THREE.LineSegments;
    private playerTarget?: THREE.Object3D;
    private playerRadius: number = 0.8;
    private playerHeight: number = 6.8;
    private helpersVisible: boolean = false;

    // Các biến tạm tái sử dụng trong vòng lặp tránh cấp phát bộ nhớ liên tục (GC allocation)
    private tempSegment = new THREE.Line3();
    private tempBox = new THREE.Box3();
    private triPoint = new THREE.Vector3();
    private capsulePoint = new THREE.Vector3();
    private pushDir = new THREE.Vector3();

    private localSegment = new THREE.Line3();
    private localBox = new THREE.Box3();
    private localPushDir = new THREE.Vector3();
    private invMat = new THREE.Matrix4();
    private tempMeshWorldBox = new THREE.Box3();
    private localRay = new THREE.Ray();

    // Biến tạm phục vụ tính toán va chạm hình cầu (Quả bóng)
    private tempSphereBox = new THREE.Box3();
    private tempSpherePoint = new THREE.Vector3();
    private tempSphereNormal = new THREE.Vector3();
    private localSphereBox = new THREE.Box3();
    private localSpherePos = new THREE.Vector3();
    private localSpherePoint = new THREE.Vector3();

    constructor(scene?: THREE.Scene, options?: BVHColliderOptions) {
        if (scene) {
            this.scene = scene;
        }
        if (options?.playerRadius) {
            this.playerRadius = options.playerRadius;
        }
        if (options?.playerHeight) {
            this.playerHeight = options.playerHeight;
        }
    }

    public setScene(scene: THREE.Scene) {
        this.scene = scene;
    }

    /**
     * Thiết lập không gian môi trường tĩnh (Phòng trưng bày, tường, sàn, cột)
     */
    public setStaticEnvironment(environment: THREE.Object3D) {
        if (!environment) return;
        environment.updateMatrixWorld(true);

        const generator = new StaticGeometryGenerator(environment);
        generator.attributes = ['position'];
        const mergedGeometry = generator.generate();

        mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);
        this.staticColliderMesh = new THREE.Mesh(mergedGeometry);

        if (this.staticBVHHelper && this.scene) {
            this.scene.remove(this.staticBVHHelper);
            this.staticBVHHelper.dispose();
            this.staticBVHHelper = undefined;
        }

        if (this.scene) {
            this.staticBVHHelper = new BVHHelper(this.staticColliderMesh, 10);
            this.staticBVHHelper.visible = this.helpersVisible;
            this.scene.add(this.staticBVHHelper);
        }
    }

    /**
     * Thêm đối tượng động (Cổ vật xoay tròn, vật thể di chuyển)
     * BVH và BVHHelper sẽ gắn trực tiếp theo Mesh và tự động xoay/di chuyển theo thời gian thực.
     */
    public addDynamicObject(object: THREE.Object3D) {
        if (!object) return;
        object.updateMatrixWorld(true);

        object.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (mesh.isMesh && mesh.geometry) {
                if (!mesh.geometry.boundsTree) {
                    mesh.geometry.boundsTree = new MeshBVH(mesh.geometry);
                }

                let helper: BVHHelper | undefined;
                if (this.scene) {
                    helper = new BVHHelper(mesh, 8);
                    helper.visible = this.helpersVisible;
                    this.scene.add(helper);
                }

                this.dynamicColliders.push({ mesh, helper });
            }
        });
    }

    /**
     * Tương thích ngược: Xây dựng collider từ danh sách objects
     */
    public buildFromObjects(objects: THREE.Object3D | THREE.Object3D[]) {
        const objArray = Array.isArray(objects) ? objects : [objects];
        if (objArray.length === 0) return;
        this.setStaticEnvironment(objArray[0]);
        for (let i = 1; i < objArray.length; i++) {
            this.addDynamicObject(objArray[i]);
        }
    }

    /**
     * Gắn Capsule Collider Helper cho Player để hiển thị trực quan
     */
    public attachPlayer(player: THREE.Object3D, radius: number = this.playerRadius, height: number = this.playerHeight) {
        this.playerTarget = player;
        this.playerRadius = radius;
        this.playerHeight = height;

        if (this.playerHelper && this.scene) {
            this.scene.remove(this.playerHelper);
            this.playerHelper.geometry.dispose();
            this.playerHelper = undefined;
        }

        const cylinderHeight = Math.max(0.01, height - 2 * radius);
        const geom = new THREE.CapsuleGeometry(radius, cylinderHeight, 4, 12);
        geom.translate(0, height / 2, 0); // Đặt đáy capsule tại chân nhân vật (Y=0)
        const wireframeGeom = new THREE.WireframeGeometry(geom);
        const material = new THREE.LineBasicMaterial({ color: 0x10b981 }); // Màu xanh ngọc lục bảo (emerald-500)

        this.playerHelper = new THREE.LineSegments(wireframeGeom, material);
        this.playerHelper.position.copy(player.position);
        this.playerHelper.visible = this.helpersVisible;

        if (this.scene) {
            this.scene.add(this.playerHelper);
        }
    }

    /**
     * Cập nhật vị trí collider helper của Player theo toạ độ nhân vật
     */
    public updatePlayerHelper() {
        if (this.playerHelper && this.playerTarget) {
            this.playerHelper.position.copy(this.playerTarget.position);
        }
    }

    /**
     * Bật / tắt hiển thị toàn bộ khung collider helper (Static BVH, Dynamic BVH & Player Capsule)
     */
    public setHelpersVisible(visible: boolean) {
        this.helpersVisible = visible;
        if (this.staticBVHHelper) {
            this.staticBVHHelper.visible = visible;
        }
        for (const entry of this.dynamicColliders) {
            if (entry.helper) {
                entry.helper.visible = visible;
            }
        }
        if (this.playerHelper) {
            this.playerHelper.visible = visible;
        }
    }

    public getHelpersVisible(): boolean {
        return this.helpersVisible;
    }

    /**
     * Tính toán vị trí di chuyển an toàn cho nhân vật dựa theo BVH Capsule Collision.
     * Kiểm tra va chạm cả với môi trường tĩnh và các vật thể động xoay tròn.
     */
    public resolveMovement(
        currentPos: THREE.Vector3,
        displacement: THREE.Vector3,
        playerRadius: number = this.playerRadius,
        playerHeight: number = this.playerHeight
    ): THREE.Vector3 {
        if (displacement.lengthSq() === 0) {
            return displacement;
        }

        const targetPos = currentPos.clone().add(displacement);

        // Khởi tạo trục đoạn thẳng (Line3) của Capsule ở vị trí đích dự kiến
        const startY = targetPos.y + playerRadius;
        const endY = targetPos.y + Math.max(playerRadius, playerHeight - playerRadius);
        this.tempSegment.start.set(targetPos.x, startY, targetPos.z);
        this.tempSegment.end.set(targetPos.x, endY, targetPos.z);

        // Lặp tối đa 3 lần giải quyết va chạm để xử lý các góc tường nhọn hoặc mép giao nhau
        for (let iter = 0; iter < 3; iter++) {
            this.tempBox.makeEmpty();
            this.tempBox.expandByPoint(this.tempSegment.start);
            this.tempBox.expandByPoint(this.tempSegment.end);
            this.tempBox.min.subScalar(playerRadius);
            this.tempBox.max.addScalar(playerRadius);

            let hasCollision = false;

            // 1. Va chạm với môi trường tĩnh (tường, cột, sàn)
            if (this.staticColliderMesh && this.staticColliderMesh.geometry.boundsTree) {
                const bvh = this.staticColliderMesh.geometry.boundsTree as MeshBVH;
                bvh.shapecast({
                    intersectsBounds: (box) => box.intersectsBox(this.tempBox),
                    intersectsTriangle: (tri) => {
                        const distance = tri.closestPointToSegment(this.tempSegment, this.triPoint, this.capsulePoint);
                        if (distance < playerRadius) {
                            const depth = playerRadius - distance;
                            this.pushDir.subVectors(this.capsulePoint, this.triPoint);
                            this.pushDir.y = 0;
                            if (this.pushDir.lengthSq() > 1e-6) {
                                this.pushDir.normalize();
                                this.tempSegment.start.addScaledVector(this.pushDir, depth);
                                this.tempSegment.end.addScaledVector(this.pushDir, depth);
                                hasCollision = true;
                            }
                        }
                    },
                });
            }

            // 2. Va chạm với các vật thể động xoay tròn (Cổ vật)
            for (const { mesh } of this.dynamicColliders) {
                if (!mesh.geometry.boundsTree) continue;

                mesh.updateWorldMatrix(true, false);
                if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
                this.tempMeshWorldBox.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);

                // Broadphase: bỏ qua nếu capsule không nằm gần bounding box của vật thể
                if (!this.tempMeshWorldBox.intersectsBox(this.tempBox)) {
                    continue;
                }

                // Chuyển capsule sang toạ độ cục bộ (local space) của vật thể
                this.invMat.copy(mesh.matrixWorld).invert();
                this.localSegment.start.copy(this.tempSegment.start).applyMatrix4(this.invMat);
                this.localSegment.end.copy(this.tempSegment.end).applyMatrix4(this.invMat);

                this.localBox.makeEmpty();
                this.localBox.expandByPoint(this.localSegment.start);
                this.localBox.expandByPoint(this.localSegment.end);
                this.localBox.min.subScalar(playerRadius);
                this.localBox.max.addScalar(playerRadius);

                const bvh = mesh.geometry.boundsTree as MeshBVH;
                bvh.shapecast({
                    intersectsBounds: (box) => box.intersectsBox(this.localBox),
                    intersectsTriangle: (tri) => {
                        const distance = tri.closestPointToSegment(this.localSegment, this.triPoint, this.capsulePoint);
                        if (distance < playerRadius) {
                            const depth = playerRadius - distance;
                            this.localPushDir.subVectors(this.capsulePoint, this.triPoint).normalize();
                            this.localSegment.start.addScaledVector(this.localPushDir, depth);
                            this.localSegment.end.addScaledVector(this.localPushDir, depth);
                            hasCollision = true;
                        }
                    },
                });

                // Chuyển kết quả trở lại toạ độ thế giới (world space)
                const newStart = this.localSegment.start.clone().applyMatrix4(mesh.matrixWorld);
                const newEnd = this.localSegment.end.clone().applyMatrix4(mesh.matrixWorld);
                this.tempSegment.start.set(newStart.x, this.tempSegment.start.y, newStart.z);
                this.tempSegment.end.set(newEnd.x, this.tempSegment.end.y, newEnd.z);
            }

            if (!hasCollision) break;
        }

        const finalDisplacement = new THREE.Vector3(
            this.tempSegment.start.x - currentPos.x,
            displacement.y,
            this.tempSegment.start.z - currentPos.z
        );

        return finalDisplacement;
    }

    /**
     * Giải quyết va chạm hình cầu (Quả bóng) với môi trường tĩnh và cổ vật động.
     * Đẩy toạ độ spherePos ra ngoài bề mặt tiếp xúc và phản xạ vận tốc theo pháp tuyến va chạm.
     */
    public resolveSphereCollision(
        spherePos: THREE.Vector3,
        velocity: THREE.Vector3,
        radius: number,
        restitution: number = 0.65,
        friction: number = 0.25
    ): boolean {
        let collided = false;

        for (let iter = 0; iter < 3; iter++) {
            this.tempSphereBox.min.set(spherePos.x - radius, spherePos.y - radius, spherePos.z - radius);
            this.tempSphereBox.max.set(spherePos.x + radius, spherePos.y + radius, spherePos.z + radius);

            let iterCollision = false;

            // 1. Va chạm với môi trường tĩnh (tường phòng trưng bày, cột, bục, sàn)
            if (this.staticColliderMesh && this.staticColliderMesh.geometry.boundsTree) {
                const bvh = this.staticColliderMesh.geometry.boundsTree as MeshBVH;
                bvh.shapecast({
                    intersectsBounds: (box) => box.intersectsBox(this.tempSphereBox),
                    intersectsTriangle: (tri) => {
                        tri.closestPointToPoint(spherePos, this.tempSpherePoint);
                        const distSq = spherePos.distanceToSquared(this.tempSpherePoint);
                        if (distSq < radius * radius) {
                            const dist = Math.sqrt(distSq);
                            const depth = radius - dist;

                            if (dist > 1e-5) {
                                this.tempSphereNormal.subVectors(spherePos, this.tempSpherePoint).normalize();
                            } else {
                                tri.getNormal(this.tempSphereNormal);
                            }

                            spherePos.addScaledVector(this.tempSphereNormal, depth);

                            // Phản xạ vận tốc theo vector pháp tuyến (Vector Reflection)
                            const vDotN = velocity.dot(this.tempSphereNormal);
                            if (vDotN < 0) {
                                const vNormX = this.tempSphereNormal.x * vDotN;
                                const vNormY = this.tempSphereNormal.y * vDotN;
                                const vNormZ = this.tempSphereNormal.z * vDotN;

                                // Ngưỡng vận tốc va đập (1.2 m/s): Dưới ngưỡng này triệt tiêu nảy để bóng nằm yên hoàn toàn
                                const effRestitution = Math.abs(vDotN) > 1.2 ? restitution : 0.0;

                                velocity.x = (velocity.x - vNormX) * (1 - friction) - vNormX * effRestitution;
                                velocity.y = (velocity.y - vNormY) * (1 - friction) - vNormY * effRestitution;
                                velocity.z = (velocity.z - vNormZ) * (1 - friction) - vNormZ * effRestitution;

                                if (effRestitution === 0.0 && this.tempSphereNormal.y > 0.7) {
                                    velocity.y = 0;
                                }
                            }

                            iterCollision = true;
                            collided = true;
                        }
                    },
                });
            }

            // 2. Va chạm với các vật thể động xoay tròn (Cổ vật trên giá/bàn)
            for (const { mesh } of this.dynamicColliders) {
                if (!mesh.geometry.boundsTree) continue;

                mesh.updateWorldMatrix(true, false);
                if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
                this.tempMeshWorldBox.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);

                if (!this.tempMeshWorldBox.intersectsBox(this.tempSphereBox)) {
                    continue;
                }

                this.invMat.copy(mesh.matrixWorld).invert();
                this.localSpherePos.copy(spherePos).applyMatrix4(this.invMat);

                const scale = mesh.scale.x || 1.0;
                const localRadius = radius / scale;

                this.localSphereBox.min.set(
                    this.localSpherePos.x - localRadius,
                    this.localSpherePos.y - localRadius,
                    this.localSpherePos.z - localRadius
                );
                this.localSphereBox.max.set(
                    this.localSpherePos.x + localRadius,
                    this.localSpherePos.y + localRadius,
                    this.localSpherePos.z + localRadius
                );

                const bvh = mesh.geometry.boundsTree as MeshBVH;
                bvh.shapecast({
                    intersectsBounds: (box) => box.intersectsBox(this.localSphereBox),
                    intersectsTriangle: (tri) => {
                        tri.closestPointToPoint(this.localSpherePos, this.localSpherePoint);
                        const distSq = this.localSpherePos.distanceToSquared(this.localSpherePoint);
                        if (distSq < localRadius * localRadius) {
                            const dist = Math.sqrt(distSq);
                            const localDepth = localRadius - dist;

                            if (dist > 1e-5) {
                                this.localPushDir.subVectors(this.localSpherePos, this.localSpherePoint).normalize();
                            } else {
                                tri.getNormal(this.localPushDir);
                            }

                            this.localPushDir.transformDirection(mesh.matrixWorld).normalize();
                            const worldDepth = localDepth * scale;
                            spherePos.addScaledVector(this.localPushDir, worldDepth);

                            const vDotN = velocity.dot(this.localPushDir);
                            if (vDotN < 0) {
                                const vNormX = this.localPushDir.x * vDotN;
                                const vNormY = this.localPushDir.y * vDotN;
                                const vNormZ = this.localPushDir.z * vDotN;

                                const effRestitution = Math.abs(vDotN) > 1.2 ? restitution : 0.0;

                                velocity.x = (velocity.x - vNormX) * (1 - friction) - vNormX * effRestitution;
                                velocity.y = (velocity.y - vNormY) * (1 - friction) - vNormY * effRestitution;
                                velocity.z = (velocity.z - vNormZ) * (1 - friction) - vNormZ * effRestitution;

                                if (effRestitution === 0.0 && this.localPushDir.y > 0.7) {
                                    velocity.y = 0;
                                }
                            }

                            iterCollision = true;
                            collided = true;
                        }
                    },
                });
            }

            if (!iterCollision) break;
        }

        return collided;
    }

    /**
     * Kiểm tra va chạm camera từ origin đến camera theo hướng direction với BVH.
     * Kiểm tra cả môi trường tĩnh và các cổ vật động xoay tròn.
     */
    public checkCameraCollision(
        origin: THREE.Vector3,
        direction: THREE.Vector3,
        maxDistance: number,
        padding: number = 0.35
    ): number | null {
        const dir = direction.clone().normalize();
        const ray = new THREE.Ray(origin, dir);
        let closestDist = maxDistance;
        let hasHit = false;

        // 1. Kiểm tra với môi trường tĩnh
        if (this.staticColliderMesh && this.staticColliderMesh.geometry.boundsTree) {
            const bvh = this.staticColliderMesh.geometry.boundsTree as MeshBVH;
            const hit = bvh.raycastFirst(ray, THREE.DoubleSide);
            if (hit && hit.point) {
                const dist = origin.distanceTo(hit.point);
                if (dist > 0.05 && dist < closestDist) {
                    closestDist = dist;
                    hasHit = true;
                }
            }
        }

        // 2. Kiểm tra với các vật thể động
        for (const { mesh } of this.dynamicColliders) {
            if (!mesh.geometry.boundsTree) continue;

            mesh.updateWorldMatrix(true, false);
            this.invMat.copy(mesh.matrixWorld).invert();
            this.localRay.copy(ray).applyMatrix4(this.invMat);

            const bvh = mesh.geometry.boundsTree as MeshBVH;
            const hit = bvh.raycastFirst(this.localRay, THREE.DoubleSide);
            if (hit && hit.point) {
                const worldPoint = hit.point.clone().applyMatrix4(mesh.matrixWorld);
                const dist = origin.distanceTo(worldPoint);
                if (dist > 0.05 && dist < closestDist) {
                    closestDist = dist;
                    hasHit = true;
                }
            }
        }

        if (hasHit) {
            return Math.max(0.1, closestDist - padding);
        }

        return null;
    }

    /**
     * Xóa toàn bộ collider mesh, BVH và helpers khỏi scene
     */
    public dispose() {
        if (this.staticBVHHelper && this.scene) {
            this.scene.remove(this.staticBVHHelper);
            this.staticBVHHelper.dispose();
            this.staticBVHHelper = undefined;
        }

        if (this.staticColliderMesh) {
            this.staticColliderMesh.geometry.boundsTree = undefined;
            this.staticColliderMesh.geometry.dispose();
            this.staticColliderMesh = null;
        }

        for (const entry of this.dynamicColliders) {
            if (entry.helper && this.scene) {
                this.scene.remove(entry.helper);
                entry.helper.dispose();
            }
            if (entry.mesh.geometry.boundsTree) {
                entry.mesh.geometry.boundsTree = undefined;
            }
        }
        this.dynamicColliders = [];

        if (this.playerHelper && this.scene) {
            this.scene.remove(this.playerHelper);
            this.playerHelper.geometry.dispose();
            if (Array.isArray(this.playerHelper.material)) {
                this.playerHelper.material.forEach((m) => m.dispose());
            } else {
                this.playerHelper.material.dispose();
            }
            this.playerHelper = undefined;
        }
    }
}
