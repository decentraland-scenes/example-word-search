import { engine, Entity, Schemas, TextAlignMode, TextShape, Transform } from "@dcl/sdk/ecs";
import { BOARD, getHighlightColor, getHighlihtColor4, getStartWords, setHighlightColor } from "./game.data";
import { Color4, Vector3 } from "@dcl/sdk/math";
import { getMaxPossibleWords } from "./wordsearchTemplates";

const WORD_TABLE = engine.addEntity()
var wordEntities: Entity[] = []

const NetWordDataComponent = engine.defineComponent(
    "NetWordDataComponent",
    { 
        net_wordValue: Schemas.String,
        net_marked: Schemas.Number
    }
)
const net_syncDataEntity: Entity[] = []
const net_previousWordValue: string[] = []
const net_previousMarkedValue: number[] = []

export function setupWordTable()
{

    Transform.create(WORD_TABLE, {
        parent: BOARD,
        position: Vector3.create(-2.6, 2, -0.2)
    })
    
    setupWordEntities()
    //addDebugPivot(WORD_TABLE)
    
}

function setupWordEntities() {
    for (let i = 0; i < getMaxPossibleWords(); i++) {
        createWordEntity(i)
    }
}

function createWordEntity(index: number) {
    wordEntities[index] = engine.addEntity();
    Transform.create(wordEntities[index], {
        parent: WORD_TABLE,
        position: Vector3.create(0, -index * 0.2, 0),
        scale: Vector3.create(-1, 1, 1)
    })
    TextShape.create(wordEntities[index], {
        textColor: Color4.Black(),
        textAlign: TextAlignMode.TAM_TOP_LEFT,
        fontSize: 2,
        outlineColor: Color4.Black(),
        outlineWidth: 0.2,
        text: "",
    })

}

export function generateWordTable()
{
    clearWords()
    for (let i = 0; i < getStartWords().length; i++) {
        setWord(getStartWords()[i], i)
    }

}   

function setWord(newWord: string, index: number, bFromNetUpdate = false)
{
    TextShape.getMutable(wordEntities[index]).text = newWord
    net_previousWordValue[index] = newWord
    net_previousMarkedValue[index] = -1

}

export function clearWords()
{
    for (let i = 0; i < wordEntities.length; i++) {
        TextShape.getMutable(wordEntities[i]).text = ""
    }
}

export function markCorrectWord(index: number, bFromNetUpdate = false)
{
    if(bFromNetUpdate) {
        setHighlightColor(NetWordDataComponent.get(net_syncDataEntity[index]).net_marked)
    }
    net_previousMarkedValue[index] = getHighlightColor()
    const text = TextShape.getMutable(wordEntities[index])
    text.text = "<mark="+Color4.toHexString(getHighlihtColor4())+"><s>"+text.text+"</s></mark>"

}
