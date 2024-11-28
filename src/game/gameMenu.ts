import * as ui from "../modules/ui"
import { uiAssets } from "../modules/ui"
import { Animator, ColliderLayer, engine, Entity, GltfContainer, Material, MeshRenderer, Transform, VisibilityComponent } from "@dcl/sdk/ecs"
import { Vector3, Quaternion, Color4 } from "@dcl/sdk/math"
import { addDebugPivot } from "../debug"
import { exitGame, outOfTime, startNewGame, startNextGame } from "./game"
import { AudioPlayer } from "../audio"
import { BOARD, getGameTime, getLevel, getReachedLevel, isPlaying, MAX_GAME_TIME, setLevel } from "./game.data"
import * as utils from "@dcl-sdk/utils"
import { sceneParentEntity } from "../modules/config"


export class GameMenu {

    private playButton: ui.MenuButton
    private exitButton: ui.MenuButton
    private levelButtons: ui.MenuButton[] = []
    private selectedGlows: Entity[] = []
    private scoreCounter: ui.Counter3D
    private countdown: ui.Timer3D
    private gameOver: Entity
    private levelButtonPressed = false
    private exitButtonPressed = false

    private static _instance: GameMenu 
    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }
    private constructor(){
        const menuRow1Height = -2.0
        const buttonScale:number = 2.1
        const levelButtonScale:number = 1.8
        const buttonSpacing:number = 0.35
        const levelButtonSpacing:number = 0.55

        //PLAY BUTTON
        const startGameButton = this.playButton = new ui.MenuButton(
            {
                position: Vector3.create(0, 1, 2.1),
                rotation: Quaternion.fromEulerDegrees(-33,180,0),
                scale: Vector3.create(1.3, 1.3, 1.3),
                parent: sceneParentEntity
            },
        
            uiAssets.shapes.RECT_RED,
            uiAssets.icons.playText,        
            "PLAY/SIGN UP",
            ()=>{        
                if(isPlaying()) return;

                AudioPlayer.Instance.playClick()
                startNewGame()
            }
        )

        const menuRoot = engine.addEntity()
        Transform.create(menuRoot, {
            position: Vector3.create(3.4,5.5,-6.60),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale: Vector3.create(1,1,1),
            parent: sceneParentEntity
        })
        const menuCenterRoot = engine.addEntity()
        Transform.create(menuCenterRoot, {
            position: Vector3.create(0, 8.0, -6.6),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale: Vector3.create(1,1,1),
            parent: sceneParentEntity
        })
        //addDebugPivot(menuCenterRoot)
        //addDebugPivot(menuRoot)

        //EXIT BUTTON
        this.exitButton = new ui.MenuButton({
            position: Vector3.create(0,menuRow1Height-0.72,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(2.6, 2.6, 2.6),
            parent: menuRoot
        },
        
        uiAssets.shapes.RECT_RED, 
        uiAssets.icons.exitText,        
        "EXIT GAME",
        ()=>{            
            if(isPlaying() == false) return
            exitGame()   
            this.exitButton.disable()
            utils.timers.setTimeout(()=>{
                this.exitButtonPressed = false
            }, 5000)

        })
        this.exitButton.disable()

        //SOUND BUTTON
        const soundsButton = new ui.MenuButton(
            {
                position: Vector3.create(buttonSpacing,menuRow1Height,0),
                rotation: Quaternion.fromEulerDegrees(-90,0,0),
                scale: Vector3.create(buttonScale, buttonScale, buttonScale),
                parent: menuRoot
            },
        
            uiAssets.shapes.SQUARE_RED,
            uiAssets.icons.sound,        
            "TOGGLE SOUNDS",
            ()=>{           
                AudioPlayer.Instance.toggleSFX()  
            }
        )

        //MUSIC BUTTON
        const musicButton = new ui.MenuButton(
            {
                position: Vector3.create(-buttonSpacing,menuRow1Height,0),
                rotation: Quaternion.fromEulerDegrees(-90,0,0),
                scale: Vector3.create(buttonScale, buttonScale, buttonScale),
                parent: menuRoot
            },
        
            uiAssets.shapes.SQUARE_RED,
            uiAssets.icons.music,        
            "TOGGLE MUSIC",
            ()=>{
                AudioPlayer.Instance.toggleMusic()
            }
        )  

        //LEVEL BUTTONS
        
        for(let i=0; i < 5; i++){
            let levelButton =  new ui.MenuButton({
                position: Vector3.create(0, -1.2 + levelButtonSpacing*i, 0),
                rotation: Quaternion.fromEulerDegrees(-90,0,0),
                scale: Vector3.create(levelButtonScale, levelButtonScale, levelButtonScale),
                parent: menuRoot
            },
            uiAssets.shapes.SQUARE_GREEN,
            uiAssets.numbers[i+1],
            ("LEVEL " + (i+1)),
            ()=>{          
                if(this.levelButtonPressed) return
                this.levelButtonPressed = true
                levelButton.disable()
                setLevel(i)
                startNextGame()
                utils.timers.setTimeout(()=>{
                    levelButton.enable()
                    this.levelButtonPressed = false
                }, 1000)
            })  
            if(i != 0){
                levelButton.disable()
            }      
            this.levelButtons.push(levelButton)

            this.selectedGlows[i] = engine.addEntity()
            Transform.createOrReplace(this.selectedGlows[i], {
                rotation: Quaternion.fromEulerDegrees(90, 0, 0),
                position: Vector3.create(0, 0.03, 0),
                scale: levelButton.buttonShapeEnabled.isRect ? Vector3.create(0.45, 0.2, 0.22) : Vector3.create(0.24, 0.24, 0.24),
                parent: levelButton.staticFrame
            })
            MeshRenderer.create(this.selectedGlows[i], {...MeshRenderer.get(levelButton.glowPlane)})
            Material.setPbrMaterial(this.selectedGlows[i], {
                albedoColor: Color4.Red(),
                emissiveColor: Color4.Red(),
                emissiveIntensity: 2
            })
            VisibilityComponent.create(this.selectedGlows[i], { visible: false })
        }      

        this.updateLevel(getLevel())

        // LEVEL LABEL
        const levelLabel = new ui.MenuLabel(
            {
                position: Vector3.create(0, 1.6,-0.05),
                rotation: Quaternion.fromEulerDegrees(-90,0,0),
                scale: Vector3.create(5,5,5),
                parent: menuRoot
            }, 
            
            uiAssets.icons.levelText
        )

        // SCORE COUNTER
        this.scoreCounter = new ui.Counter3D(
            {
                position: Vector3.create(2.0,0,0),
                rotation: Quaternion.fromEulerDegrees(0,180,0),
                scale: Vector3.create(0.38,0.38, 0.38),
                parent: menuCenterRoot
            },
            5,
            1.1,
            true, 
            2
        )

        this.scoreCounter.show()
        this.scoreCounter.setNumber(0)

        //COUNTDOWN
        this.countdown = new ui.Timer3D(
            {
                parent:menuCenterRoot,
                position: Vector3.create(-0.5, 0, 0),
                rotation: Quaternion.fromEulerDegrees(0,180,0),
                scale:Vector3.create(0.38,0.38, 0.38)
            },
            4,
            1.1,
            true,
            3        
        )

        this.countdown.show()
        this.countdown.setTimeSeconds(MAX_GAME_TIME/1000)

        //GAMEOVER
        this.gameOver = engine.addEntity()
        Transform.create(this.gameOver, {
            parent: BOARD,
            position: Vector3.create(0,0,0),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale: Vector3.One()
        })
        GltfContainer.create(this.gameOver, {
            src: "models/gameOverAnimText.glb",
            invisibleMeshesCollisionMask: ColliderLayer.CL_NONE,
            visibleMeshesCollisionMask: ColliderLayer.CL_NONE
        })
        Animator.create(this.gameOver, {
            states: [{
                clip: "Animation",
                playing: false,
                loop: false,
                shouldReset: true
            }]
        })
        Animator.stopAllAnimations(this.gameOver)
        VisibilityComponent.create(this.gameOver,{visible: false})
    }

    disableButtonLevels()
    {
        for (let i = 0; i < this.levelButtons.length; i++) {
            this.levelButtons[i].disable()
        }
    }

    updateButtonLevels()
    {
        for (let i = 0; i < this.levelButtons.length; i++) {
            if(getReachedLevel() >= i) this.levelButtons[i].enable()
            else this.levelButtons[i].disable()
        }
    }
    updateScore(score: number)
    {
        this.scoreCounter.setNumber(score)
    }
    updateLevel(level: number) 
    {
        for (let i = 0; i < this.levelButtons.length; i++) {
            if(level == i) {
                VisibilityComponent.getMutable(this.selectedGlows[i]).visible = true
                this.levelButtons[i].iconGlowMat.albedoColor = Color4.Red()
                this.levelButtons[i].iconGlowMat.emissiveColor = Color4.Red()
                this.levelButtons[i].iconGlowMat.emissiveIntensity = 2
                Material.setPbrMaterial(this.levelButtons[i].icon, this.levelButtons[i].iconGlowMat)
            }
            else if(VisibilityComponent.get(this.selectedGlows[i]).visible){
                VisibilityComponent.getMutable(this.selectedGlows[i]).visible = false
                this.levelButtons[i].iconGlowMat.albedoColor = Color4.White()
                this.levelButtons[i].iconGlowMat.emissiveColor = Color4.White()
                this.levelButtons[i].iconGlowMat.emissiveIntensity = 0.8
                Material.setPbrMaterial(this.levelButtons[i].icon, this.levelButtons[i].iconGlowMat)
            }
        }
    }

    startCountdownSystem()
    {
        let updateCounter = 0
        engine.addSystem(
            (dt: number) => {
                updateCounter+=dt
                if(updateCounter > 0.5)
                {
                    updateCounter = 0
                    if((MAX_GAME_TIME - getGameTime()) <= 0)
                    {
                        this.countdown.setTimeSeconds(0)
                        outOfTime()
                        this.stopCountdownSystem()
                        return;
                    }
                    this.countdown.setTimeSeconds((MAX_GAME_TIME - getGameTime())/1000)
                }
            },
            1,
            "UpdateCountdownSystem"
        )
    }
    resetCountdown()
    {
        this.countdown.setTimeSeconds(MAX_GAME_TIME)
        this.stopCountdownSystem()
    }
    stopCountdownSystem()
    {
        engine.removeSystem("UpdateCountdownSystem")
    }
    enableExitButton()
    {
        this.exitButton.enable()
    }
    disableExitButton()
    {
        this.exitButton.disable()
    }

    showGameOver() {
        VisibilityComponent.getMutable(this.gameOver).visible = true
        Animator.playSingleAnimation(this.gameOver, "Animation", true)
    }
    hideGameOver() {
        Animator.stopAllAnimations(this.gameOver)
        VisibilityComponent.getMutable(this.gameOver).visible = false
    }
}


