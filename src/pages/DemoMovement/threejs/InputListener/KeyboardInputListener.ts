import { Input, KeyCode } from '../../../../utils/Unity/Input';
import { MovementVector } from './InputListener';

export class KeyboardInputListener {
    public input: Input;

    constructor(input?: Input) {
        if (input) {
            this.input = input;
        } else {
            this.input = new Input();
            this.input.init();
        }
    }

    public getMovement(): MovementVector {
        let forward = 0;
        let strafe = 0;

        if (this.input.getKey(KeyCode.W) || this.input.getKey(KeyCode.ArrowUp)) forward += 1;
        if (this.input.getKey(KeyCode.S) || this.input.getKey(KeyCode.ArrowDown)) forward -= 1;
        if (this.input.getKey(KeyCode.A) || this.input.getKey(KeyCode.ArrowLeft)) strafe -= 1;
        if (this.input.getKey(KeyCode.D) || this.input.getKey(KeyCode.ArrowRight)) strafe += 1;

        return { forward, strafe };
    }

    public isMoving(): boolean {
        const { forward, strafe } = this.getMovement();
        return forward !== 0 || strafe !== 0;
    }

    public reset(): void {
        this.input.reset();
    }

    public update(_deltaTime?: number): void {
        // No-op for keyboard
    }

    public destroy(): void {
        this.input.destroy();
    }
}
