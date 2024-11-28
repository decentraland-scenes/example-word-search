import { Entity, Transform } from "@dcl/sdk/ecs";
import { Color4, Vector3 } from "@dcl/sdk/math";

/**
 * Returns the normaliced direction vector from point1 to point2
 * @param point1 - the first point position
 * @param point2 - the second point position
 * @returns normaliced direction vector
 */
export function directionVectorBetweenTwoPoints(point1: Vector3, point2: Vector3): Vector3 {
  return Vector3.normalize({x: point2.x - point1.x, y: point2.y - point1.y, z: point2.z - point1.z});
}

export function radToDeg(rad: number): number
{
  return rad * (180/Math.PI)
}

export function getRandomHexColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function randomIntFromInterval(min: number, max: number): number { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomColor4(bRandomAlpha: boolean = false) {
  return Color4.create(Math.random(), Math.random(), Math.random(), bRandomAlpha ? Math.random() : 1)
}

export function randomArrayElement<T>(array: Array<T>): T {
  return array[randomIntFromInterval(0, array.length-1)]
}

export function randomEnum<T extends object>(anEnum: T): T[keyof T] {
  const enumValues = Object.keys(anEnum)
    .map(n => Number.parseInt(n))
    .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
  return enumValues[Math.floor(Math.random() * enumValues.length)];
}

/**
 * Returns the array with its elements randomly shuffled
 * @param array - array to shuffle
 * @returns shuffled array
 */
export function shuffle<T>(array: Array<T>): T[] {
  let currentIndex = array.length, randomIndex: number;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function pitchShift(currentPitch:number, shift:number):number{
  return  (Math.pow( 2.0, (shift / 12.0 )) * currentPitch)
}

/**
 * Gets the world position of an entity
 * @param entity
 * @returns a vector3 world position
 */
export function getWorldPosition(entity: Entity, position = Vector3.Zero()) {

  const transform = Transform.get(entity)
  //No transform
  if (!transform) return Vector3.Zero()

  let scaledPosition = {...transform.position}
  //Scale relative position by parent scale
  if (transform.parent) {
      const parentTransform = Transform.get(transform.parent)
      if(parentTransform) {
          scaledPosition.x = scaledPosition.x * parentTransform.scale.x
          scaledPosition.y = scaledPosition.y * parentTransform.scale.y
          scaledPosition.z = scaledPosition.z * parentTransform.scale.z
      }
  }
  //Update position
  position.x = position.x + scaledPosition.x
  position.y = position.y + scaledPosition.y
  position.z = position.z + scaledPosition.z

  //No more parents
  if (!transform.parent) return position;

  //Get world position of the parent
  return getWorldPosition(transform.parent, position)
}

export function equalNumber(n1: number, n2: number, error: number = 0): boolean
{
  return Math.abs(n1-n2) <= error 
}