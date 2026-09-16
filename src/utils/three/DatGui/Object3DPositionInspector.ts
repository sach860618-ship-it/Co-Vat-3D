import * as dat from 'dat.gui';
import * as THREE from 'three';

export interface Object3DPositionInspectorOptions {
    min?: number;
    max?: number;
    step?: number;
}

export class Object3DPositionInspector {
    private gui: dat.GUI;
    public target: THREE.Object3D | null = null;
    public isEditable = false;

    private positionControllers: dat.GUIController[] = [];

    constructor() {
        this.gui = new dat.GUI();
    }

    public create(
        name = 'Position',
        options: Object3DPositionInspectorOptions = {}
    ): dat.GUI | undefined {
        if (!this.target) {
            return;
        }

        const folder = this.gui.addFolder(name);

        const min = options.min ?? -100;
        const max = options.max ?? 100;
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
            .add(this.target.position, 'x', min, max)
            .step(step)
            .onChange((val: number) => {
                if (this.target) this.target.position.x = val;
            });

        const y = folder
            .add(this.target.position, 'y', min, max)
            .step(step)
            .onChange((val: number) => {
                if (this.target) this.target.position.y = val;
            });

        const z = folder
            .add(this.target.position, 'z', min, max)
            .step(step)
            .onChange((val: number) => {
                if (this.target) this.target.position.z = val;
            });

        this.positionControllers.push(x, y, z);

        this.updateEditableState();
        folder.open();

        return folder;
    }

    private updateEditableState(): void {
        for (const controller of this.positionControllers) {
            const li = (controller as any).__li as HTMLElement | undefined;
            if (!li) continue;

            li.style.pointerEvents = this.isEditable ? 'auto' : 'none';
            li.style.opacity = this.isEditable ? '1' : '0.5';
        }
    }

    public update(): void {
        if (!this.target) {
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
