import { StateMachine } from '../../../../utils/StateMachine/StateMachine';
import { StateNode } from '../../../../utils/StateMachine/StateNode';
import { ControlMode } from '../../components/SettingModal/SettingsModal';
import { ViewMode } from '../../model/ViewMode';
import { PerspectiveKey } from './PerspectiveKey';
import { PerspectiveContext } from './PerspectiveContext';
import { FirstPersonViewState } from './FirstPersonViewState';
import { ThirdPersonViewState } from './ThirdPersonViewState';

export class PerspectiveStateMachine {
    public context: PerspectiveContext;
    public stateMachine = new StateMachine<ViewMode>();

    public firstPersonNode = new StateNode<ViewMode>();
    public firstPersonState = new FirstPersonViewState();

    public thirdPersonNode = new StateNode<ViewMode>();
    public thirdPersonState = new ThirdPersonViewState();

    private currentMode: ViewMode = PerspectiveKey.ThirdPerson;

    public init(context: PerspectiveContext, initialMode: ViewMode = PerspectiveKey.ThirdPerson): void {
        this.context = context;

        this.firstPersonState.context = this.context;
        this.firstPersonNode.key = PerspectiveKey.FirstPerson;
        this.firstPersonNode.state = this.firstPersonState;

        this.thirdPersonState.context = this.context;
        this.thirdPersonNode.key = PerspectiveKey.ThirdPerson;
        this.thirdPersonNode.state = this.thirdPersonState;

        this.stateMachine.AddStateNode(this.firstPersonNode);
        this.stateMachine.AddStateNode(this.thirdPersonNode);

        this.setViewMode(initialMode);
    }

    public setViewMode(mode: ViewMode): void {
        this.currentMode = mode;
        this.stateMachine.ChangeToState(mode);
    }

    public getCurrentViewMode(): ViewMode {
        return this.currentMode;
    }

    public update(deltaTime: number): void {
        this.stateMachine.Update(deltaTime);
    }

    public setControlMode(mode: ControlMode): void {
        if (this.context) {
            this.context.currentControlMode = mode;
        }
    }

    public onPlayerLoaded(): void {
        if (this.currentMode === PerspectiveKey.FirstPerson) {
            this.firstPersonState.syncPlayerVisibility();
        } else {
            this.thirdPersonState.syncPlayerVisibility();
            this.thirdPersonState.resetFollowInitialization();
        }
    }

    public requestPointerLock(): void {
        if (this.currentMode === PerspectiveKey.FirstPerson) {
            this.firstPersonState.requestPointerLock();
        }
    }

    public unlockPointer(): void {
        if (this.currentMode === PerspectiveKey.FirstPerson) {
            this.firstPersonState.unlockPointer();
        }
    }

    public dispose(): void {
        this.firstPersonState.dispose();
        this.thirdPersonState.dispose();
    }
}
