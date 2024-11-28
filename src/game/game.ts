import { Transform } from "@dcl/sdk/ecs";
import { addScoreGameComplete, BOARD, createExitPoint, createPlayPoint, getGameTime, getLevel, getScore, GRID_SIZE, nextHighlightColor, nextLevel, resetScore, setHighlightColor, setIsPlaying, setLevel, setStartWords, startGameTime } from "./game.data";
import { Vector3 } from "@dcl/sdk/math";
import { highlightGridWord, net_sendStringLetterValue, setLetterByIndex, setupGrid } from "./letterGrid";
import Creator from "../wordsearch-ts-library/src";
import { randomColor4, randomEnum, shuffle } from "../utils";
import { clearWords, generateWordTable, markCorrectWord, setupWordTable } from "./wordTable";
import { E_Letter, HighlightColor, LetterIndex } from "./game.schema";
import { clearAllHighlights } from "./letterHighlight";
import { setupControlls, startControlls, stopControlls } from "./controlls/controlls";
import { GameMenu } from "./gameMenu";
import * as utils from "@dcl-sdk/utils"
import { blockCamera, blockScene, freeCamera, initCamera as initVirtualCamera, lockPlayer, unlockPlayer } from "./lockPlayer";
import { getRandomTemplate, WordSearchTemplate } from "./wordsearchTemplates";
import { AudioPlayer } from "../audio";
import { startTweenSystem } from "../utils/tweens/positionTween";
import { sceneParentEntity } from "../modules/config";

var creator: Creator

export function initGame()
{
    blockScene()
    setupBoard()
    setupWordTable()
    setupControlls()
    GameMenu.Instance.disableButtonLevels()
    createExitPoint()
    createPlayPoint()
    initVirtualCamera()
    startTweenSystem()

}

//Start the game for a new player
export function startNewGame()
{

    setIsPlaying(true)
    resetScore()
    AudioPlayer.Instance.playMusic()
    GameMenu.Instance.resetCountdown()
    GameMenu.Instance.updateButtonLevels()
    GameMenu.Instance.hideGameOver()

    clearAllHighlights()
    setHighlightColor(randomEnum(HighlightColor))
    generateBoard()
    generateWordTable()

    utils.timers.setTimeout(() => {
      
        lockPlayer()
        blockCamera()
        startControlls()
        startGameTime()
        GameMenu.Instance.startCountdownSystem()
        GameMenu.Instance.enableExitButton()
       
    }, 1000)

    //debug_revealWords()
}

//Start next game for same player
export function startNextGame()
{
    setIsPlaying(true)
    setHighlightColor(randomEnum(HighlightColor))
    stopControlls()
    
    utils.timers.setTimeout(() => {
        clearAllHighlights()
        generateBoard()
        generateWordTable()
        startControlls()
       
    }, 1000)
}

//Player has completed a game, save score
export function completeGame()
{
    stopControlls()
    addScoreGameComplete()

    nextLevel()
    GameMenu.Instance.updateButtonLevels()
    startNextGame()
    for (let i = 0; i < 4; i++) {
        utils.timers.setTimeout(() => {
            AudioPlayer.Instance.playClear()
        }, 200*i) 
    }
}

export function outOfTime()
{
    /*for (let i = 0; i < 2; i++) {
        utils.timers.setTimeout(() => {
            AudioPlayer.Instance.playFail()
        }, 300*i) 
    }*/
    
    exitGame(true)
}

//Exit the game for the player, save score and enter next player
export function exitGame(isGameOver: boolean = false)
{
    setIsPlaying(false)
    if(isGameOver) {
        AudioPlayer.Instance.playGameOver()
        GameMenu.Instance.showGameOver()
    }
    GameMenu.Instance.disableExitButton()
    stopControlls()
    clearAllHighlights()
    clearWords()
    GameMenu.Instance.stopCountdownSystem()
    GameMenu.Instance.disableButtonLevels()
    utils.timers.setTimeout(() => {
        unlockPlayer()
        freeCamera()

    }, (isGameOver)? 5000 : 1000)

}


function setupBoard()
{
    Transform.create(BOARD, {
        parent: sceneParentEntity,
        position: Vector3.create(0, 4.8, -6.3),
        scale: Vector3.create(1, 1, 1)
    })
    
    setupGrid();

    //startNewGame()
}

function generateBoard()
{
 
    creator = generateCreator(getRandomTemplate(getLevel()))

    setStartWords(creator.getWords()) 
    type E_LetterKey = keyof typeof E_Letter; 
    const lettersGrid: E_LetterKey[][] = creator.getLettersGrid() as E_LetterKey[][]

    for (let i = 0; i < lettersGrid.length; i++) {
        for (let j = 0; j < lettersGrid[i].length; j++) {
            setLetterByIndex(j,i, E_Letter[lettersGrid[i][j]])
        }    
    }

}

function generateCreator(template: WordSearchTemplate): Creator
{ 
    try {
        //Shuffle words array and limit to maxWords
        shuffle(template.words)
        if(template.words.length > template.maxWords) {
            template.words = template.words.slice(0, template.maxWords)
        }

        return new Creator({
            words: template.words, // list of words to be found
            width: GRID_SIZE.x, // the number of columns in the grid
            height: GRID_SIZE.y, // the number of rows in the grid
            directions: {
                active: template.active,
                inactive: template.inactive
            }
        });
    } 
    //If the creator library fails, try again with one word less
    catch (error) {
        if(template.maxWords <= 0) throw error
        template.maxWords = template.maxWords - 1;
        return generateCreator(template)
    }
    
}

function debug_revealWords()
{ 
 
    for (let i = 0; i < creator.words.length; i++) {
        const color = randomColor4()
        const word = creator.wordsCoords[i]
        const wordIndexes: LetterIndex[] = []
             
        let x = word.start.x;
        let y = word.start.y
        for (let j = 0; j < word.length; j++) {
            
            //debug_revealLetter(x, y, color)
            wordIndexes.push({x, y})
            
            if(word.direction.isUp()) y++;
            if(word.direction.isDown()) y--;
            if(word.direction.isLeft()) x--;
            if(word.direction.isRight()) x++;
        }

        markCorrectWord(i)
        highlightGridWord(wordIndexes)
        nextHighlightColor()
    }
}