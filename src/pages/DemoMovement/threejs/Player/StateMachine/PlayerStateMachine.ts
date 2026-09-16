import { StateMachine } from "../../../../../utils/StateMachine/StateMachine";
import { StateNode } from "../../../../../utils/StateMachine/StateNode";
import { Transition } from "../../../../../utils/StateMachine/Transition";
import { KeyCode } from "../../../../../utils/Unity/Input";
import { IdleState } from "./IdleState";
import { PlayerStateContext } from "./PlayerStateContext";
import { SitState } from "./SitState";
import { WalkState } from "./WalkState";

export class PlayerStateKey {
    public static Idle = "Idle";
    public static Walk = "Walk";
    public static Sit = "Sit";
}

export class PlayerStateMachine {
    public context = new PlayerStateContext();
    public stateMachine = new StateMachine<string>();

    public idleNode = new StateNode<string>();
    public idleState = new IdleState();

    public walkNode = new StateNode<string>();
    public walkState = new WalkState();

    public sitNode = new StateNode<string>();
    public sitState = new SitState();

    public onStart(): void {
        this.idleState.context = this.context;
        this.idleNode.key = PlayerStateKey.Idle;
        this.idleNode.state = this.idleState;

        this.walkState.context = this.context;
        this.walkNode.key = PlayerStateKey.Walk;
        this.walkNode.state = this.walkState;

        this.sitState.context = this.context;
        this.sitNode.key = PlayerStateKey.Sit;
        this.sitNode.state = this.sitState;

        // Transition: Idle -> Walk
        const idleToWalkTransition = new Transition<string>();
        idleToWalkTransition.toState = this.walkNode;
        idleToWalkTransition.condition = () => this.isMoving();
        this.idleNode.transitions.push(idleToWalkTransition);

        // Transition: Idle -> Sit
        const idleToSitTransition = new Transition<string>();
        idleToSitTransition.toState = this.sitNode;
        idleToSitTransition.condition = () => this.isSitTriggered();
        this.idleNode.transitions.push(idleToSitTransition);

        // Transition: Walk -> Idle
        const walkToIdleTransition = new Transition<string>();
        walkToIdleTransition.toState = this.idleNode;
        walkToIdleTransition.condition = () => !this.isMoving();
        this.walkNode.transitions.push(walkToIdleTransition);

        // Transition: Walk -> Sit
        const walkToSitTransition = new Transition<string>();
        walkToSitTransition.toState = this.sitNode;
        walkToSitTransition.condition = () => this.isSitTriggered();
        this.walkNode.transitions.push(walkToSitTransition);

        // Transition: Sit -> Walk
        const sitToWalkTransition = new Transition<string>();
        sitToWalkTransition.toState = this.walkNode;
        sitToWalkTransition.condition = () => this.isMoving();
        this.sitNode.transitions.push(sitToWalkTransition);

        // Transition: Sit -> Idle
        const sitToIdleTransition = new Transition<string>();
        sitToIdleTransition.toState = this.idleNode;
        sitToIdleTransition.condition = () => this.isSitTriggered();
        this.sitNode.transitions.push(sitToIdleTransition);

        this.stateMachine.AddStateNode(this.idleNode);
        this.stateMachine.AddStateNode(this.walkNode);
        this.stateMachine.AddStateNode(this.sitNode);
    }

    public changeToIdle(): void {
        this.stateMachine.ChangeToState(PlayerStateKey.Idle);
    }

    public isMoving(): boolean {
        if (this.context.inputListener) {
            return this.context.inputListener.isMoving();
        }
        if (!this.context.input) return false;
        return (
            this.context.input.getKey(KeyCode.W) ||
            this.context.input.getKey(KeyCode.A) ||
            this.context.input.getKey(KeyCode.S) ||
            this.context.input.getKey(KeyCode.D) ||
            this.context.input.getKey(KeyCode.ArrowUp) ||
            this.context.input.getKey(KeyCode.ArrowDown) ||
            this.context.input.getKey(KeyCode.ArrowLeft) ||
            this.context.input.getKey(KeyCode.ArrowRight)
        );
    }

    public isSitTriggered(): boolean {
        if (!this.context.input) return false;
        return this.context.input.getKeyDown(KeyCode.Z);
    }
}