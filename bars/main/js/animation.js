/***************
*   Canvas setup
***************/
let canvas = document.getElementById("animation");
let ctx = canvas.getContext("2d");
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.width  = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

/************************
*   Constructor functions
************************/
// Constructor for a point, along with a function to create a random point
const Point = function(x, y) {
    this.x = x;
    this.y = y;
    this.createRandom = function() {
        this.x = randomX();
        this.y = randomY();
        return this;
    }
    this.joined = [];
}

/*******************
*   Number functions
*******************/
// Random number from min (default 0) to max
function randomNumber(max, min) {
    min = min == undefined ? 0 : min;
    return Math.round(Math.random() * (max - min) + min);
}
// Generates a random number within the canvas y-axis
function randomY() {
    return randomNumber(canvas.height);
}
// Generates a random number within the canvas x-axis
function randomX() {
    return randomNumber(canvas.width);
}

/******************
*   Point functions
******************/
// Generates a certain amount of points
function generatePoints() {
    for (i=0; i<pointCount; i++) {
        points.push(new Point().createRandom());
    }
}

// Picks an amount of points
function pickPoints(amount) {
    let newPoints = [];
    for (j=0; j<amount; j++) {
        newPoints.push(randomNumber(points.length - 1));
    }
    return newPoints;
}

// Makes random joins between points
function generateJoins() {
    for (i in points) {
        let numJoins = randomNumber(maxJoins, minJoins);
        points[i].joined = pickPoints(numJoins);
    }
}

// Generates a point for a point to travel to
function generateGoal(pointId) {
    let goal = new Point().createRandom();
    let stayCount = randomNumber(maxStayCount, minStayCount);
    points[pointId].goal = goal;
    points[pointId].stayCount = stayCount;
}

// Generates a point for the points to travel to
function generateGoals() {
    for (pointId in points) {
        generateGoal(pointId);
    }
}

// Moves a point
function movePoint(pointId) {
    let moveX, moveY;

    if (points[pointId].x - points[pointId].goal.x > 0) {
        moveX = -1;
    } else if (points[pointId].x - points[pointId].goal.x < 0) {
        moveX = 1;
    } else {
        moveX = 0;
        points[pointId].stayCount -= 1;
        if (points[pointId].stayCount == 0) {
            generateGoal(pointId);
        }
    }

    if (points[pointId].y - points[pointId].goal.y > 0) {
        moveY = -1;
    } else if (points[pointId].y - points[pointId].goal.y < 0) {
        moveY = 1;
    } else {
        moveY = 0;
        points[pointId].stayCount -= 1;
        if (points[pointId].stayCount == 0) {
            generateGoal(pointId);
        }
    }

    points[pointId].x += moveX;
    points[pointId].y += moveY;
}

// Moves all the points
function movePoints() {
    for (pointId in points) {
        movePoint(pointId);
    }
    drawJoins();
    window.requestAnimationFrame(movePoints);
}

/*******************
*   Canvas functions
*******************/
// Draws a line between two points
function drawLine(start, end) {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = strokeColor;
    ctx.stroke();
}

// Clears the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draws a line between all the points
function drawJoins() {
    clearCanvas();
    for (point of points) {
        for (joinId of point.joined) {
            drawLine(point, points[joinId]);
        }
    }
}

/**********
*   Globals
**********/
let points = [];
const pointCount = 20;
const minJoins = 3;
const maxJoins = 10;
const minStayCount = 100;
const maxStayCount = 1000;

/*******
*   Code
*******/
generatePoints();
generateJoins();
generateGoals();
drawJoins();
window.requestAnimationFrame(movePoints);
