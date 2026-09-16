import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { IState } from '../../../../utils/StateMachine/IState';
import { PerspectiveContext } from './PerspectiveContext';

export class FirstPersonViewState implements IState {
    public context: PerspectiveContext;
    public pointerLockControls?: PointerLockControls;

    private isTouching = false;
    private touchPrevious = { x: 0, y: 0 };
    private touchEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    private handleCanvasClick = (): void => {
        if (this.pointerLockControls && !this.pointerLockControls.isLocked) {
            this.pointerLockControls.lock();
        }
    };

    private handleLock = (): void => {
        this.context.onLockChange?.(true);
    };

    private handleUnlock = (): void => {
        this.context.onLockChange?.(false);
    };

    private handleTouchStart = (e: TouchEvent): void => {
        const touch = e.touches[0];
        if (!touch) return;
        if (
            this.context.currentControlMode === 'joystick' &&
            touch.clientX < window.innerWidth * 0.4 &&
            touch.clientY > window.innerHeight * 0.5
        ) {
            return;
        }
        this.isTouching = true;
        this.touchPrevious.x = touch.clientX;
        this.touchPrevious.y = touch.clientY;
    };

    private handleTouchMove = (e: TouchEvent): void => {
        if (!this.isTouching) return;
        const touch = e.touches[0];
        if (!touch) return;

        const deltaX = touch.clientX - this.touchPrevious.x;
        const deltaY = touch.clientY - this.touchPrevious.y;
        this.touchPrevious.x = touch.clientX;
        this.touchPrevious.y = touch.clientY;

        const camera = this.context.camera;
        if (camera) {
            this.touchEuler.setFromQuaternion(camera.quaternion);
            this.touchEuler.y -= deltaX * 0.003;
            this.touchEuler.x -= deltaY * 0.003;
            this.touchEuler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.touchEuler.x));
            camera.quaternion.setFromEuler(this.touchEuler);
        }
    };

    private handleTouchEnd = (): void => {
        this.isTouching = false;
    };

    public OnEnter(): void {
        this.syncPlayerVisibility();

        if (this.context.playerController?.playerStateMachine?.context) {
            this.context.playerController.playerStateMachine.context.isFirstPerson = true;
        }

        const playerObj = this.context.playerController?.cannonBodyAttachBox?.object3D;
        if (playerObj && this.context.camera) {
            this.context.camera.position.set(
                playerObj.position.x,
                playerObj.position.y + this.context.firstPersonEyeOffset.y,
                playerObj.position.z
            );
        }

        if (!this.pointerLockControls && this.context.camera && this.context.domElement) {
            this.pointerLockControls = new PointerLockControls(this.context.camera, this.context.domElement);
            this.pointerLockControls.addEventListener('lock', this.handleLock);
            this.pointerLockControls.addEventListener('unlock', this.handleUnlock);
        }

        if (this.context.domElement) {
            this.context.domElement.addEventListener('click', this.handleCanvasClick);
            this.context.domElement.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        }
        window.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        window.addEventListener('touchend', this.handleTouchEnd);
    }

    public Update(_deltaTime: number): void {
        const playerObj = this.context.playerController?.cannonBodyAttachBox?.object3D;
        if (playerObj && this.context.camera) {
            this.context.camera.position.set(
                playerObj.position.x,
                playerObj.position.y + this.context.firstPersonEyeOffset.y,
                playerObj.position.z
            );
        }
    }

    public FixedUpdate(): void {
        // Không dùng cho góc nhìn
    }

    public OnExit(): void {
        if (this.pointerLockControls?.isLocked) {
            this.pointerLockControls.unlock();
        }

        if (this.context.domElement) {
            this.context.domElement.removeEventListener('click', this.handleCanvasClick);
            this.context.domElement.removeEventListener('touchstart', this.handleTouchStart);
        }
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
        this.isTouching = false;
    }

    public syncPlayerVisibility(): void {
        const playerObj = this.context.playerController?.cannonBodyAttachBox?.object3D;
        if (playerObj) {
            playerObj.visible = false;
        }
    }

    public requestPointerLock(): void {
        if (this.pointerLockControls && !this.pointerLockControls.isLocked) {
            this.pointerLockControls.lock();
        }
    }

    public unlockPointer(): void {
        if (this.pointerLockControls?.isLocked) {
            this.pointerLockControls.unlock();
        }
    }

    public dispose(): void {
        this.OnExit();

        if (this.pointerLockControls) {
            this.pointerLockControls.removeEventListener('lock', this.handleLock);
            this.pointerLockControls.removeEventListener('unlock', this.handleUnlock);
            this.pointerLockControls.dispose();
            this.pointerLockControls = undefined;
        }
    }
}
