import { engine, Entity, Material, MeshRenderer, Transform } from "@dcl/sdk/ecs";
import { Color4, Vector3 } from "@dcl/sdk/math";


export function addDebugPivot(parent: Entity)
{
    const pivot = engine.addEntity()
    Transform.create(pivot, {
        parent: parent,
        position: Vector3.create(0, 0, 0),
        scale: Vector3.create(1, 1, 1)
    })

    const center = engine.addEntity()
    Transform.create(center, {
        parent: pivot,
        scale: Vector3.scale(Vector3.One(), 0.15)
    })
    MeshRenderer.setSphere(center)
    Material.setBasicMaterial(center, {
        diffuseColor: Color4.Blue(),
    })

    const box1 = engine.addEntity()
    Transform.create(box1, {
        parent: pivot,
        position: Vector3.create(0.2, 0, 0),
        scale: Vector3.create(.4, .05, .05)
    })
    MeshRenderer.setBox(box1)
    Material.setBasicMaterial(box1, {
        diffuseColor: Color4.Red(),
    })

    const box2 = engine.addEntity()
    Transform.create(box2, {
        parent: pivot,
        position: Vector3.create(0, 0.2, 0),
        scale: Vector3.create(.05, .4, .05)
    })
    MeshRenderer.setBox(box2)
    Material.setBasicMaterial(box2, {
        diffuseColor: Color4.Yellow(),
    })

    const box3 = engine.addEntity()
    Transform.create(box3, {
        parent: pivot,
        position: Vector3.create(0, 0, 0.2),
        scale: Vector3.create(.05, .05, .4)
    })
    MeshRenderer.setBox(box3)
    Material.setBasicMaterial(box3, {
        diffuseColor: Color4.Green(),
    })
}