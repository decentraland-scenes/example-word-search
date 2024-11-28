import { engine, Entity, Transform, TransformTypeWithOptionals } from "@dcl/sdk/ecs";

export const sceneParentEntity: Entity = engine.addEntity()

export function initParentEntity(transform: Omit<TransformTypeWithOptionals, 'parent'>) {
    Transform.createOrReplace(sceneParentEntity, transform)
}