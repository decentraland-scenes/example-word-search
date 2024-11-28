import { engine, Entity, Transform } from "@dcl/sdk/ecs"
import { HighlightColor } from "./game.schema"
import { Color4 } from "@dcl/ecs-math"
import { Vector3 } from "@dcl/sdk/math"
import { getWorldPosition } from "../utils"
import { GameMenu } from "./gameMenu"
import { sceneParentEntity } from "../modules/config"

export const SCENE_CENTER = Vector3.create(8,0,8)

//CONFIG
export const ENABLE_SPECTATOR: boolean = true
export const GRID_SIZE: { readonly x:number, readonly y: number} = {
    x: 12, y: 12
}
export const CELL_SIZE: number = 0.38
export const CELL_PADDING: number = 0
const _1_SEC = 1000
const _1_MIN = _1_SEC * 60
export const MAX_GAME_TIME = 10 * _1_MIN
const PLAY_POINT: Vector3 = Vector3.create(0, 1.4, 0)
const EXIT_POINT: Vector3 = Vector3.create(-2, 0.88, 5.5)
const MAX_LEVEL = 4

//RUNTIME
//Board & game positions
export const X_LENGTH = GRID_SIZE.x*CELL_SIZE + (GRID_SIZE.x-1)*CELL_PADDING 
export const Y_LENGTH = GRID_SIZE.y*CELL_SIZE + (GRID_SIZE.y-1)*CELL_PADDING 

export const BOARD = engine.addEntity()  
export const GRID = engine.addEntity()

var _isPlaying = false
export function setIsPlaying(value: boolean)
{
    _isPlaying = value
}
export function isPlaying()
{
    return _isPlaying
}

//Words
var remainingWords: string[] = []
var startWords: string[] = []
export function setStartWords(newGameWords: string[])
{
    startWords = newGameWords
    remainingWords = newGameWords
}
export function getStartWords(): string[]
{
    return remainingWords
}
export function removeWord(word: string)
{
    var aux: string[] = []
    for (let i = 0; i < remainingWords.length; i++) {
        if(remainingWords[i] != word)
        {
            aux.push(remainingWords[i])
        }
    }
    remainingWords = aux
}
export function isCorrectWord(word: string): boolean
{
    return remainingWords.indexOf(word) != -1
}

export function getWordIndex(word: string): number
{
    return startWords.indexOf(word)
}
export function isOutOfWords()
{
    return remainingWords.length == 0
}

//Highlight Color
var currentColor = HighlightColor.Yellow
export function setHighlightColor(newColor: HighlightColor)
{
    currentColor = newColor
}
export function getHighlightColor()
{
    return currentColor
}

export function nextHighlightColor()
{
    currentColor = (currentColor + 1)%5
}

export function getHighlihtColor4(): Color4
{
    switch (currentColor) {
        case HighlightColor.Yellow:
            return {...Color4.Yellow(), a: 0.4}
        case HighlightColor.Green:
            return {...Color4.Green(), a: 0.4}
        case HighlightColor.Blue:
            return {...Color4.Blue(), a: 0.4}
        case HighlightColor.Orange:
            return Color4.create(1,0.4,0,0.4)
        case HighlightColor.Purple:
            return {...Color4.Purple(), a: 0.4}
        case HighlightColor.Red:
            return {...Color4.Red(), a: 0.4}
        default:
            return {...Color4.Yellow(), a: 0.4}
    }
}

//Player stay points
var playPoint: Entity
var exitPoint: Entity
export function createExitPoint()
{
    exitPoint = engine.addEntity()
    Transform.create(exitPoint, {
        parent: sceneParentEntity,
        position: EXIT_POINT
    })
}
export function getExitPoint()
{
    return getWorldPosition(exitPoint)
}

export function createPlayPoint()
{
    playPoint = engine.addEntity()
    Transform.create(playPoint, {
        parent: sceneParentEntity,
        position: PLAY_POINT
    })
}
export function getPlayPoint()
{
    return getWorldPosition(playPoint)
}
export function getBoardPoint()
{
    return getWorldPosition(BOARD)
}

//Game Level
var currentLevel = 0
var reachedLevel = 0
export function getReachedLevel()
{
    return reachedLevel
}
export function getLevel()
{
    return currentLevel
}
export function setLevel(newLevel: number)
{
    if(currentLevel > MAX_LEVEL) newLevel = MAX_LEVEL
    currentLevel = newLevel

    if(reachedLevel < currentLevel) reachedLevel = currentLevel

    GameMenu.Instance.updateLevel(currentLevel)
}
export function nextLevel()
{
    if(currentLevel < MAX_LEVEL) currentLevel++

    if(reachedLevel < currentLevel) reachedLevel = currentLevel

    GameMenu.Instance.updateLevel(currentLevel)
    
}

//Game Time
var gameTime: number = Date.now()
export function startGameTime()
{
    gameTime = Date.now()
}
export function getGameTime()
{
    return Date.now() - gameTime
}

//Score
var score: number = 0
export function resetScore()
{
    score = 0
    GameMenu.Instance.updateScore(score)
}
export function getScore()
{
    return score
}
export function addScoreGameComplete()
{
    if(currentLevel == 0) {
        score += 100
    }
    else if(currentLevel == 1) {
        score += 200
    }
    else if(currentLevel == 2) {
        score += 300
    }
    else if(currentLevel == 3) {
        score += 400
    }
    else {
        score += 500
    }
    GameMenu.Instance.updateScore(score)
}
export function addScoreWordComplete()
{
    if(currentLevel == 0) {
        score += 10
    }
    else if(currentLevel == 1) {
        score += 10
    }
    else if(currentLevel == 2) {
        score += 10
    }
    else if(currentLevel == 3) {
        score += 20
    }
    else {
        score += 30
    }
    GameMenu.Instance.updateScore(score)
}

