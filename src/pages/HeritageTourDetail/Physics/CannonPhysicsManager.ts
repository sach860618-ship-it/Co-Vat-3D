import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { ColliderManager } from '../Collision/ColliderManager';

export interface PhysicsBallItem {
    id: string;
    mesh: THREE.Mesh;
    body: CANNON.Body;
    radius: number;
}

export interface CannonPhysicsManagerOptions {
    scene: THREE.Scene;
    floorY?: number;
    playerRadius?: number;
    maxBalls?: number;
    colliderManager?: ColliderManager;
}

/**
 * Quản lý mô phỏng vật lý thời gian thực bằng cannon-es:
 * - Trọng lực, va chạm sàn, va chạm giữa các quả bóng.
 * - Kinematic body cho Player để nhân vật đẩy bóng tự nhiên khi di chuyển.
 * - Tích hợp giải quyết va chạm với ColliderManager (tường, cột, bục, cổ vật).
 * - Triệt tiêu rung giật (micro-jitter) khi tiếp xúc và lăn bóng.
 */
export class CannonPhysicsManager {
    private scene: THREE.Scene;
    private world: CANNON.World;
    private balls: PhysicsBallItem[] = [];
    private maxBalls: number;
    private floorY: number;
    private colliderManager?: ColliderManager;

    // Kinematic body cho nhân vật
    private playerBody: CANNON.Body;
    private playerRadius: number;
    private prevPlayerPos = new THREE.Vector3();
    private isPlayerInitialized = false;

    // Biến tạm tính toán tránh GC
    private tempPos = new THREE.Vector3();
    private tempVel = new THREE.Vector3();

    // Vật liệu vật lý
    private ballMaterial: CANNON.Material;
    private groundMaterial: CANNON.Material;
    private playerMaterial: CANNON.Material;

    // Texture chia sẻ cho các quả bóng
    private ballTexture: THREE.CanvasTexture;

    constructor(options: CannonPhysicsManagerOptions) {
        this.scene = options.scene;
        this.floorY = options.floorY ?? 0;
        this.playerRadius = options.playerRadius ?? 0.8;
        this.maxBalls = options.maxBalls ?? 20;
        this.colliderManager = options.colliderManager;

        // 1. Khởi tạo Cannon World với thông số ổn định cao
        this.world = new CANNON.World();
        this.world.gravity.set(0, -14.0, 0); // Trọng lực đầm chắc
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);

        const solver = this.world.solver as CANNON.GSSolver;
        solver.iterations = 10;
        solver.tolerance = 0.001;

        // Cân bằng độ cứng liên kết tiếp xúc giảm chấn rung
        this.world.defaultContactMaterial.contactEquationStiffness = 1e7;
        this.world.defaultContactMaterial.contactEquationRelaxation = 3;

        // 2. Thiết lập vật liệu và ma sát/độ nảy
        this.ballMaterial = new CANNON.Material('ball');
        this.groundMaterial = new CANNON.Material('ground');
        this.playerMaterial = new CANNON.Material('player');

        // Va chạm giữa bóng và sàn
        const ballGroundContact = new CANNON.ContactMaterial(
            this.ballMaterial,
            this.groundMaterial,
            {
                friction: 0.4,
                restitution: 0.6,
            }
        );
        this.world.addContactMaterial(ballGroundContact);

        // Va chạm giữa các quả bóng
        const ballBallContact = new CANNON.ContactMaterial(
            this.ballMaterial,
            this.ballMaterial,
            {
                friction: 0.3,
                restitution: 0.7,
            }
        );
        this.world.addContactMaterial(ballBallContact);

        // Va chạm giữa nhân vật và bóng
        const playerBallContact = new CANNON.ContactMaterial(
            this.playerMaterial,
            this.ballMaterial,
            {
                friction: 0.2,
                restitution: 0.4,
            }
        );
        this.world.addContactMaterial(playerBallContact);

        // 3. Tạo mặt sàn tĩnh tại floorY
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0, // static
            material: this.groundMaterial,
        });
        groundBody.addShape(groundShape);
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        groundBody.position.set(0, this.floorY, 0);
        this.world.addBody(groundBody);

        // 4. Tạo Kinematic Body cho nhân vật
        const playerShape = new CANNON.Sphere(this.playerRadius);
        this.playerBody = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.KINEMATIC,
            material: this.playerMaterial,
        });
        this.playerBody.addShape(playerShape);
        this.playerBody.position.set(0, this.floorY + this.playerRadius, 0);
        this.world.addBody(this.playerBody);

        // 5. Khởi tạo Texture thể thao sinh động
        this.ballTexture = this.createSportBallTexture();
    }

    public setColliderManager(colliderManager: ColliderManager) {
        this.colliderManager = colliderManager;
    }

    /**
     * Tạo texture quả bóng thể thao sọc màu tương phản cao để thấy rõ hiệu ứng lăn
     */
    private createSportBallTexture(): THREE.CanvasTexture {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;

        // Nền màu vàng cam rực rỡ
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(0, 0, 512, 512);

        // Các mảng màu trắng và xanh ngọc phong cách thể thao
        ctx.fillStyle = '#f7f9fc';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(64 + i * 128, 256, 45, 0, Math.PI * 2);
            ctx.fill();
        }

        // Đường chỉ viền đen đặc trưng của bóng thể thao
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 10;

        // Vòng cung ngang
        ctx.beginPath();
        ctx.moveTo(0, 256);
        ctx.lineTo(512, 256);
        ctx.stroke();

        // Các đường cong múi bóng
        ctx.beginPath();
        ctx.ellipse(256, 256, 180, 250, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(256, 256, 70, 250, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Ngôi sao vàng ở trung tâm
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(256, 128, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(256, 384, 20, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    /**
     * Sinh một quả bóng vật lý mới trong không gian
     */
    public spawnBall(
        position?: THREE.Vector3,
        initialVelocity?: THREE.Vector3,
        radius: number = 0.55
    ): PhysicsBallItem {
        // Giới hạn số lượng bóng tối đa để giữ hiệu năng 60 FPS
        if (this.balls.length >= this.maxBalls) {
            const oldest = this.balls.shift();
            if (oldest) {
                this.removeBallInternal(oldest);
            }
        }

        const ballId = `ball_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const spawnPos = position
            ? position.clone()
            : new THREE.Vector3(0, this.floorY + 2.5, -2);

        // 1. Tạo Three.js Mesh
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            map: this.ballTexture,
            roughness: 0.35,
            metalness: 0.15,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(spawnPos);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { isPhysicsBall: true, ballId };

        this.scene.add(mesh);

        // 2. Tạo Cannon.js Body với Damping chống rung lắc
        const shape = new CANNON.Sphere(radius);
        const body = new CANNON.Body({
            mass: 1.2, // Khối lượng 1.2kg
            shape: shape,
            material: this.ballMaterial,
            position: new CANNON.Vec3(spawnPos.x, spawnPos.y, spawnPos.z),
            linearDamping: 0.15,
            angularDamping: 0.25,
            allowSleep: true,
            sleepSpeedLimit: 0.15,
            sleepTimeLimit: 0.25,
        });

        // Vận tốc ban đầu hoặc xoay nhẹ
        if (initialVelocity) {
            body.velocity.set(initialVelocity.x, initialVelocity.y, initialVelocity.z);
        } else {
            body.angularVelocity.set(
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            );
        }

        this.world.addBody(body);

        const item: PhysicsBallItem = {
            id: ballId,
            mesh,
            body,
            radius,
        };

        this.balls.push(item);
        return item;
    }

    /**
     * Sinh bóng xuất hiện phía trước mặt nhân vật
     */
    public spawnBallInFrontOfPlayer(player: THREE.Object3D, forwardDistance: number = 2.0): PhysicsBallItem {
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(player.quaternion).normalize();
        const spawnPos = player.position.clone().addScaledVector(forward, forwardDistance);
        spawnPos.y = Math.max(spawnPos.y + 1.2, this.floorY + 1.2);

        // Tung bóng nhẹ về phía trước
        const throwVelocity = forward.clone().multiplyScalar(3.0);
        throwVelocity.y = 1.8;

        return this.spawnBall(spawnPos, throwVelocity);
    }

    /**
     * Cập nhật toạ độ Kinematic Body của Player và tính vận tốc đẩy bóng mượt mà không rung giật
     */
    public updatePlayer(position: THREE.Vector3, deltaTime: number) {
        const currentPos = position.clone();
        currentPos.y += this.playerRadius; // Tâm sphere collider nhân vật

        if (!this.isPlayerInitialized) {
            this.prevPlayerPos.copy(currentPos);
            this.playerBody.position.set(currentPos.x, currentPos.y, currentPos.z);
            this.playerBody.velocity.set(0, 0, 0);
            this.isPlayerInitialized = true;
            return;
        }

        const dt = Math.max(0.001, deltaTime);
        const vx = (currentPos.x - this.prevPlayerPos.x) / dt;
        const vy = (currentPos.y - this.prevPlayerPos.y) / dt;
        const vz = (currentPos.z - this.prevPlayerPos.z) / dt;

        this.playerBody.velocity.set(vx, vy, vz);
        this.playerBody.position.set(currentPos.x, currentPos.y, currentPos.z);
        this.prevPlayerPos.copy(currentPos);

        // Chỉ tác động xung lực khi nhân vật đang di chuyển thực sự về phía quả bóng
        const playerSpeed = Math.hypot(vx, vz);
        if (playerSpeed > 0.15) {
            const moveDir = new THREE.Vector2(vx, vz).normalize();

            for (const ball of this.balls) {
                const dx = ball.body.position.x - currentPos.x;
                const dz = ball.body.position.z - currentPos.z;
                const dist = Math.hypot(dx, dz);
                const pushThreshold = this.playerRadius + ball.radius + 0.12;

                if (dist < pushThreshold && dist > 0.001) {
                    const toBall = new THREE.Vector2(dx, dz).normalize();
                    const dot = moveDir.dot(toBall);
                    // Chỉ đẩy khi hướng đi của nhân vật hướng tới quả bóng
                    if (dot > 0.05) {
                        ball.body.wakeUp();
                        const pushSpeed = Math.max(playerSpeed * 1.5, 3.2);
                        ball.body.velocity.x = toBall.x * pushSpeed;
                        ball.body.velocity.z = toBall.y * pushSpeed;

                        // Đồng bộ xoay bóng theo hướng lăn (lăn thực tế không nảy lơ lửng)
                        ball.body.angularVelocity.x = -toBall.y * (pushSpeed / ball.radius);
                        ball.body.angularVelocity.z = toBall.x * (pushSpeed / ball.radius);
                    }
                }
            }
        }
    }

    /**
     * Sút quả bóng gần nhất phía trước mặt nhân vật
     */
    public kickNearestBall(
        playerPosition: THREE.Vector3,
        forwardDirection: THREE.Vector3,
        maxDistance: number = 3.5,
        kickForce: number = 16.0
    ): boolean {
        let nearestBall: PhysicsBallItem | null = null;
        let nearestDist = maxDistance;

        const forward = forwardDirection.clone().setY(0).normalize();

        for (const ball of this.balls) {
            const ballPos = new THREE.Vector3(
                ball.body.position.x,
                ball.body.position.y,
                ball.body.position.z
            );
            const toBall = ballPos.clone().sub(playerPosition);
            const dist = toBall.length();

            if (dist < nearestDist) {
                const dot = toBall.normalize().dot(forward);
                if (dot > 0.2) {
                    nearestDist = dist;
                    nearestBall = ball;
                }
            }
        }

        if (nearestBall) {
            this.kickBall(nearestBall.body, forward, kickForce);
            return true;
        }

        return false;
    }

    /**
     * Tác động xung lực sút quả bóng theo hướng chỉ định
     */
    public kickBall(body: CANNON.Body, direction: THREE.Vector3, force: number = 16.0) {
        const kickDir = direction.clone().normalize();
        kickDir.y = Math.max(kickDir.y, 0.35);
        kickDir.normalize();

        body.wakeUp();
        body.applyImpulse(
            new CANNON.Vec3(kickDir.x * force, kickDir.y * force, kickDir.z * force),
            new CANNON.Vec3(0, 0, 0)
        );

        // Tạo xoáy bóng ngẫu nhiên khi sút mạnh
        body.angularVelocity.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 10
        );
    }

    /**
     * Tìm thông tin quả bóng từ Mesh Three.js (dùng cho Raycasting)
     */
    public getBallByMesh(mesh: THREE.Object3D): PhysicsBallItem | undefined {
        let curr: THREE.Object3D | null = mesh;
        while (curr) {
            if (curr.userData && curr.userData.ballId) {
                return this.balls.find((b) => b.id === curr!.userData.ballId);
            }
            curr = curr.parent;
        }
        return undefined;
    }

    /**
     * Danh sách tất cả Mesh của các quả bóng trong scene (phục vụ Raycast)
     */
    public getBallMeshes(): THREE.Mesh[] {
        return this.balls.map((b) => b.mesh);
    }

    /**
     * Số lượng quả bóng đang có trên sân
     */
    public getBallCount(): number {
        return this.balls.length;
    }

    /**
     * Xoá tất cả các quả bóng hiện tại
     */
    public clearBalls() {
        for (const ball of this.balls) {
            this.removeBallInternal(ball);
        }
        this.balls = [];
    }

    private removeBallInternal(item: PhysicsBallItem) {
        this.world.removeBody(item.body);
        this.scene.remove(item.mesh);
        item.mesh.geometry.dispose();
        if (Array.isArray(item.mesh.material)) {
            item.mesh.material.forEach((m) => m.dispose());
        } else {
            item.mesh.material.dispose();
        }
    }

    /**
     * Cập nhật bước tính vật lý, giải quyết va chạm với Collider và triệt tiêu rung giật
     */
    public update(deltaTime: number) {
        const dt = Math.min(deltaTime, 0.05);
        // Bước tính vật lý cố định 1/60s với tối đa 5 sub-steps tránh lag giật
        this.world.step(1 / 60, dt, 5);

        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];

            // Tự động xoá bóng nếu rơi ra ngoài không gian (Y < -10)
            if (ball.body.position.y < this.floorY - 10) {
                this.removeBallInternal(ball);
                this.balls.splice(i, 1);
                continue;
            }

            // Giải quyết va chạm với ColliderManager (tường, cột, bục trưng bày, cổ vật)
            if (this.colliderManager) {
                this.tempPos.set(ball.body.position.x, ball.body.position.y, ball.body.position.z);
                this.tempVel.set(ball.body.velocity.x, ball.body.velocity.y, ball.body.velocity.z);

                const collided = this.colliderManager.resolveSphereCollision(
                    this.tempPos,
                    this.tempVel,
                    ball.radius,
                    0.65, // restitution (độ nảy bật tường)
                    0.25  // friction
                );

                if (collided) {
                    ball.body.position.set(this.tempPos.x, this.tempPos.y, this.tempPos.z);
                    ball.body.velocity.set(this.tempVel.x, this.tempVel.y, this.tempVel.z);

                    // Thêm xoáy khi va vào tường hoặc bục
                    ball.body.angularVelocity.set(
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3
                    );
                }
            }

            // Chống lún qua sàn Y = floorY
            const minY = this.floorY + ball.radius;
            if (ball.body.position.y < minY) {
                ball.body.position.y = minY;
                if (ball.body.velocity.y < 0) {
                    ball.body.velocity.y = 0; // Triệt tiêu rơi xuống, KHÔNG đảo chiều dương gây rung lắc!
                }
            }

            // Dập tắt hoàn toàn rung giật khi bóng đã nằm yên trên mặt đất
            const speedSq = ball.body.velocity.lengthSquared();
            if (speedSq < 0.04 && Math.abs(ball.body.position.y - minY) < 0.03) {
                ball.body.velocity.set(0, 0, 0);
                ball.body.angularVelocity.set(0, 0, 0);
                if (ball.body.sleepState !== CANNON.Body.SLEEPING) {
                    ball.body.sleep();
                }
            }

            // Đồng bộ Mesh theo Cannon Body
            ball.mesh.position.set(
                ball.body.position.x,
                ball.body.position.y,
                ball.body.position.z
            );
            ball.mesh.quaternion.set(
                ball.body.quaternion.x,
                ball.body.quaternion.y,
                ball.body.quaternion.z,
                ball.body.quaternion.w
            );
        }
    }

    /**
     * Dọn dẹp tài nguyên khi unmount component
     */
    public dispose() {
        this.clearBalls();
        this.world.removeBody(this.playerBody);
        this.ballTexture.dispose();
    }
}
