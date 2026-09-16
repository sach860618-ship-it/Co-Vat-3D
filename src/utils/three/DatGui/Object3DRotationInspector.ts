import * as dat from 'dat.gui';
import * as THREE from 'three';

export interface Object3DRotationInspectorOptions {
    min?: number;
    max?: number;
    step?: number;
}

export class Object3DRotationInspector {
    private gui: dat.GUI;
    public target: THREE.Object3D | null = null;
    public isEditable = false;

    private rotationControllers: dat.GUIController[] = [];
    private rotationDegrees = { x: 0, y: 0, z: 0 };

    constructor() {
        this.gui = new dat.GUI();
    }

    public create(
        name = 'Rotation',
        options: Object3DRotationInspectorOptions = {}
    ): dat.GUI | undefined {
        if (!this.target) {
            return;
        }

        const folder = this.gui.addFolder(name);

        const min = options.min ?? -180;
        const max = options.max ?? 180;
        const step = options.step ?? 0.1;

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

        this.syncRotationDegreesFromTarget();

        const x = folder
            .add(this.rotationDegrees, 'x', min, max)
            .step(step)
            .name('X')
            .onChange((deg: number) => {
                if (this.target) {
                    this.target.rotation.x = THREE.MathUtils.degToRad(deg);
                }
            });

        const y = folder
            .add(this.rotationDegrees, 'y', min, max)
            .step(step)
            .name('Y')
            .onChange((deg: number) => {
                if (this.target) {
                    this.target.rotation.y = THREE.MathUtils.degToRad(deg);
                }
            });

        const z = folder
            .add(this.rotationDegrees, 'z', min, max)
            .step(step)
            .name('Z')
            .onChange((deg: number) => {
                if (this.target) {
                    this.target.rotation.z = THREE.MathUtils.degToRad(deg);
                }
            });

        this.rotationControllers.push(x, y, z);

        this.updateEditableState();
        folder.open();

        return folder;
    }

    private syncRotationDegreesFromTarget(): void {
        if (!this.target) return;
        this.rotationDegrees.x = Number(THREE.MathUtils.radToDeg(this.target.rotation.x).toFixed(2));
        this.rotationDegrees.y = Number(THREE.MathUtils.radToDeg(this.target.rotation.y).toFixed(2));
        this.rotationDegrees.z = Number(THREE.MathUtils.radToDeg(this.target.rotation.z).toFixed(2));
    }

    private updateEditableState(): void {
        for (const controller of this.rotationControllers) {
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

        this.syncRotationDegreesFromTarget();

        for (const controller of this.rotationControllers) {
            controller.updateDisplay();
        }
    }

    public destroy(): void {
        this.rotationControllers = [];
        this.gui.destroy();
    }
}
