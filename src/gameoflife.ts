const gridSize = 40
const hiddenBorder = 5

let customGrid = true

import { gridCustom } from './customGrid'

export let fullRenderSize = gridSize
let fullGridSize = gridSize + hiddenBorder*2;

let grid = new Array(fullGridSize).fill(null).map(() => new Array(fullGridSize).fill(0));

if(customGrid) {
    grid = gridCustom
} else {
    for (let i = 0; i < fullGridSize; i++) {
        for (let j = 0; j < fullGridSize; j++) {
            grid[i][j] = Math.random() > 0.5 ? 1 : 0; // 50% de chance d'être vivante
        }
    }
}



function updateGrid() {
    let newGrid = new Array(fullGridSize).fill(null).map(() => new Array(fullGridSize).fill(0));
    for (let i = 0; i < fullGridSize; i++) {
        for (let j = 0; j < fullGridSize; j++) {
            let neighbors = countNeighbors(i, j);
            if (grid[i][j]) { // Cellule vivante
                if (neighbors < 2 || neighbors > 3) {
                    newGrid[i][j] = 0; // Sous-population ou surpopulation, la cellule meurt
                } else {
                    newGrid[i][j] = 1; // La cellule survit
                }
            } else { // Cellule morte
                if (neighbors === 3) {
                    newGrid[i][j] = 1; // Reproduction, la cellule devient vivante
                }
            }
        }
    }
    grid = newGrid;
}

function countNeighbors(row: number, col: number) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            let newRow = row + i;
            let newCol = col + j;
            if (newRow >= 0 && newRow < fullGridSize && newCol >= 0 && newCol < fullGridSize) {
                count += grid[newRow][newCol];
            }
        }
    }
    return count;
}

export function getGrid() {
    let newGrid = grid;
    newGrid = grid.map(function(val) {
        return val.slice(hiddenBorder, -hiddenBorder);
    }).slice(hiddenBorder, -hiddenBorder);
      
    updateGrid()

    return newGrid;
}

/*

si une cellule a exactement trois voisines vivantes, elle est vivante à l’étape suivante.
C’est le cas de la cellule verte dans la configuration de gauche ;

si une cellule a exactement deux voisines vivantes, elle reste dans son état actuel à l’étape suivante.
Dans le cas de la configuration de gauche, la cellule située entre les deux cellules vivantes reste morte à l’étape suivante ;

si une cellule a strictement moins de deux ou strictement plus de trois voisines vivantes, elle est morte à l’étape suivante.
C’est le cas de la cellule rouge dans la configuration de gauche.

*/