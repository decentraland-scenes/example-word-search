import { Entity, engine, Transform, VisibilityComponent, MeshRenderer, Material, MaterialTransparencyMode } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { ATLAS_COLUMNS, getWordsAtlasUVs, SRC_WORDS_ATLAS } from "../../resources"
import { CELL_SIZE, getHighlightColor, GRID } from "../game.data"
import { directionVectorBetweenTwoPoints, radToDeg } from "../../utils"


const SELECT_MARKER_START: Entity = engine.addEntity()
const SELECT_MARKER_MIDDLE: Entity = engine.addEntity()
const SELECT_MARKER_END: Entity = engine.addEntity()

export function createSelectMarker()
{
    //START
    Transform.create(SELECT_MARKER_START, {
        parent: GRID,
        scale: Vector3.create(CELL_SIZE, CELL_SIZE, 1)
    })
    VisibilityComponent.create(SELECT_MARKER_START, { visible: false })
    MeshRenderer.setPlane(
        SELECT_MARKER_START,
        getWordsAtlasUVs(7, 0)
    )
    Material.setPbrMaterial(SELECT_MARKER_START, {
        texture: Material.Texture.Common({
          src: SRC_WORDS_ATLAS,
        }),
        castShadows: false,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST_AND_ALPHA_BLEND,
    })
    //MIDDLE
    Transform.create(SELECT_MARKER_MIDDLE, {
        parent: GRID,
        scale: Vector3.create(CELL_SIZE, CELL_SIZE, 1)
    })
    VisibilityComponent.create(SELECT_MARKER_MIDDLE, { visible: false })
    MeshRenderer.setPlane(
        SELECT_MARKER_MIDDLE,
        getWordsAtlasUVs(7, 1)
    )
    Material.setPbrMaterial(SELECT_MARKER_MIDDLE, {
        texture: Material.Texture.Common({
          src: SRC_WORDS_ATLAS,
        }),
        castShadows: false,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST_AND_ALPHA_BLEND,
    })
    //END
    Transform.create(SELECT_MARKER_END, {
        parent: GRID,
        scale: Vector3.create(CELL_SIZE, CELL_SIZE, 1)
    })
    VisibilityComponent.create(SELECT_MARKER_END, { visible: false })
    MeshRenderer.setPlane(
        SELECT_MARKER_END,
        getWordsAtlasUVs(7, 0)
    )
    Material.setPbrMaterial(SELECT_MARKER_END, {
        texture: Material.Texture.Common({
          src: SRC_WORDS_ATLAS,
        }),
        castShadows: false,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST_AND_ALPHA_BLEND,
    })
}

export function showSelectMarker()
{
    VisibilityComponent.getMutable(SELECT_MARKER_START).visible = true
    VisibilityComponent.getMutable(SELECT_MARKER_MIDDLE).visible = true
    VisibilityComponent.getMutable(SELECT_MARKER_END).visible = true
}
export function hideSelectMarker()
{
    VisibilityComponent.getMutable(SELECT_MARKER_START).visible = false
    VisibilityComponent.getMutable(SELECT_MARKER_MIDDLE).visible = false
    VisibilityComponent.getMutable(SELECT_MARKER_END).visible = false
}

export function updateSelectMarker(start: Entity, end: Entity)
{
    //Position
    const startTrans = Transform.getMutable(SELECT_MARKER_START)
    startTrans.position = Vector3.add(Transform.get(start).position, {x: 0, y: 0, z: 0.001})
    
    const endTrans = Transform.getMutable(SELECT_MARKER_END)
    endTrans.position = Vector3.add(Transform.get(end).position, {x: 0, y: 0, z: 0.001})

    
    const middleTrans = Transform.getMutable(SELECT_MARKER_MIDDLE)
    middleTrans.position = Vector3.add(
        Vector3.scale(Vector3.add(Transform.get(start).position, Transform.get(end).position), 0.5), //Middle point
        {x: 0, y: 0, z: 0.001}
    )
    
    //Rotation math stuff (I hate rotations)
    const startAngleInRad = Vector3.getAngleBetweenVectors(
        {x: -1, y:0, z: 0}, //Default forward vector
        directionVectorBetweenTwoPoints({...startTrans.position, z: 0}, {...endTrans.position, z: 0}), //Direction normal vector to target
        {x: 1, y: 1, z: 1}  //World normal
    )
    const endAngleInRad = Vector3.getAngleBetweenVectors(
        {x: -1, y:0, z: 0}, //Default forward vector
        directionVectorBetweenTwoPoints({...endTrans.position, z: 0}, {...startTrans.position, z: 0}), //Direction normal vector to target
        {x: 1, y: 1, z: 1}  //World normal
    )
    
    startTrans.rotation = Quaternion.fromEulerDegrees(0,0,radToDeg(startAngleInRad))
    endTrans.rotation = Quaternion.fromEulerDegrees(0,0,radToDeg(endAngleInRad))
    middleTrans.rotation = startTrans.rotation

    //Scale of middle piece
    const distance = Vector3.distance({...Transform.get(start).position, z: 0}, {...Transform.get(end).position, z: 0}) //Distance between start & end
    if(distance - CELL_SIZE <= -0.1)
    {
        //Disable middle & end pieces when they are too close
        endTrans.scale.x = 0
        middleTrans.scale.x = 0
    }
    else
    {
        middleTrans.scale.x = distance - CELL_SIZE
        endTrans.scale.x = CELL_SIZE
    }

    //Color
    const iconIndex = getHighlightColor() * 2
    MeshRenderer.setPlane(
        SELECT_MARKER_START,
        getWordsAtlasUVs(6+Math.floor((4+iconIndex)/ATLAS_COLUMNS), (4+iconIndex)%ATLAS_COLUMNS)
    )
    MeshRenderer.setPlane(
        SELECT_MARKER_END,
        getWordsAtlasUVs(6+Math.floor((4+iconIndex)/ATLAS_COLUMNS), (4+iconIndex)%ATLAS_COLUMNS)
    )
    MeshRenderer.setPlane(
        SELECT_MARKER_MIDDLE,
        getWordsAtlasUVs(6+Math.floor((5+iconIndex)/ATLAS_COLUMNS), (5+iconIndex)%ATLAS_COLUMNS)
    )
}