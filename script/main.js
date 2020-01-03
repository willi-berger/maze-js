
const padding = 15
var nRows = 70  // 70 mx
var nCols = 100 // 100 max
var nCells = nRows * nCols
var timeStepMs = 100
var ctx, w, h, cellWidth, cellHeight
var timoutId
var maze

// ToDo not nice global scope arrays walls use in maze and cell
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

Maze = function (nRows, nCols) {
    this.cells = []
    this.allCells = []
    this.nRows = nRows
    this.nCols = nCols
    // stack for next cells to visit (dfs)
    this.stack = []
    // current path while walking
    this.path = [] 
    // fork points to return to from a dead end         
    this.forks = []         
    this.wallsHor = []
    this.wallsVer = []
    
    for (var i = 0; i < nRows; i++) {
        this.cells[i] = []
        for (var j = 0; j < nCols; j++) {
            var cell = new Cell(this, i, j)
            this.cells[i][j] = cell
            this.allCells.push(cell)
        }
    }


    // initialize walls array
    for (var i = 0; i <= nRows; i++) {
        this.wallsHor[i] = []
        this.wallsVer[i] = []
        for (var j = 0; j <= nCols; j++) {
            this.wallsHor[i][j] = 1
            this.wallsVer[i][j] = 1
        }
    }
    this.wallsHor[0][0] = 0  // entry
    this.wallsVer[nRows - 1][nCols] = 0  // exit

    console.log(this.wallsVer)
    this.buildMaze = function () {
        this.visitCell(0, 0)
    }

    this.stroke = function () {
        // ToDo allCells list not needed do nested foreach
        this.allCells.forEach((cell) => { cell.stroke() })
    }

    /**
     * visit cells recursive and break walls to build a maze
     */
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
                this.wallsHor[i][j] = 0
                break
            case Direction.bottom:
                this.wallsHor[i + 1][j] = 0
                break
            case Direction.left:
                this.wallsVer[i][j] = 0
                break
            case Direction.right:
                this.wallsVer[i][j + 1] = 0
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
        directions = this.shuffle(directions)
        console.log('directions to visit for ' + i + ',' + j + ':' + directions)
        return directions
    }
    
    this.shuffle = function (arr) {
        // shuffle with Fisher Yates
        let nDirs = arr.length
        for (let i = 0; i < nDirs - 1; i++) {
            let k = Math.floor(Math.random() * (nDirs - i))
            let tmp = arr[k]
            arr[k] = arr[i]
            arr[i] = tmp
        }
        return arr
    }

    this.determineNeighbours = function (cell) {
        let neighbours = []
        let i = cell.i; let j = cell.j
        if (i > 0 && this.wallsHor[i][j] == 0) {
            neighbours.push(Direction.top)
        }
        if (i < nRows - 1 && this.wallsHor[i + 1][j] == 0) {
            neighbours.push(Direction.bottom)
        }
        if (j > 0 && this.wallsVer[i][j] == 0) {
            neighbours.push(Direction.left)
        }
        if (j < nCols - 1 && this.wallsVer[i][j + 1] == 0) {
            neighbours.push(Direction.right)
        }
        // console.log('neighbours of '+i+','+j+': '+neighbours)
        return neighbours
    }


    this.hasUnvisitedNeighbours = function (self, cell) {
        let neighbours = self.determineNeighbours(cell)
        let hasUnvisited = false
        neighbours.forEach(dir => {
            let neighbour = self.neighbour(cell.i, cell.j, dir)
            if (neighbour.visited < 2)
                hasUnvisited = true
        })
        return hasUnvisited
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
            // ToDo check if at exit .
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


    /**
     * dfs iterative initialize
     */
    this.depthFirstSearchIterativeInitialize = function (start) {
        console.log('depthFirstSearchIterativeInitialize(' + start.i + ',' + start.j + ')')
        this.stack.push(start)
        this.forks.push(start)
        this.depthFirstSearchIterativeStep(this)
    }

    this.depthFirstSearchIterativeStep = function (self) {

        if (self.stack.length > 0) {
            let cell = self.stack.pop()
            console.log('depthFirstSearchIterativeStep(' + cell.i + ',' + cell.j + ')', cell)

            self.path.push(cell)
            cell.strokeVistorIsIn()
            cell.visit(2)

            iterations++;
            let neighbours = self.determineNeighbours(cell)

            // check if at exit 
            if (cell.i == nRows-1 && cell.j == nCols-1) {
                console.info("Exit found :)")
                return
            }

            let hasUnvisitedNeighbour = false
            if (neighbours.length > 0) {
                neighbours = self.shuffle(neighbours)
                self.forks.push(cell)
                neighbours.forEach(dir => {
                    let neighbour = self.neighbour(cell.i, cell.j, dir)
                    if (neighbour.visited < 2) {
                        console.log('push cell ' + neighbour.i + ' ' + neighbour.j )
                        self.stack.push(neighbour)
                        hasUnvisitedNeighbour = true
                    }
                })                
            }

            if (!hasUnvisitedNeighbour) {
                setTimeout(self.walkBack, timeStepMs, self)
            } else {
                setTimeout(self.depthFirstSearchIterativeStep, timeStepMs, self)
            }

        } else {
            console.log('stack is empty, dfs iterative done')
        }
    }

    this.walkBack = function (self) {
        let cell = self.path.pop()
        console.log('walkback:', cell)
        if (!self.hasUnvisitedNeighbours(self,cell)) {
            cell.strokeVistorIsIn('red')
            setTimeout(self.walkBack, timeStepMs, self, cell)
        } else {
            self.path.push(cell)
            setTimeout(self.depthFirstSearchIterativeStep, timeStepMs, self)
        }
    }

    this.walk = function () {
        console.log('start walk')
        let start = this.getCell(0, 0)
        //start.strokeVistorIsIn()
        this.depthFirstSearchIterativeInitialize(start)
    }

    this.getCell = function (i, j) {
        return this.cells[i][j]
    }

}


Cell = function (maze, i, j) {
    this.maze
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
        if (maze.wallsHor[i][j] == 1) {
            ctx.lineTo(cellWidth, 0)
        } else {
            ctx.moveTo(cellWidth, 0)
        }
        if (maze.wallsVer[i][j + 1] == 1) {
            ctx.lineTo(cellWidth, cellHeight)
        } else {
            ctx.moveTo(cellWidth, cellHeight)
        }
        if (maze.wallsHor[i + 1][j] == 1) {
            ctx.lineTo(0, cellHeight)
        } else {
            ctx.moveTo(0, cellHeight)
        }
        if (maze.wallsVer[i][j] == 1) {
            ctx.lineTo(0, 0)
        } else {
            ctx.moveTo(0, 0)
        }
        ctx.stroke()
        ctx.restore()
    }


    this.strokeVistorIsIn = function (walkback) {
        this.ctxTranslate()
        let i = this.i
        let j = this.j
        ctx.beginPath()

        if (undefined !== walkback) {
            ctx.fillStyle = `rgb(100, 100, 100)`
        } else {
            let r = Math.floor(255 * (iterations / nCells))
            let g = Math.floor(255 * (iterations / nCells))
            let b = Math.floor(255 * (iterations / nCells))
            ctx.fillStyle = `rgb(255, 0, 0)`
        }
        ctx.arc(cellWidth / 2, cellHeight / 2, Math.min(cellWidth, cellHeight) * 0.5 * 0.6, 0, 2 * Math.PI)
        ctx.fill()
        //ctx.strokeText(iterations, cellWidth/2, cellHeight)
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
    ctx.clearRect(0, 0, w, h)
    maze = new Maze(nRows, nCols, 0)
    console.log(maze)
    // build up maze
    maze.buildMaze()
    maze.stroke()
}

const walkMaze = function () {
    console.log("Start walking maze")
    // walk through maze
    maze.walk()
}

$("#generate-maze").click(function () {
    console.debug("generate-maze:")
    nRows = $("#nrows").val()
    nCols = $("#ncolumns").val()
    timeStepMs = $("#timestep").val()
    drawGrid(canvas)
})

$("#timestep").change(function() {
    timeStepMs = $("#timestep").val()
})

$("#walk-maze").click(function() {
    console.debug("walk-maze")
    walkMaze()
})

$(document).ready(function () {
    console.log('document ready')
    canvas = $("#canvas")[0]


    // We are resizing for mobile devices only. For other devices, the
    // dimensions will be stuck at 800 * 600. To change the default dimensions,
    // change the height and width of the canvas and the width of the #container
    var win = window,
        doc = document,
        w = win.innerWidth,
        h = win.innerHeight,
        container = doc.getElementById('canvascontainer'),
        canvas = doc.getElementById('canvas');
    
    if(win.navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/i) ) {
      canvas.height = h;
      canvas.width  = w;
      container.style.height = h+"px";
      container.style.width = w+"px";
    }
})