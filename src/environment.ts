import { ColliderLayer, engine, Entity, GltfContainer, Transform, TransformType } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { sceneParentEntity } from "./modules/config"

export let workstation: Entity

export function initEnvironment() {

    const sceneBase = engine.addEntity()
    Transform.create(sceneBase, {
        position: Vector3.create(0, 0, 0),
        parent: sceneParentEntity

    })
    GltfContainer.create(sceneBase, {
        src: "models/sceneBase.glb",
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })
    
    workstation = engine.addEntity()
    Transform.create(workstation, {
        position: Vector3.create(0, 0, 2),
        parent: sceneParentEntity
    })
    GltfContainer.create(workstation, {
        src: "models/workstation.glb",
        visibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS
    })


}