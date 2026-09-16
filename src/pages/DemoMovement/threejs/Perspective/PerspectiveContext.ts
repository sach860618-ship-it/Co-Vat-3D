import * as THREE from 'three';
import { PlayerController } from '../Player/PlayerController';
import { ControlMode } from '../../components/SettingModal/SettingsModal';

export class PerspectiveContext {
    public camera: THREE.PerspectiveCamera;
    public domElement: HTMLElement;
    public playerController?: PlayerController;
    public onLockChange?: (isLocked: boolean) => void;

    public firstPersonEyeOffset = new THREE.Vector3(0, 1.55, 0);
    public cameraTargetOffset = new THREE.Vector3(0, 1.2, 0);
    public cameraFollowSpeed = 6;
    public currentControlMode: ControlMode = 'keyboard';
}
