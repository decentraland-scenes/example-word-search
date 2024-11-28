import { engine, Entity, InputAction, inputSystem, PointerEventType } from "@dcl/sdk/ecs"
import { getLetters, getLetterString, highlightGridWord } from "../letterGrid"
import { LetterIndex } from "../game.schema"
import { addScoreWordComplete, getWordIndex, isCorrectWord, isOutOfWords, nextHighlightColor, removeWord } from "../game.data"
import { createSelectMarker, hideSelectMarker, showSelectMarker, updateSelectMarker } from "./selectMarker"
import { createRoundMarker, hideRoundMarker, showRoundMarker, updateRoundMarker } from "./roundMarker"
import { markCorrectWord } from "../wordTable"
import { AudioPlayer } from "../../audio"
import { completeGame } from "../game"

var hoveredLetter: Entity
var hoveredIndex: LetterIndex
var markerActive = false

var selectorActive = false
var selectorActiveTime = 0
var selectedLetter: Entity | null = null
var selectedIndex: LetterIndex | null = null

export function setupControlls()
{
    createRoundMarker()
    createSelectMarker()
}

export function startControlls()
{
    
    engine.addSystem(
        () => {
            
            for (let i = 0; i < getLetters().length; i++) {
                for (let j = 0; j < getLetters()[i].length; j++) {
                    if (
                        inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, getLetters()[i][j]) || 
                        inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN, getLetters()[i][j])
                    ) {
                        
                        selectorActiveTime = Date.now()
                        onPointerDownLetter(getLetters()[i][j], {x: i, y: j})
                    }
                    else if (
                        inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_DOWN) ||
                        inputSystem.isTriggered(InputAction.IA_ACTION_3, PointerEventType.PET_DOWN) ||
                        inputSystem.isTriggered(InputAction.IA_ACTION_4, PointerEventType.PET_DOWN) ||
                        inputSystem.isTriggered(InputAction.IA_ACTION_5, PointerEventType.PET_DOWN) ||
                        inputSystem.isTriggered(InputAction.IA_ACTION_6, PointerEventType.PET_DOWN)
                    ) {
                        if(selectorActive && Date.now() - selectorActiveTime > 500)
                        {
                            
                            stopSelection()
                            startRoundMarker()
                            AudioPlayer.Instance.playPop()
                        }
                    }
                    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_HOVER_ENTER, getLetters()[i][j])) {
                        onEnterHoverLetter(getLetters()[i][j], {x: i, y: j})
                    }
                }
            }
        },
        1,
        "GridControllsSystem"
    )

    startRoundMarker()
    
}


export function stopControlls()
{
    stopRoundMarker()
    stopSelection()
    engine.removeSystem("GridControllsSystem")
}
function startRoundMarker()
{
    markerActive = true
    if(hoveredLetter) updateRoundMarker(hoveredLetter)
    showRoundMarker()
}
function stopRoundMarker()
{
    markerActive = false
    hideRoundMarker()
}



function onPointerDownLetter(entity: Entity, index: LetterIndex)
{
    if(selectorActive)
    {
        checkSelection()
    }
    else
    {
        selectLetter(entity, index)
    }

}
function onEnterHoverLetter(entity: Entity, index: LetterIndex)
{
    hoveredIndex = index
    hoveredLetter = entity;
    if(markerActive) updateRoundMarker(hoveredLetter)
    if(selectorActive && selectedLetter != null) updateSelectMarker(selectedLetter, hoveredLetter)
}

function onExitHoverLetter(entity: Entity, index: LetterIndex)
{

}

function selectLetter(entity: Entity, index: LetterIndex)
{
    
    stopRoundMarker()
    selectedLetter = entity
    selectedIndex = index
    selectorActive = true
    updateSelectMarker(selectedLetter, hoveredLetter)
    showSelectMarker()
    AudioPlayer.Instance.playPop()
}

function stopSelection()
{
    hideSelectMarker()
    selectorActive = false
    selectedLetter = null
    selectedIndex = null
}

function checkSelection()
{

    if(selectedIndex == null) return;
    
    //Invalid selection
    if(
        selectedIndex.x != hoveredIndex.x &&    //Is not horizontal
        selectedIndex.y != hoveredIndex.y &&    //Is not vertical
        Math.abs(selectedIndex.x - hoveredIndex.x) != Math.abs(selectedIndex.y - hoveredIndex.y)    //Is not a regular diagonal
    ) 
    {
        stopSelection()
        startRoundMarker()
        AudioPlayer.Instance.playPop()
        return;
    }

    //Get selected word
    let wordIndexes: LetterIndex[] = []
    let word = ""
    let addX = 0
    let addY = 0
    
    if(selectedIndex.x > hoveredIndex.x) addX = -1
    else if(selectedIndex.x < hoveredIndex.x) addX = 1
    if(selectedIndex.y > hoveredIndex.y) addY = -1
    else if(selectedIndex.y < hoveredIndex.y) addY = 1

    let x = selectedIndex.x; 
    let y = selectedIndex.y;
    for (; x != hoveredIndex.x || y != hoveredIndex.y; x += addX, y += addY) {
        wordIndexes.push({x: x, y: y})
        word += getLetterString(x, y)
    }
    wordIndexes.push({x: hoveredIndex.x, y: hoveredIndex.y})
    word += getLetterString(hoveredIndex.x, hoveredIndex.y)

    
    //Invalid word
    if(isCorrectWord(word) == false)
    {
        stopSelection()
        startRoundMarker()
        AudioPlayer.Instance.playFail()
        return;
    }
    //Valid word

    markCorrectWord(getWordIndex(word))
    highlightGridWord(wordIndexes)
    removeWord(word)
    AudioPlayer.Instance.playClear()
    stopSelection()
    startRoundMarker()
    nextHighlightColor()
    addScoreWordComplete()

    if(isOutOfWords())
    {
        completeGame()
    }
}