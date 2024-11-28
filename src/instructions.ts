import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { sceneParentEntity } from "./modules/config"
import { InstructionsBoard } from "./modules/ui"

//INSTRUCTIONS
export function addInstructions(){
     let instructions = new InstructionsBoard({
        position: Vector3.create(7.05, 3.55, 6.9),
        rotation: Quaternion.fromEulerDegrees(0,90,0),
        scale: Vector3.create(0.8,0.8,0.8),
        parent: sceneParentEntity
    },
    3.4,
    2.8,
    "images/instructions_WordSearch.png"
    )  
}
