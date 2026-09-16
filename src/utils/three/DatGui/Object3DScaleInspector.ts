import * as dat from 'dat.gui';
import * as THREE from 'three';

export interface Object3DScaleInspectorOptions {
    min?: number;
    max?: number;
    step?: number;
}

export class Object3DScaleInspector {
    private gui: dat.GUI;
    public target: THREE.Object3D | null = null;
    public isEditable = false;

    private scaleControllers: dat.GUIController[] = [];

    constructor() {
        this.gui = new dat.GUI();
    }

    public create(
        name = 'Scale',
        options: Object3DScaleInspectorOptions = {}
    ): dat.GUI | undefined {
        if (!this.target) {
            return;
        }

        const folder = this.gui.addFolder(name);

        const min = options.min ?? 0.001;
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
            .add(this.target.scale, 'x', min, max)
            .step(step)
            .onChange((val: number) => {
                if (this.target) this.target.scale.x = val;
            });

        const y = folder
            .add(this.target.scale, 'y', min, max)
            .step(step)
            .onChange((val: number) => {
                if (this.target) this.target.scale.y = val;
            });

        const z = folder
            .add(this.target.scale, 'z', min, max)
            .step(step)
            .onChange((val: number) => {
                if (this.target) this.target.scale.z = val;
            });

        this.scaleControllers.push(x, y, z);

        this.updateEditableState();
        folder.open();

        return folder;
    }

    private updateEditableState(): void {
        for (const controller of this.scaleControllers) {
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

        for (const controller of this.scaleControllers) {
            controller.updateDisplay();
        }
    }

    public destroy(): void {
        this.scaleControllers = [];
        this.gui.destroy();
    }
}
