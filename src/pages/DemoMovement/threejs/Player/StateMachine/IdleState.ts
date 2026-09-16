// src/pages/DemoMovement/threejs/Player/StateMachine/IdleState.ts
import { IState } from "../../../../../utils/StateMachine/IState";
import { PlayerStateContext } from "./PlayerStateContext";

export class IdleState implements IState {
    public context: PlayerStateContext;

    OnEnter(): void {
        this.context.playerController.clearVelocity();
        this.context.playerController.playerAnimationController.changeToIdle();
    }

    Update(deltaTime: number): void {
    }

    FixedUpdate(): void {

    }

    OnExit(): void {

    }
}