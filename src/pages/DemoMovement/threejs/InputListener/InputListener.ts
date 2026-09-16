import { JoystickInputListener } from "./JoystickInputListener";
import { KeyboardInputListener } from "./KeyboardInputListener";

export interface MovementVector {
    forward: number;
    strafe: number;
}

export class InputListener {
    private joystickInputListener: JoystickInputListener;
    private keyboardInputListener: KeyboardInputListener;

    public setJoystickInputListener(input: JoystickInputListener): void {
        this.joystickInputListener = input;
    }
    public setKeyboardInputListener(input: KeyboardInputListener): void {
        this.keyboardInputListener = input;
    }

    public getMovement(): MovementVector {
        if (this.joystickInputListener != null) {
            return this.joystickInputListener.getMovement();
        }
        if (this.keyboardInputListener != null) {
            return this.keyboardInputListener.getMovement();
        }
        return { forward: 0, strafe: 0 };
    }

    public isMoving(): boolean {
        if (this.joystickInputListener != null) {
            return this.joystickInputListener.isMoving();
        }
        if (this.keyboardInputListener != null) {
            return this.keyboardInputListener.isMoving();
        }
        return false;
    }

    public update(deltaTime: number): void {
        if (this.joystickInputListener != null) {
            //this.joystickInputListener.update(deltaTime);
        }
        if (this.keyboardInputListener != null) {
            this.keyboardInputListener.update(deltaTime);
        }
    }

    public reset(): void {
        if (this.joystickInputListener != null) {
            this.joystickInputListener.reset();
        }
        if (this.keyboardInputListener != null) {
            this.keyboardInputListener.reset();
        }
    }

    public destroy(): void {
        if (this.joystickInputListener != null) {
            this.joystickInputListener.destroy();
        }
        if (this.keyboardInputListener != null) {
            this.keyboardInputListener.destroy();
        }
    }
    public clear(): void {
        this.reset();
        this.joystickInputListener = null;
        this.keyboardInputListener = null;
    }
}