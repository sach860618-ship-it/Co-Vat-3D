/**
     * Định nghĩa vòng đời (lifecycle) của một trạng thái trong State Machine.
     * Mỗi state cụ thể cần implement interface này để được quản lý bởi StateMachine.
     */
export interface IState {
    /**
     * Được gọi một lần khi State Machine chuyển vào trạng thái này.
     * Dùng để khởi tạo giá trị, bật animation, đăng ký event, v.v.
     */
    OnEnter(): void;

    /**
     * Được gọi mỗi frame bởi StateMachine.Update.
     * Dùng để xử lý logic thông thường như input, AI, timer.
     */
    Update(deltaTime: number): void;

    /**
     * Được gọi mỗi physics tick bởi StateMachine.FixedUpdate.
     * Dùng để xử lý logic liên quan đến physics như di chuyển Rigidbody, raycast.
     */
    FixedUpdate(): void;

    /**
     * Được gọi một lần khi State Machine rời khỏi trạng thái này.
     * Dùng để dọn dẹp, tắt animation, hủy đăng ký event, v.v.
     */
    OnExit(): void;
}
