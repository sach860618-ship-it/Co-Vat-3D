
import * as CANNON from 'cannon-es';
export class ExtendCannon {
    public static createDefaultBox(): CANNON.Body {
        return new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(
                new CANNON.Vec3(0.5, 0.5, 0.5)
            ),
            position: new CANNON.Vec3(0, 0, 0)
        });
    }

    public static createDefaultCircle(): CANNON.Body {
        return new CANNON.Body({
            mass: 1,
            shape: new CANNON.Sphere(0.5),
            position: new CANNON.Vec3(0, 0, 0)
        });
    }

    public static createDefaultCapsule(): CANNON.Body {
        const radius = 0.5;
        const height = 1;

        const body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 0, 0)
        });

        body.addShape(
            new CANNON.Cylinder(radius, radius, height, 16)
        );

        const sphere = new CANNON.Sphere(radius);

        body.addShape(
            sphere,
            new CANNON.Vec3(0, height / 2, 0)
        );

        body.addShape(
            sphere,
            new CANNON.Vec3(0, -height / 2, 0)
        );

        return body;
    }


    public static createCapsule(radius: number, height: number): CANNON.Body {
        const body = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 0, 0)
        });

        body.addShape(
            new CANNON.Cylinder(radius, radius, height, 16)
        );

        const sphere = new CANNON.Sphere(radius);

        body.addShape(
            sphere,
            new CANNON.Vec3(0, height / 2, 0)
        );

        body.addShape(
            sphere,
            new CANNON.Vec3(0, -height / 2, 0)
        );

        return body;
    }
    public static createDefaultCylinder(): CANNON.Body {
        const radius = 0.5;
        const height = 1;

        return new CANNON.Body({
            mass: 1,
            shape: new CANNON.Cylinder(
                radius,
                radius,
                height,
                16
            ),
            position: new CANNON.Vec3(0, 0, 0)
        });
    }

    public static createCylinder(
        radius: number,
        height: number,
        segments: number = 16,
        mass: number = 1
    ): CANNON.Body {

        return new CANNON.Body({
            mass,
            shape: new CANNON.Cylinder(
                radius,
                radius,
                height,
                segments
            ),
            position: new CANNON.Vec3(0, 0, 0)
        });
    }
}