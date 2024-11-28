import { engine, Entity, InputAction, Material, MeshCollider, MeshRenderer, PBMaterial_UnlitMaterial, PointerEvents, PointerEventType, Schemas, Transform } from "@dcl/sdk/ecs";
import { Color4, Vector3 } from "@dcl/sdk/math";
import { BOARD, CELL_PADDING, CELL_SIZE, getHighlightColor, GRID, GRID_SIZE, X_LENGTH, Y_LENGTH } from "./game.data";
import { ATLAS_COLUMNS, getWordsAtlasUVs, SRC_WORDS_ATLAS } from "../resources";
import { E_Letter, LetterIndex } from "./game.schema";
import { setLetterHighlight } from "./letterHighlight";
import * as utils from "@dcl-sdk/utils"
import { randomIntFromInterval } from "../utils";
import { tweenUtils } from "../utils/tweens/positionTween";
import { EasingType } from "../utils/tweens/easingFunctions";


const USE_LETTER_ANIMATION = true
const letterGrid: Entity[][] = []
const letterValue: E_Letter[][] = []
const letterGridPositions: Vector3[][] = []
const animInProgress: boolean[][] = []

const NetLetterDataComponent = engine.defineComponent(
"NetLetterDataComponent",
{
    net_letterValue: Schemas.String
})
var net_syncDataEntity: Entity
var net_previousLetterValue: string = ""


export function setupGrid() {
    
    Transform.create(GRID, {
        parent: BOARD,
        position: Vector3.create(-X_LENGTH/2, -Y_LENGTH/2, 0)
    })

    for (let i = 0; i < GRID_SIZE.x; i++) {
        if(!letterGrid[i]) letterGrid[i] = []
        if(!letterValue[i]) letterValue[i] = []
        if(!animInProgress[i]) animInProgress[i] = []
        for (let j = 0; j < GRID_SIZE.y; j++) {
            letterGrid[i][j] = createLetter(i, j) 
            letterValue[i][j] = 0
            animInProgress[i][j] = false
        }
    }

}

function createLetter(x: number, y: number) : Entity
{
    const newLetter = engine.addEntity()
    Transform.create(newLetter, {
        parent: GRID,
        position: Vector3.create(getCellPositionX(x), getCellPositionY(y), 0),
        scale: Vector3.create(CELL_SIZE, CELL_SIZE, 1)
    })

    if(!letterGridPositions[x]) letterGridPositions[x] = []
    letterGridPositions[x][y] = Transform.get(newLetter).position

    letterValue[x][y] = 0
    setLetter(newLetter, 0)

    Material.setBasicMaterial(newLetter, {
        texture: Material.Texture.Common({
          src: SRC_WORDS_ATLAS,
        }),
        castShadows: false,
        alphaTest: 0
        //transparencyMode: MaterialTransparencyMode.MTM_ALPHA_TEST,
        //alphaTest: 1,
    })

    MeshCollider.setPlane(newLetter)

    PointerEvents.create(newLetter, { pointerEvents: 
        [
            {
                eventType: PointerEventType.PET_HOVER_ENTER,
                eventInfo: {
                    button: InputAction.IA_POINTER,
                    showFeedback: false,
                }
            },
            {
                eventType: PointerEventType.PET_DOWN,
                eventInfo: {
                    button: InputAction.IA_POINTER,
                    showFeedback: false,
                }
            },
            {
                eventType: PointerEventType.PET_DOWN,
                eventInfo: {
                    button: InputAction.IA_PRIMARY,
                    showFeedback: false,
                }
            }
        ]
    })

    return newLetter
}

function getCellPositionX(x: number): number
{
    return CELL_SIZE/2 + CELL_SIZE * x + CELL_PADDING * x
}

function getCellPositionY(y: number): number
{
    return CELL_SIZE/2 + CELL_SIZE * y  + CELL_PADDING * y
}

export function getLetters()
{
    return letterGrid
}

export function getLetterString(x: number, y: number)
{
    return E_Letter[letterValue[x][y]]
}

export function setLetterByIndex(x: number, y: number, letter: E_Letter)
{
    letterValue[x][y] = letter
    if (USE_LETTER_ANIMATION && !animInProgress[x][y]) {
        animInProgress[x][y] = true
        setLetterAnimation(x, y)
        return;
    }
    setLetter(letterGrid[x][y], letter)
}

function setLetter(entity: Entity, letter: E_Letter, blocked = false)
{
    let letterNumber = (letter as number)
    if(!blocked) letterNumber += 26;
    
    MeshRenderer.setPlane(
        entity, 
        getWordsAtlasUVs(Math.floor(letterNumber/ATLAS_COLUMNS), letterNumber%ATLAS_COLUMNS)
    )
}
function setLetterAnimation(x: number, y: number)
{
    utils.timers.setTimeout(() => {   
        startLetterAnim(x, y)
    }, randomIntFromInterval(0,700))
}

export function startLetterAnim(x: number, y: number)
{
    let executedEnd = false

    tweenUtils.startTranslation(
        letterGrid[x][y],
        letterGridPositions[x][y],
        Vector3.add(letterGridPositions[x][y], {x: 0, y: 0, z: 0.1}),
        0.3,
        EasingType.EASESINE,
        ()=>{
            setLetter(letterGrid[x][y], letterValue[x][y])
            tweenUtils.startTranslation(
                letterGrid[x][y],
                Transform.get(letterGrid[x][y]).position,
                letterGridPositions[x][y],
                0.2,
                EasingType.EASESINE,
                ()=>{
                    if(executedEnd) return;
                    executedEnd = true
                    Transform.getMutable(letterGrid[x][y]).position = letterGridPositions[x][y]
                    animInProgress[x][y] = false
                }
            )
        }
    )

    utils.timers.setTimeout(()=>{
        setLetter(letterGrid[x][y], letterValue[x][y])
        if(!executedEnd) {
            executedEnd = true
            Transform.getMutable(letterGrid[x][y]).position = letterGridPositions[x][y]
            animInProgress[x][y] = false
        }
    }, 0.55*1000)
}

export function debug_revealLetter(x: number, y: number, color: Color4)
{
    const mat = Material.getMutable(letterGrid[x][y])?.material as { $case: "unlit"; unlit: PBMaterial_UnlitMaterial;};

    mat.unlit.diffuseColor = color
}

export function highlightGridWord(letterIndexes: LetterIndex[])
{
    let direction = 0
    let scale = 1
    if(letterIndexes[0].x == letterIndexes[1].x) {
        if(letterIndexes[0].y > letterIndexes[1].y) direction = 90  //Down
        else direction = 270    //Up
    }
    else if(letterIndexes[0].x > letterIndexes[1].x) {
        if(letterIndexes[0].y == letterIndexes[1].y) direction = 0  //Left
        else if(letterIndexes[0].y > letterIndexes[1].y) {direction = 45; scale = 1.4155;}   //Left-Down
        else {direction = -45; scale = 1.4155;}     //Left-Up
    }
    else {
        if(letterIndexes[0].y == letterIndexes[1].y) direction = 180    //Right
        else if(letterIndexes[0].y > letterIndexes[1].y) {direction = 135; scale = 1.4155;}   //Right-Down
        else {direction = 225; scale = 1.4155;}   //Right-Up
    }

    setLetterHighlight(
        letterGrid[letterIndexes[0].x][letterIndexes[0].y],
        {
            isStart: true,
            direction: direction,
            scale: scale
        },
        getHighlightColor()
    )

    for (let i = 1; i < letterIndexes.length - 1; i++) {
        setLetterHighlight(
            letterGrid[letterIndexes[i].x][letterIndexes[i].y],
            {
                isStart: false,
                direction: direction,
                scale: scale
            },
            getHighlightColor()
        )
    }

    setLetterHighlight(
        letterGrid[letterIndexes[letterIndexes.length - 1].x][letterIndexes[letterIndexes.length - 1].y],
        {
            isStart: true,
            direction: direction+180,
            scale: scale
        },
        getHighlightColor()
    )

    if(USE_LETTER_ANIMATION)
    {
        for (let i = 0; i < letterIndexes.length; i++) {
            startLetterAnim(letterIndexes[i].x, letterIndexes[i].y)
        }
    }

}


export function net_sendStringLetterValue()
{
    let stringLetterValue = ""
    for (let i = 0; i < GRID_SIZE.x; i++) {
        for (let j = 0; j < GRID_SIZE.y; j++) {
            stringLetterValue += E_Letter[letterValue[i][j]]
        }
    }
    
    NetLetterDataComponent.getMutable(net_syncDataEntity).net_letterValue = stringLetterValue
}

export function net_updateLetterValueFromString()
{
    
    if(NetLetterDataComponent.get(net_syncDataEntity).net_letterValue == net_previousLetterValue) return;
    
    let netStringValue = NetLetterDataComponent.get(net_syncDataEntity).net_letterValue
    net_previousLetterValue = netStringValue

    try {
        for (let i = 0; i < GRID_SIZE.x; i++) {
            for (let j = 0; j < GRID_SIZE.y; j++) {
                setLetterByIndex(i, j, Object.values(E_Letter).indexOf(netStringValue.charAt(i*GRID_SIZE.y+j)))
            }
        }
    } catch (error) {
        console.error(error)
    }
}