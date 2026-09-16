import { IState } from "./IState";

/**
 * Implement IState bằng cách wrap các Action gán rời qua các
 * method Set..., thay vì truyền hết vào constructor. Tương tự LambdaCondition
 * cho ITransitionCondition — cho phép tạo state nhanh bằng lambda mà không cần
 * viết class riêng cho từng state đơn giản.
 */
export class ActionState implements IState {
    private _onEnterAction?: () => void;
    private _onUpdateAction?: (number) => void;
    private _onFixedUpdateAction?: () => void;
    private _onExitAction?: () => void;

    /**
     * Gán (hoặc ghi đè) Action chạy khi vào state.
     * @param onEnter Action mới. Truyền undefined để bỏ hành vi hiện tại (không làm gì khi OnEnter).
     * @returns Chính instance này, để chain tiếp các Set... khác.
     */
    SetOnEnter(onEnter?: () => void): void {
        this._onEnterAction = onEnter;
    }

    /**
     * Gán (hoặc ghi đè) Action chạy mỗi frame khi state đang active.
     * @param onUpdate Action mới. Truyền undefined để bỏ hành vi hiện tại (không làm gì khi Update).
     * @returns Chính instance này, để chain tiếp các Set... khác.
     */
    SetOnUpdate(onUpdate?: () => void): void {
        this._onUpdateAction = onUpdate;
    }

    /**
     * Gán (hoặc ghi đè) Action chạy mỗi physics tick khi state đang active.
     * @param onFixedUpdate Action mới. Truyền undefined để bỏ hành vi hiện tại (không làm gì khi FixedUpdate).
     * @returns Chính instance này, để chain tiếp các Set... khác.
     */
    SetOnFixedUpdate(onFixedUpdate?: () => void): void {
        this._onFixedUpdateAction = onFixedUpdate;
    }

    /**
     * Gán (hoặc ghi đè) Action chạy khi rời state.
     * @param onExit Action mới. Truyền undefined để bỏ hành vi hiện tại (không làm gì khi OnExit).
     * @returns Chính instance này, để chain tiếp các Set... khác.
     */
    SetOnExit(onExit?: () => void): void {
        this._onExitAction = onExit;
    }

    /**
     * <inheritdoc/>
     */
    OnEnter(): void {
        this._onEnterAction?.();
    }

    /**
     * <inheritdoc/>
     */
    Update(deltaTime: number): void {
        this._onUpdateAction?.(deltaTime);
    }

    /**
     * <inheritdoc/>
     */
    FixedUpdate(): void {
        this._onFixedUpdateAction?.();
    }

    /**
     * <inheritdoc/>
     */
    OnExit(): void {
        this._onExitAction?.();
    }
}