import { IState } from "./IState";
import { Transition } from "./Transition";

export class StateNode<T> {
    public key: T;
    public state: IState;
    public readonly transitions: Transition<T>[] = [];
}