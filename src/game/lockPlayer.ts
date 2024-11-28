import { ColliderLayer, engine, Entity, InputModifier, MainCamera, MeshCollider, Transform, VirtualCamera } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { movePlayerTo } from "~system/RestrictedActions";
import { getBoardPoint, getExitPoint, getPlayPoint, GRID, SCENE_CENTER } from "./game.data";
import { sceneParentEntity } from "../modules/config";


var blockSceneCollider1: Entity
var blockSceneCollider2: Entity
var blockSceneCollider3: Entity

var customCameraEnt: Entity

export function blockScene(){
    if(!blockSceneCollider1) {
        blockSceneCollider1 = engine.addEntity()
        Transform.create(blockSceneCollider1, {
            parent: sceneParentEntity,
            position: Vector3.create(0, 5, 1),
            scale: Vector3.create(9.2, 10, 0.2)
        })
        //MeshRenderer.setBox(blockSceneCollider1)

        blockSceneCollider2 = engine.addEntity()
        Transform.create(blockSceneCollider2, {
            parent: sceneParentEntity,
            position: Vector3.create(4.5, 5, -3),
            scale: Vector3.create(0.2, 10, 8.2)
        })
        //MeshRenderer.setBox(blockSceneCollider2)

        blockSceneCollider3 = engine.addEntity()
        Transform.create(blockSceneCollider3, {
            parent: sceneParentEntity,
            position: Vector3.create(-4.5, 5, -3),
            scale: Vector3.create(0.2, 10, 8.2)
        })
        //MeshRenderer.setBox(blockSceneCollider3)
    }

    MeshCollider.setBox(blockSceneCollider1, ColliderLayer.CL_PHYSICS)
    MeshCollider.setBox(blockSceneCollider2, ColliderLayer.CL_PHYSICS)
    MeshCollider.setBox(blockSceneCollider3, ColliderLayer.CL_PHYSICS)
}
export function unblockScene() {
    if(!blockSceneCollider1) return;
    MeshCollider.setBox(blockSceneCollider1, ColliderLayer.CL_NONE)
}

export function lockPlayer(){
    
    movePlayerTo({
        newRelativePosition: getPlayPoint(),
        cameraTarget: getBoardPoint(),
    })

    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableAll: true
          }
        }
      })

}

export function unlockPlayer(){

    InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableAll: false
          }
        }
      })
    
    movePlayerTo({ newRelativePosition: getExitPoint(), cameraTarget: Vector3.add(Transform.get(sceneParentEntity).position, {x: 0, y: 1.5, z: 0}) }) 
}

export function initCamera() {
    try {
        if(!customCameraEnt) {
            customCameraEnt = engine.addEntity()
            Transform.create(customCameraEnt, {
                position: Vector3.add(getPlayPoint(), {x: 0, y: 3, z: 1.5}),
                rotation: Quaternion.fromEulerDegrees(0,180,0)
            })
            VirtualCamera.create(customCameraEnt, {
                defaultTransition: { transitionMode: VirtualCamera.Transition.Time(0.5) },
            })
        }
    } catch (error) {
        console.error(error); 
    }
}

export function blockCamera() {
    try {
        MainCamera.createOrReplace(engine.CameraEntity, {
            virtualCameraEntity: customCameraEnt,
        })    
        
    } catch (error) {
        console.error(error); 
    }
}
export function freeCamera() {
    try {
        MainCamera.getMutable(engine.CameraEntity).virtualCameraEntity = undefined
    } catch (error) {
        console.error(error); 
    }
}