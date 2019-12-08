
// ToDo not nice global scope arrays walls use in maze and cell
wallsHor = []
wallsVer = []

const Direction = {"top": 0, "right": 1, "bottom": 2, "left": 3}

Maze = function(nRows, nCols, v) {
    this.cells = []
    this.allCells = []
    this.nRows = nRows
    this.nCols = nCols
    for (var i = 0; i < nRows; i++) {
        this.cells[i] = []
        for (var j = 0; j < nCols; j++) {
            var cell = new Cell(i, j)
            this.cells[i][j] = cell
            this.allCells.push(cell)
        }
    }
 
    
    // initialize walls array
    for (var i = 0; i <= nRows; i++) {
        wallsHor[i] = []
        wallsVer[i] = []
        for (var j = 0; j <= nCols; j++) {
            wallsHor[i][j] = 1
            wallsVer[i][j] = 1
       }
    }
    wallsHor[0][0] = 0
    wallsVer[nRows-1][nCols] = 0
    console.log(wallsVer)
    this.buildMaze = function () {
        this.visitCell(0, 0)
    }
 
    this.stroke = function() {
        // ToDo allCells list not needed do nested foreach
        this.allCells.forEach((cell) => {cell.stroke()})
    }

    this.visitCell = function(i, j) {
        console.log('visit ' + i + ' ' + j)
        this.cells[i][j].visit()
        let directionsToVisit = this.directionsToVisitInRandomOrder(i, j)
        directionsToVisit.forEach(dir => {
            let neighbourCell = this.neighbour(i, j, dir)
            if (!neighbourCell.visited) {
                this.removeWallToNeighbour(i, j, dir)
                this.visitCell(neighbourCell.i, neighbourCell.j)
            }
        })
    }

    this.removeWallToNeighbour = function (i, j, dir) {
        switch (dir) {
            case Direction.top:
                wallsHor[i][j] = 0
                break
            case Direction.bottom:
                wallsHor[i+1][j] = 0
                break
            case Direction.left:
                wallsVer[i][j] = 0
                break
            case Direction.right:
                wallsVer[i][j+1] = 0
                break
        }
    }


    this.neighbour = function(i, j, dir) {
        switch(dir) {
            case Direction.top:
                return this.cells[i-1][j]
            case Direction.bottom:
                return this.cells[i+1][j]
            case Direction.left:
                return this.cells[i][j-1]
            case Direction.right:
                return this.cells[i][j+1]
        }
    }

    this.directionsToVisitInRandomOrder = function (i, j) {

        let directions = []
        if (j > 0) {
            directions.push(Direction.left)
        }
        if (j < this.nCols - 1) {
            directions.push(Direction.right)
        }
        if (i > 0) {
            directions.push(Direction.top)
        }
        if (i < nRows - 1) {
            directions.push(Direction.bottom)
        }

        console.log('directions:' + directions)
        // shuffle Fisher Yates
        let nDirs = directions.length
        for (let i = 0; i < nDirs -1; i++) {
            let k = Math.floor(Math.random() * (nDirs-i))
            let tmp = directions[k]
            directions[k] = directions[i]
            directions[i] = tmp
 
        }
        console.log('directions to visit for ' + i + ',' + j +':' +directions)
        return directions
    }
    
}


Cell = function(i, j) {
    this.i = i
    this.j = j
    this.visited = false
    
    this.stroke = function() {
        // Todo move translate into class maze
        console.log("stroke " + this.i + " " + this.j + ' visited: ' + this.visited)
        ctx.save()
        ctx.translate(padding + this.j * cellWidth, padding + this. i * cellHeight)

        let i = this.i
        let j = this.j
        ctx.beginPath()
        ctx.moveTo(0, 0)
        if (wallsHor[i][j] == 1) {
            ctx.lineTo(cellWidth, 0)
        } else {
            ctx.moveTo(cellWidth, 0)
        }
        if (wallsVer[i][j+1] == 1) {
            ctx.lineTo(cellWidth, cellHeight)
        } else {    
            ctx.moveTo(cellWidth, cellHeight)            
        }
        if (wallsHor[i+1][j] == 1) {
            ctx.lineTo(0, cellHeight)
        } else {
            ctx.moveTo(0, cellHeight)
        }
        if (wallsVer[i][j] == 1) {
            ctx.lineTo(0 , 0)
        } else {
            ctx.moveTo(0, 0)
        }
        ctx.stroke()

        //ctx.strokeRect(0, 0, cellWidth, cellHeight)
        ctx.restore()
    } 
    this.visit = function() {
        this.visited = true
    }
}

const padding = 15
const nRows = 7
const nCols = 10
var ctx, w, h, cellWidth, cellHeight

const drawGrid = function(canvas) {
    
    ctx = canvas.getContext("2d")
    
    w = ctx.canvas.width
    h = ctx.canvas.height
    cellWidth = (w - 2 * padding) / nCols
    cellHeight = (h - 2* padding) / nRows
    
    
    console.log(`width: ${w} height: ${h}`)
    var maze = new Maze(nRows, nCols, 0)
    console.log(maze)
    maze.buildMaze()
    maze.stroke()
}

$(document).ready(function () {
    console.log('document ready')
    canvas = $("#canvas")[0]
    // console.dir(canvas)


    drawGrid(canvas);
})