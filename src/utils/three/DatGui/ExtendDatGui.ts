import * as dat from 'dat.gui';
import * as THREE from 'three';

export class ExtendDatGui {
    private gui: dat.GUI;
    private controllers: dat.GUIController[] = [];

    constructor() {
        this.gui = new dat.GUI();
    }

    public addVector3(
        name: string,
        vector: THREE.Vector3,
        options: {
            min?: number;
            max?: number;
            step?: number;
        } = {}
    ) {
        const folder = this.gui.addFolder(name);

        const min = options.min ?? -10;
        const max = options.max ?? 10;
        const step = options.step ?? 0.01;

        const x = folder.add(vector, 'x', min, max).step(step);
        const y = folder.add(vector, 'y', min, max).step(step);
        const z = folder.add(vector, 'z', min, max).step(step);

        this.controllers.push(x, y, z);

        folder.open();

        return folder;
    }

    public addPosition(
        object: THREE.Object3D,
        options: {
            min?: number;
            max?: number;
            step?: number;
        } = {}
    ) {
        return this.addVector3(
            'Position',
            object.position,
            options
        );
    }

    public update() {
        for (const controller of this.controllers) {
            controller.updateDisplay();
        }
    }

    public destroy() {
        this.gui.destroy();
    }
}