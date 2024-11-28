
export const SRC_WORDS_ATLAS = 'models/AtlasWordSearch.png'
export const ATLAS_COLUMNS = 8
export const ATLAS_ROWS = 8


export function getWordsAtlasUVs(row:number, startBlock:number, width:number = 1):number[]{
    let blockSize = 1/ATLAS_COLUMNS

   return [
       startBlock * blockSize, 1 - (blockSize  * (row +1)),
       startBlock * blockSize, 1 - (blockSize  * (row)),
       (startBlock + width) * blockSize, 1 - (blockSize  * (row)),
       (startBlock + width) * blockSize,1 - (blockSize  * (row +1)),                
       
       startBlock * blockSize, 1 - (blockSize  * (row +1)),
       startBlock * blockSize, 1 - (blockSize  * (row)),
       (startBlock + width) * blockSize, 1 - (blockSize  * (row)),
       (startBlock + width) * blockSize,1 - (blockSize  * (row +1)),      
   ]

}
