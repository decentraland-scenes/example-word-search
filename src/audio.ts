import { AudioSource, engine, Entity, Transform } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";
import { SCENE_CENTER } from "./game/game.data";
import { pitchShift } from "./utils";

export class AudioPlayer {

    private readonly POP: string = "sounds/pop.mp3"
    private readonly CLEAR: string = "sounds/clear_line.mp3"
    private readonly CLICK: string = "mini-game-assets/sounds/button_click.mp3"
    private readonly FAIL: string = "mini-game-assets/sounds/wrong.mp3"
    private readonly GAME_OVER: string = "sounds/gameOver.mp3"

    private readonly MUSIC: string = "sounds/music.mp3"

    private musicEntity:Entity

    private soundBox:Entity
    private multiSound:Entity[]
    private currentId:number = 0
    private pitches = [-2, 2, 5, 7, 6]

    private sfxOn = true
    private musicOn = true

    private static _instance: AudioPlayer 
    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    private constructor(){
        this.musicEntity = engine.addEntity()
        Transform.create(this.musicEntity, {
            position: Vector3.Zero(),
            parent: engine.CameraEntity
        })

        AudioSource.createOrReplace(this.musicEntity, {
            audioClipUrl: this.MUSIC,
            global:true,
            loop:true,
            playing:false,
            volume:0.2
        })

        this.multiSound = []
        this.soundBox = engine.addEntity()
        Transform.create(this.soundBox, {
            position: Vector3.create(SCENE_CENTER.x, SCENE_CENTER.y + 2, SCENE_CENTER.z)
        })
       // MeshRenderer.setBox(this.soundBox)

       for(let i=0; i<4; i++){
        let sound = engine.addEntity()
        Transform.create(sound, {
            position: Vector3.create(SCENE_CENTER.x, SCENE_CENTER.y + 2, SCENE_CENTER.z)
        })

        this.multiSound.push(sound)
       }
    }

    playMusic(){
        if(this.musicOn == false) return
        if(!AudioSource.get(this.musicEntity).playing){
            AudioSource.getMutable(this.musicEntity).playing = true
        }
       
    }
    stopMusic(){
        if(AudioSource.get(this.musicEntity).playing){
            AudioSource.getMutable(this.musicEntity).playing = false
        }
        
    }

    toggleMusic(){

        if(AudioSource.get(this.musicEntity).playing){
            this.setMusicOn(false)
            this.stopMusic()
        }
        else{
            this.setMusicOn(true)
            this.playMusic()
        }
    }
    setMusicOn(on: boolean) {
        this.musicOn = on
    }
    setSfxOn(on: boolean) {
        this.sfxOn = on
    }
    toggleSFX()
    {
        this.sfxOn = !this.sfxOn
    }

    playPop() {    
        this.playMultiSound(this.POP, true, 0.7)
    }
    playClick() {    
        this.playMultiSound(this.CLICK, true)
    }
    playClear() {    
        this.playMultiSound(this.CLEAR, true)
    }
    playFail() {    
        this.playMultiSound(this.FAIL, true, 0.6)
    }
    playGameOver() {    
        this.playMultiSound(this.GAME_OVER, false)
    }

    playSound(soundUrl:string, volume: number = 1){
        if(this.sfxOn == false) return;

        AudioSource.createOrReplace(this.soundBox,{
            audioClipUrl: soundUrl,
            loop: false,
            volume: volume,
            playing: true
        })
    }

    playMultiSound(soundUrl:string, pitchVariable:boolean, volume: number = 1){
        if(this.sfxOn == false) return;

        AudioSource.createOrReplace(this.multiSound[this.currentId],{
            audioClipUrl: soundUrl,
            loop: false,
            playing: true,
            volume: volume,
            pitch: (pitchVariable)? pitchShift(1, this.pitches[Math.floor((Math.random()*3))] ) : 1.01,
        })
        this.currentId +=1
        if(this.currentId >= this.multiSound.length){
            this.currentId = 0
        }
    }
}   
