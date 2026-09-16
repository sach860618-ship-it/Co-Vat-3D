export class KeyCode {
    public static W = "KeyW";
    public static A = "KeyA";
    public static S = "KeyS";
    public static D = "KeyD";
    public static Z = "KeyZ";
    public static ArrowUp = "ArrowUp";
    public static ArrowDown = "ArrowDown";
    public static ArrowLeft = "ArrowLeft";
    public static ArrowRight = "ArrowRight";
}

export class Input {
    public keys = new Set<string>();
    public keysDown = new Set<string>();
    public keysUp = new Set<string>();

    private onKeyDown = (e: KeyboardEvent) => {
        if (!this.keys.has(e.code)) {
            this.keysDown.add(e.code);
        }
        this.keys.add(e.code);
    };

    private onKeyUp = (e: KeyboardEvent) => {
        this.keys.delete(e.code);
        this.keysUp.add(e.code);
    };

    private onBlur = () => {
        this.reset();
    };

    private onVisibilityChange = () => {
        if (document.hidden) {
            this.reset();
        }
    };

    public reset() {
        this.keys.clear();
        this.keysDown.clear();
        this.keysUp.clear();
    }

    public init() {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        window.addEventListener("blur", this.onBlur);
        document.addEventListener("visibilitychange", this.onVisibilityChange);
    }

    public destroy() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        window.removeEventListener("blur", this.onBlur);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
        this.reset();
    }

    public getKey(key: string): boolean {
        return this.keys.has(key);
    }

    public getKeyDown(key: string): boolean {
        return this.keysDown.has(key);
    }

    public getKeyUp(key: string): boolean {
        return this.keysUp.has(key);
    }

    public update() {
        this.keysDown.clear();
        this.keysUp.clear();
    }
}