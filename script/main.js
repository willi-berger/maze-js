
const padding = 15
const nRows = 10 
const nCols = 15
const nCells = nRows * nCols
const timeStepMs = 100
var ctx, w, h, cellWidth, cellHeight
var timoutId

// ToDo not nice global scope arrays walls use in maze and cell
wallsHor = []
wallsVer = []
var iterations = 0


const sleep = function (millis, i, j) {
    return new Promise((resolve, reject) => {
        console.log('sleep ' + i + ' ' + j + ' ' + millis + ' start')
        setTimeout(() => {
            console.log('sleep ' + i + ' ' + j + ' ' + millis + ' end')
            resolve()
        }, millis)
    })
}

const Direction = { "top": 0, "right": 1, "bottom": 2, "left": 3 }

Maze = function (nRows, nCols, v) {
    this.cells = []
    this.allCells = []
    this.nRows = nRows
    this.nCols = nCols
    this.stack = []
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
    wallsVer[nRows - 1][nCols] = 0
    console.log(wallsVer)
    this.buildMaze = function () {
        this.visitCell(0, 0)
    }

    this.stroke = function () {
        // ToDo allCells list not needed do nested foreach
        this.allCells.forEach((cell) => { cell.stroke() })
    }

    this.visitCell = function (i, j) {
        console.log('visit ' + i + ' ' + j)
        this.cells[i][j].visit(1)
        let directionsToVisit = this.directionsToVisitInRandomOrder(i, j)
        directionsToVisit.forEach(dir => {
            let neighbourCell = this.neighbour(i, j, dir)
            if (neighbourCell.visited == 0) {
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
                wallsHor[i + 1][j] = 0
                break
            case Direction.left:
                wallsVer[i][j] = 0
                break
            case Direction.right:
                wallsVer[i][j + 1] = 0
                break
        }
    }


    this.neighbour = function (i, j, dir) {
        switch (dir) {
            case Direction.top:
                return this.cells[i - 1][j]
            case Direction.bottom:
                return this.cells[i + 1][j]
            case Direction.left:
                return this.cells[i][j - 1]
            case Direction.right:
                return this.cells[i][j + 1]
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
        for (let i = 0; i < nDirs - 1; i++) {
            let k = Math.floor(Math.random() * (nDirs - i))
            let tmp = directions[k]
            directions[k] = directions[i]
            directions[i] = tmp

        }
        console.log('directions to visit for ' + i + ',' + j + ':' + directions)
        return directions
    }

    this.determineNeighbours = function (cell) {
        let neighbours = []
        let i = cell.i; let j = cell.j
        if (i > 0 && wallsHor[i][j] == 0) {
            neighbours.push(Direction.top)
        }
        if (i < nRows - 1 && wallsHor[i + 1][j] == 0) {
            neighbours.push(Direction.bottom)
        }
        if (j > 0 && wallsVer[i][j] == 0) {
            neighbours.push(Direction.left)
        }
        if (j < nCols - 1 && wallsVer[i][j + 1] == 0) {
            neighbours.push(Direction.right)
        }
        // console.log('neighbours of '+i+','+j+': '+neighbours)
        return neighbours
    }


   
    /**
     * depth first search recursive with sleep
     */
    this.depthFirstSearch = function (cell) {  // isn't this breadth first search ??
        console.log('depthFirstSearch(' + cell.i + ',' + cell.j + ')')
        sleep(timeStepMs, cell.i, cell.j).then(res => {
            cell.strokeVistorIsIn()
            cell.visit(2)
            iterations++;


            var neighbours = this.determineNeighbours(cell)

            // ToDo check if at exit ..

            if (neighbours.length > 0) {

                neighbours.forEach(dir => {
                    let neighbour = this.neighbour(cell.i, cell.j, dir)
                    if (neighbour.visited < 2) {
                        this.depthFirstSearch(neighbour)
                    }
                })
            } else {
                return cell
            }
        })
    }


    this.depthFirstSearchIterative = function (start) {
        console.log('depthFirstSearchIterative(' + start.i + ',' + start.j + ')')
        this.stack.push(start)
        this.depthFirstSearchIterativeStep(this)

    }

    this.depthFirstSearchIterativeStep = function (self) {

        if (self.stack.length > 0) {
            let cell = self.stack.pop()
            console.log('depthFirstSearchIterativeStep(' + cell.i + ',' + cell.j + ')')

            cell.strokeVistorIsIn()
            cell.visit(2)
            iterations++;
            let neighbours = self.determineNeighbours(cell)

            // ToDo check if at exit ..

            if (neighbours.length > 0) {
                neighbours.forEach(dir => {
                    let neighbour = self.neighbour(cell.i, cell.j, dir)
                    if (neighbour.visited < 2) {
                        console.log('push cell ' + neighbour.i + ' ' + neighbour.j )
                        self.stack.push(neighbour)
                    }
                })
            }

            setTimeout(self.depthFirstSearchIterativeStep, timeStepMs, self)
        } else {
            console.log('dfs iterative done')
        }
    }


    this.walk = function () {
        console.log('start walk')
        let start = this.getCell(0, 0)
        //start.strokeVistorIsIn()
        this.depthFirstSearchIterative(start)
    }

    this.getCell = function (i, j) {
        return this.cells[i][j]
    }

}


Cell = function (i, j) {
    this.i = i
    this.j = j
    this.visited = 0

    this.stroke = function () {
        // Todo move translate into class maze
        console.log("stroke " + this.i + " " + this.j + ' visited: ' + this.visited)

        this.ctxTranslate()
        let i = this.i
        let j = this.j
        ctx.beginPath()
        ctx.moveTo(0, 0)
        if (wallsHor[i][j] == 1) {
            ctx.lineTo(cellWidth, 0)
        } else {
            ctx.moveTo(cellWidth, 0)
        }
        if (wallsVer[i][j + 1] == 1) {
            ctx.lineTo(cellWidth, cellHeight)
        } else {
            ctx.moveTo(cellWidth, cellHeight)
        }
        if (wallsHor[i + 1][j] == 1) {
            ctx.lineTo(0, cellHeight)
        } else {
            ctx.moveTo(0, cellHeight)
        }
        if (wallsVer[i][j] == 1) {
            ctx.lineTo(0, 0)
        } else {
            ctx.moveTo(0, 0)
        }
        ctx.stroke()

        ctx.restore()
    }


    this.strokeVistorIsIn = function () {
        this.ctxTranslate()
        let i = this.i
        let j = this.j
        ctx.beginPath()

        let r = Math.floor(255 * (iterations / nCells))
        let g = Math.floor(255 * (iterations / nCells))
        let b = Math.floor(255 * (iterations / nCells))

        ctx.fillStyle = `rgb(255, 255, ${b})`
        ctx.arc(cellWidth / 2, cellHeight / 2, Math.min(cellWidth, cellHeight) * 0.5 * 0.9, 0, 2 * Math.PI)
        ctx.fill()
        ctx.strokeText(iterations, cellWidth/2, cellHeight)
        ctx.strokeText
        ctx.restore()
    }

    this.ctxTranslate = function () {
        ctx.save()
        ctx.translate(padding + this.j * cellWidth, padding + this.i * cellHeight)
    }

    this.visit = function (val) {
        this.visited = val
    }
}

const drawGrid = function (canvas) {

    ctx = canvas.getContext("2d")

    w = ctx.canvas.width
    h = ctx.canvas.height
    cellWidth = (w - 2 * padding) / nCols
    cellHeight = (h - 2 * padding) / nRows


    console.log(`width: ${w} height: ${h}`)
    var maze = new Maze(nRows, nCols, 0)
    console.log(maze)
    // build up maze
    maze.buildMaze()
    maze.stroke()

    // walk through maze
    maze.walk()
}

$(document).ready(function () {
    console.log('document ready')
    canvas = $("#canvas")[0]
    // console.dir(canvas)


    drawGrid(canvas);
})