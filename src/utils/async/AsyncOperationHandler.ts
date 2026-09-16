export interface OperationResult<T> {
    success: boolean;
    data?: T;
    error?: unknown;
}

export class AsyncOperationHandler<TParam = void, TResult = unknown> {
    public isRunning: boolean = false;
    private abortController: AbortController | null = null;

    public requestFunc: (param: TParam, signal: AbortSignal) => Promise<TResult>;
    public onBeforeRequestAction: (param: TParam) => void;
    public onProgressAction: (percent: number, param: TParam) => void;
    public onSuccessAction: (result: TResult, param: TParam) => void;
    public onFailureAction: (error: unknown, param: TParam) => void;
    public onFinallyAction: (param: TParam) => void;

    public async executeAsync(param: TParam): Promise<OperationResult<TResult>> {
        if (this.isRunning) {
            throw new Error("Operation is already in progress.");
        }

        this.isRunning = true;
        this.abortController = new AbortController();

        try {
            this.onBeforeRequestAction?.(param);

            if (!this.requestFunc) {
                throw new Error("requestFunc is not assigned.");
            }

            const data = await this.requestFunc(param, this.abortController.signal);
            this.onSuccessAction?.(data, param);

            return { success: true, data };
        } catch (error) {
            this.onFailureAction?.(error, param);
            return { success: false, error };
        } finally {
            this.isRunning = false;
            this.abortController = null;
            this.onFinallyAction?.(param);
        }
    }

    public cancel(): void {
        if (this.isRunning && this.abortController) {
            this.abortController.abort();
        }
    }
}
