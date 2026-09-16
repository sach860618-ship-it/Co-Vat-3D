import { IState } from "./IState";
import { StateNode } from "./StateNode";

export class Transition<T> {
    public toState: StateNode<T>;
    public condition: () => boolean;
}