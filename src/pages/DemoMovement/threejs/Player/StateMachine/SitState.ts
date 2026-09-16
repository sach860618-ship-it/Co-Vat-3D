import { IState } from "../../../../../utils/StateMachine/IState";
import { PlayerStateContext } from "./PlayerStateContext";

export class SitState implements IState {
    public context: PlayerStateContext;

    OnEnter(): void {
        this.context.playerController.clearVelocity();
        this.context.playerController.playerAnimationController.changeToSit();
    }

    Update(deltaTime: number): void {

    }

    FixedUpdate(): void {

    }

    OnExit(): void {

    }
}
