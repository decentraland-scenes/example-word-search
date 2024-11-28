import { engine, Entity, ISchema, MapResult, Schemas, Transform, Vector3Type } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math";
import { EasingType, interpolateWithEasing } from "./easingFunctions";

export const TranslationComponent = engine.defineComponent("translationComponent", {
    start: Schemas.Vector3,
    end: Schemas.Vector3,
    fraction: Schemas.Number,
    duration: Schemas.Number,
    interpolation: Schemas.EnumNumber<EasingType>(EasingType, EasingType.LINEAR)
})
export const ScalingComponent = engine.defineComponent("scalingComponent", {
    start: Schemas.Vector3,
    end: Schemas.Vector3,
    fraction: Schemas.Number,
    duration: Schemas.Number,
    interpolation: Schemas.EnumNumber<EasingType>(EasingType, EasingType.LINEAR)
})

type LerpTweenType = MapResult<{
    start: ISchema<Vector3Type>;
    end: ISchema<Vector3Type>;
    fraction: ISchema<number>;
    duration: ISchema<number>;
    interpolation: ISchema<EasingType>;
}>

type OnFinishCallback = () => void
type FinishCallbackMap = Map<Entity, OnFinishCallback | undefined>

export let positionTweenCallbacks: FinishCallbackMap = new Map()
let scalingTweenCallbacks: FinishCallbackMap = new Map()

export const tweenUtils = {
    startTranslation(entity: Entity, startPos: Vector3, endPos: Vector3, duration: number,  easingType:EasingType, cb ?: OnFinishCallback){
        TranslationComponent.createOrReplace(entity, {
            start: startPos,
            end: endPos,
            fraction: 0,
            duration: duration,
            interpolation: easingType
        })
        positionTweenCallbacks.set(entity, cb)
    },
    stopTranslation(entity: Entity, executeCb: boolean = false){
        TranslationComponent.deleteFrom(entity)
        if(executeCb){
            const callback = positionTweenCallbacks.get(entity)
            positionTweenCallbacks.delete(entity)
            if(callback) callback()
        }
    else{
        positionTweenCallbacks.delete(entity)
    }
    },
    startScaling(entity: Entity, startPos: Vector3, endPos: Vector3, duration: number, easingType:EasingType, cb ?: OnFinishCallback){
        ScalingComponent.createOrReplace(entity, {
            start: startPos,
            end: endPos,
            fraction: 0,
            duration: duration,
            interpolation: easingType
        })
        scalingTweenCallbacks.set(entity, cb)
    },
    stopScaling(entity: Entity, executeCb: boolean = false){
        ScalingComponent.deleteFrom(entity)
        if(executeCb){
            const callback = scalingTweenCallbacks.get(entity)
            scalingTweenCallbacks.delete(entity)
            if(callback) callback()
        }
        else{
            scalingTweenCallbacks.delete(entity)
        }
    }
}

function makePositionTweenSystem(callbacks: FinishCallbackMap){
    return function system(dt: number){
        for (const [entity] of engine.getEntitiesWith(TranslationComponent)) {
            // do something on each entity
            updatePositionTween(entity, TranslationComponent.getMutable(entity), callbacks, dt)
            
        }
    }
}
function updatePositionTween(entity: Entity, lerp: LerpTweenType, callbacks: FinishCallbackMap, dt: number) {

    if (lerp.fraction < 1) {
        lerp.fraction += dt * 1 / lerp.duration
        if(lerp.fraction >= 1) lerp.fraction = 1
        // let lerpTime = -(Math.cos(Math.PI * lerp.fraction) - 1) / 2
        //let lerpTime = lerp.fraction
        Transform.getMutable(entity).position = Vector3.lerp(lerp.start, lerp.end, interpolateWithEasing(lerp.fraction, lerp.interpolation))
    }
    else {
        TranslationComponent.deleteFrom(entity)
        const callback = callbacks.get(entity)
        callbacks.delete(entity)
        if(callback) callback()
    }
}
function makeScalingTweenSystem(callbacks: FinishCallbackMap){
    return function system(dt: number){
        for (const [entity] of engine.getEntitiesWith(ScalingComponent)) {
            // do something on each entity
            updateScaleTween(entity, ScalingComponent.getMutable(entity), callbacks, dt)       
        }
    }
}

function updateScaleTween(entity: Entity, lerp: LerpTweenType, callbacks: FinishCallbackMap, dt: number) {
    if (lerp.fraction < 1) {
        lerp.fraction += dt * 1 / lerp.duration
        if(lerp.fraction > 1) lerp.fraction = 1                   
        Transform.getMutable(entity).scale = Vector3.lerp(lerp.start, lerp.end, interpolateWithEasing(lerp.fraction, lerp.interpolation) )
    }
    else{
        ScalingComponent.deleteFrom(entity)
        const callback = callbacks.get(entity)
        callbacks.delete(entity)
        if(callback) callback()
    }
}

export function startTweenSystem(){
    engine.addSystem(makePositionTweenSystem(positionTweenCallbacks))
    engine.addSystem(makeScalingTweenSystem(scalingTweenCallbacks))
}