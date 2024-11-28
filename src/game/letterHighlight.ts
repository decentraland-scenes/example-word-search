import { engine, Entity, Material, MaterialTransparencyMode, MeshRenderer, Transform, VisibilityComponent } from "@dcl/sdk/ecs";
import { HighlightColor, HighlightData, HighlightPiece } from "./game.schema";;
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { ATLAS_COLUMNS, getWordsAtlasUVs, SRC_WORDS_ATLAS } from "../resources";


const highlightPool: HighlightPiece[] = [];
const STORE_POSITION: Vector3 = Vector3.create(2,-5,2)

function createPiece()
{
    const piece = engine.addEntity()
    Transform.create(piece, {
        position: STORE_POSITION
    })
    MeshRenderer.setPlane(
        piece,
        getWordsAtlasUVs(7, 0)
    )
    VisibilityComponent.create(piece, {
        visible: false
    })

    Material.setPbrMaterial(piece, {
        texture: Material.Texture.Common({
          src: SRC_WORDS_ATLAS,
        }),
        castShadows: false,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST_AND_ALPHA_BLEND,
    })

    highlightPool.push({
        entity: piece,
        index: highlightPool.length,
        inUse: true
    })

    return piece
}

function requestPiece()
{
    for (let i = 0; i < highlightPool.length; i++) {
        if(highlightPool[i].inUse == false)
        {
            highlightPool[i].inUse = true
            return highlightPool[i].entity
        }
    }

    return createPiece()
}

function storePiece(index: number)
{
    VisibilityComponent.getMutable(highlightPool[index].entity).visible = false
    Transform.createOrReplace(highlightPool[index].entity, {
        position: STORE_POSITION
    })

    highlightPool[index].inUse = false
}

export function clearAllHighlights()
{
    for (let i = 0; i < highlightPool.length; i++) {
        if(highlightPool[i].inUse) {
            storePiece(i)  
        }
    }
}

export function setLetterHighlight(letter: Entity, data: HighlightData, color: HighlightColor)
{
    const piece = requestPiece()
    Transform.createOrReplace(piece, {
        parent: letter,
        position: Vector3.create(0, 0, 0.001),
        rotation: Quaternion.fromEulerDegrees(0,0,data.direction),
        scale: Vector3.create(data.scale, 1, 1)
    })
    let iconIndex = color * 2
    if(data.isStart == false) iconIndex++;
    MeshRenderer.setPlane(
        piece,
        getWordsAtlasUVs(6+Math.floor((4+iconIndex)/ATLAS_COLUMNS), (4+iconIndex)%ATLAS_COLUMNS)
    )

    VisibilityComponent.getMutable(piece).visible = true
}