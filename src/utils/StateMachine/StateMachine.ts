import { DictionaryUtils } from "../three/Utils/DictionaryUtils";
import { StateNode } from "./StateNode";

/**
 * Implement IState bằng cách wrap các Action gán rời qua các
 * method Set..., thay vì truyền hết vào constructor. Tương tự LambdaCondition
 * cho ITransitionCondition — cho phép tạo state nhanh bằng lambda mà không cần
 * viết class riêng cho từng state đơn giản.
 */
export class StateMachine<T> {
    private _currentState: T;

    private _states: Map<T, StateNode<T>> = new Map<T, StateNode<T>>();

    public AddStateNode(state: StateNode<T>): boolean {
        return DictionaryUtils.TryAddIfNotContains(this._states, state.key, state);
    }

    public ChangeToState(newStateKey: T): boolean {
        if (this._states.has(newStateKey)) {
            const currentNode = this._states.get(this._currentState);
            if (currentNode) {
                currentNode.state.OnExit();
            }
            const newNode = this._states.get(newStateKey);
            if (newNode) {
                newNode.state.OnEnter();
            }
            this._currentState = newStateKey;
            return true;
        }
        return false;
    }

    public Update(deltaTime: number): void {
        const currentNode = this._states.get(this._currentState);
        if (!currentNode) {
            return;
        }

        for (const transition of currentNode.transitions) {
            if (transition.condition()) {
                this.ChangeToState(transition.toState.key);
                return;
            }
        }

        currentNode.state.Update(deltaTime);

    }
}