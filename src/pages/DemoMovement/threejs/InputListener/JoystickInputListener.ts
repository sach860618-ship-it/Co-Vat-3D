import nipplejs from 'nipplejs';
import { MovementVector } from './InputListener';

export interface JoystickInputListenerOptions {
    zone?: HTMLElement;
    size?: number;
    color?: string;
    position?: {
        left?: string;
        top?: string;
        right?: string;
        bottom?: string;
    };
    mode?: 'dynamic' | 'semi' | 'static';
    threshold?: number;
}

export class JoystickInputListener {
    private manager?: ReturnType<typeof nipplejs.create>;
    private zoneElement?: HTMLDivElement;
    private options: JoystickInputListenerOptions;
    private forward: number = 0;
    private strafe: number = 0;
    private isVisible: boolean = true;

    constructor(options?: JoystickInputListenerOptions) {
        this.options = options || {};
        this.init();
    }

    private init(): void {
        const parentContainer = this.options.zone || document.body;

        const zoneWidth = 180;
        const zoneHeight = 180;
        const joystickSize = this.options.size || 100;

        // Tạo container riêng cho Joystick
        this.zoneElement = document.createElement('div');
        this.zoneElement.className = 'virtual-joystick-zone';
        this.zoneElement.style.position = 'absolute';
        this.zoneElement.style.left = this.options.position?.left || '30px';
        this.zoneElement.style.bottom = this.options.position?.bottom || '60px';
        if (this.options.position?.right) this.zoneElement.style.right = this.options.position.right;
        if (this.options.position?.top) this.zoneElement.style.top = this.options.position.top;
        this.zoneElement.style.width = `${zoneWidth}px`;
        this.zoneElement.style.height = `${zoneHeight}px`;
        this.zoneElement.style.zIndex = '40';
        this.zoneElement.style.touchAction = 'none';
        this.zoneElement.style.userSelect = 'none';
        this.zoneElement.style.transition = 'opacity 0.2s ease-in-out';

        parentContainer.appendChild(this.zoneElement);

        this.manager = nipplejs.create({
            zone: this.zoneElement,
            mode: this.options.mode || 'static',
            position: {
                left: `${zoneWidth / 2}px`,
                top: `${zoneHeight / 2}px`,
            },
            size: joystickSize,
            color: this.options.color || '#c70b0b',
            threshold: this.options.threshold || 0.1,
            restOpacity: 0.7,
        });

        // Nipplejs v1.x truyền payload trong evt.data
        this.manager.on('move', (evt: any, legacyData?: any) => {
            const data = evt?.data || legacyData || evt;
            if (data?.vector) {
                // vector.y: dương khi đẩy cần lên (tiến/forward), âm khi kéo xuống (lùi)
                // vector.x: âm khi gạt trái (strafe trái), dương khi gạt phải (strafe phải)
                this.forward = data.vector.y;
                this.strafe = data.vector.x;
            }
        });

        this.manager.on('end', () => {
            this.reset();
        });

        window.addEventListener('blur', this.handleBlur);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    private handleBlur = (): void => {
        this.reset();
    };

    private handleVisibilityChange = (): void => {
        if (document.hidden) {
            this.reset();
        }
    };

    public reset(): void {
        this.forward = 0;
        this.strafe = 0;
    }

    public getMovement(): MovementVector {
        return {
            forward: this.forward,
            strafe: this.strafe,
        };
    }

    public isMoving(): boolean {
        return Math.abs(this.forward) > 0.05 || Math.abs(this.strafe) > 0.05;
    }

    public show(): void {
        this.isVisible = true;
        if (this.zoneElement) {
            this.zoneElement.style.visibility = 'visible';
            this.zoneElement.style.opacity = '1';
            this.zoneElement.style.pointerEvents = 'auto';
        }
        // Làm mới toạ độ bounding box trong nipplejs ngay khi hiển thị
        this.manager?.reposition();
    }

    public hide(): void {
        this.isVisible = false;
        this.forward = 0;
        this.strafe = 0;
        if (this.zoneElement) {
            this.zoneElement.style.visibility = 'hidden';
            this.zoneElement.style.opacity = '0';
            this.zoneElement.style.pointerEvents = 'none';
        }
    }

    public getIsVisible(): boolean {
        return this.isVisible;
    }

    public destroy(): void {
        window.removeEventListener('blur', this.handleBlur);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        this.reset();
        if (this.manager) {
            this.manager.destroy();
            this.manager = undefined;
        }
        if (this.zoneElement && this.zoneElement.parentElement) {
            this.zoneElement.parentElement.removeChild(this.zoneElement);
            this.zoneElement = undefined;
        }
    }
}
