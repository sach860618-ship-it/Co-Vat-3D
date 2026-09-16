import * as dat from 'dat.gui';
import * as CANNON from 'cannon-es';

export interface CannonBodyPositionInspectorOptions {
    min?: number;
    max?: number;
    step?: number;
}

export class CannonBodyPositionInspector {
    private gui: dat.GUI;
    public cannonBody: CANNON.Body | null = null;
    public isEditable = false;

    private positionControllers: dat.GUIController[] = [];

    constructor() {
        this.gui = new dat.GUI();
    }

    public create(
        name = 'Position',
        options: CannonBodyPositionInspectorOptions = {}
    ): dat.GUI | undefined {
        if (!this.cannonBody) {
            return;
        }

        const folder = this.gui.addFolder(name);

        const min = options.min ?? -10;
        const max = options.max ?? 10;
        const step = options.step ?? 0.01;

        folder
            .add(this, 'isEditable')
            .name('Can Edit')
            .onChange((value: boolean) => {
                this.isEditable = value;
                this.updateEditableState();

                if (!value) {
                    this.update();
                }
            });

        const x = folder
            .add(this.cannonBody.position, 'x', min, max)
            .step(step)
            .onChange((value: number) => {
                if (this.cannonBody) {
                    this.cannonBody.position.x = value;
                    this.cannonBody.wakeUp();
                    this.cannonBody.velocity.set(0, 0, 0);
                }
            });

        const y = folder
            .add(this.cannonBody.position, 'y', min, max)
            .step(step)
            .onChange((value: number) => {
                if (this.cannonBody) {
                    this.cannonBody.position.y = value;
                    this.cannonBody.wakeUp();
                    this.cannonBody.velocity.set(0, 0, 0);
                }
            });

        const z = folder
            .add(this.cannonBody.position, 'z', min, max)
            .step(step)
            .onChange((value: number) => {
                if (this.cannonBody) {
                    this.cannonBody.position.z = value;
                    this.cannonBody.wakeUp();
                    this.cannonBody.velocity.set(0, 0, 0);
                }
            });

        this.positionControllers.push(x, y, z);

        this.updateEditableState();

        folder.open();

        return folder;
    }

    private updateEditableState(): void {
        for (const controller of this.positionControllers) {
            const li = (controller as any).__li as HTMLElement | undefined;

            if (!li) {
                continue;
            }

            li.style.pointerEvents = this.isEditable ? 'auto' : 'none';
            li.style.opacity = this.isEditable ? '1' : '0.5';
        }
    }

    public update(): void {
        if (!this.cannonBody) {
            return;
        }
        if (this.isEditable) {
            return;
        }

        for (const controller of this.positionControllers) {
            controller.updateDisplay();
        }
    }

    public destroy(): void {
        this.positionControllers = [];
        this.gui.destroy();
    }
}
