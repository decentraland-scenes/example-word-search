import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { initEnvironment } from "./environment";
import { exitGame, initGame, startNewGame } from "./game/game";
import { addInstructions } from "./instructions";
import { initParentEntity } from "./modules/config";

export function main() {

    initParentEntity({
        position: Vector3.create(8,0,8),
        rotation: Quaternion.fromEulerDegrees(0,0,0)
    })

    initEnvironment()
    addInstructions()
    initGame()

}