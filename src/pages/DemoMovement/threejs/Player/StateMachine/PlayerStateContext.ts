import * as THREE from 'three';
import { Input } from "../../../../../utils/Unity/Input";
import { PlayerController } from "../PlayerController";
import { InputListener } from '../../InputListener/InputListener';

export class PlayerStateContext {
    public playerController: PlayerController;
    public input: Input;
    public inputListener = new InputListener();
    public camera?: THREE.Camera;
    public isFirstPerson: boolean = false;
}