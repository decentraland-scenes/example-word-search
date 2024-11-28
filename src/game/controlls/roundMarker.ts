import { Entity, engine, Transform, VisibilityComponent, MeshRenderer, Material } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { GRID, getHighlihtColor4 } from "../game.data"
import { PbrMat } from "../game.schema"
import * as utils from "@dcl-sdk/utils"
import { tweenUtils } from "../../utils/tweens/positionTween"
import { EasingType } from "../../utils/tweens/easingFunctions"


const ROUND_MARKER: Entity = engine.addEntity()
const ROUND_MAKER_SCALE = 0.4
const USE_ANIMATION = true

export function createRoundMarker()
{
    Transform.create(ROUND_MARKER, {
        parent: GRID,
        scale: Vector3.create(ROUND_MAKER_SCALE, ROUND_MAKER_SCALE, 0.01)
    })
    VisibilityComponent.create(ROUND_MARKER, { visible: false })
    MeshRenderer.setSphere(ROUND_MARKER)
    Material.setPbrMaterial(ROUND_MARKER, {
        albedoColor: getHighlihtColor4(),
        emissiveColor: getHighlihtColor4(),
        emissiveIntensity: 1
    })
}

export function showRoundMarker()
{
    if(USE_ANIMATION)
    {
        utils.timers.setTimeout(()=>{
            tweenUtils.startScaling(
                ROUND_MARKER,
                Vector3.Zero(),
                Vector3.create(ROUND_MAKER_SCALE, ROUND_MAKER_SCALE, 0.01),
                0.3,
                EasingType.EASESINE,
                ()=>{
                    Transform.getMutable(ROUND_MARKER).scale = Vector3.create(ROUND_MAKER_SCALE, ROUND_MAKER_SCALE, 0.01)
                }
            )
        }, 50)
    }
    VisibilityComponent.getMutable(ROUND_MARKER).visible = true
}
export function hideRoundMarker()
{
    VisibilityComponent.getMutable(ROUND_MARKER).visible = false
}

export function updateRoundMarker(target: Entity)
{   
    const mat = (Material.getMutable(ROUND_MARKER).material as PbrMat);
    mat.pbr.albedoColor = getHighlihtColor4()
    mat.pbr.emissiveColor = mat.pbr.albedoColor
    Transform.getMutable(ROUND_MARKER).position = Transform.get(target).position
    
}