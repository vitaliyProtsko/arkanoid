var cvs = document.getElementById('arkanoid')
var context = cvs.getContext('2d')

cvs.style.border = '1px solid #0ff'

context.lineWidth = 3

var paddleWidth = 100
var paddleHeight = 20
var paddleMarginBottom = 50
var ballRadius = 8
var life = 3
var score = 0
var scoreUnit = 10
var level = 1
var maxLevel = 3
var gameover = false
var leftArrow = false
var rightArrow = false

var paddle = {
    x: cvs.width / 2 - paddleWidth / 2,
    y: cvs.height - paddleMarginBottom - paddleHeight,
    width: paddleWidth,
    height: paddleHeight,
    dx: 5
}

function drawPaddle() {
    context.fillStyle = 'blue'
    context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)

    context.strokeStyle = '#fff'
    context.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height)
}

document.addEventListener('keydown', function (event) {
    if (event.keyCode == 37) {
        leftArrow = true
    } else if (event.keyCode == 39) {
        rightArrow = true
    }
})

document.addEventListener('keyup', function (event) {
    if (event.keyCode == 37) {
        leftArrow = false
    } else if (event.keyCode == 39) {
        rightArrow = false
    }
})

function movePaddle() {
    if (rightArrow && paddle.x + paddle.width < cvs.width) {
        paddle.x += paddle.dx
    } else if (leftArrow && paddle.x > 0) {
        paddle.x -= paddle.dx
    }
}

var ball = {
    x: cvs.width / 2,
    y: paddle.y - ballRadius,
    radius: ballRadius,
    speed: 4,
    dx: 3 * (Math.random() * 2 - 1),
    dy: -3
}

function drawBall() {
    context.beginPath()
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    context.fillStyle = '#ff0000'
    context.fill()
    context.closePath()
}

function moveBall() {
    ball.x += ball.dx
    ball.y += ball.dy
}

function ballWallCollision() {
    if (ball.x + ballRadius > cvs.width || ball.x - ballRadius < 0) {
        ball.dx = -ball.dx
        wallHit.play()
    }

    if (ball.y - ballRadius < 0) {
        ball.dy = -ball.dy
        wallHit.play()
    }

    if (ball.y + ballRadius > cvs.height) {
        life--
        lifeLost.play()
        resetBall()
    }
}

function resetBall() {
    ball.x = cvs.width / 2
    ball.y = paddle.y - ballRadius
    ball.dx = 3 * (Math.random() * 2 - 1)
    ball.dy = -3
}

function ballPaddleCollision() {
    if (ball.x < paddle.x + paddle.width &&
        ball.x > paddle.x &&
        paddle.y < paddle.y + paddle.height &&
        ball.y > paddle.y) {

        paddleHit.play()

        var collidePoint = ball.x - (paddle.x + paddle.width / 2)
        collidePoint = collidePoint / (paddle.width / 2)

        var angle = collidePoint * Math.PI / 3

        ball.dx = ball.speed * Math.sin(angle)
        ball.dy = -ball.speed * Math.cos(angle)
    }
}

var brick = {
    row: 3,
    column: 5,
    width: 55,
    height: 20,
    offsetLeft: 20,
    offsetTop: 20,
    marginTop: 40,
    fillColor: 'blue',
    strokeColor: '#fff'
}

var bricks = []

function createBricks() {
    for (var r = 0; r < brick.row; r++) {
        bricks[r] = []
        for (var c = 0; c < brick.column; c++) {
            bricks[r][c] = {
                x: c * (brick.offsetLeft + brick.width) + brick.offsetLeft,
                y: r * (brick.offsetTop + brick.height) + brick.offsetTop + brick.marginTop,
                status: true
            }
        }
    }
}

createBricks()

function drawBricks() {
    for (var r = 0; r < brick.row; r++) {
        for (var c = 0; c < brick.column; c++) {
            var b = bricks[r][c]
            if (b.status) {
                context.fillStyle = brick.fillColor
                context.fillRect(b.x, b.y, brick.width, brick.height)
                context.strokeStyle = brick.strokeColor
                context.strokeRect(b.x, b.y, brick.width, brick.height)
            }
        }
    }
}

function ballBrickCollision() {
    for (var r = 0; r < brick.row; r++) {
        for (var c = 0; c < brick.column; c++) {
            var b = bricks[r][c]
            if (b.status) {
                if (ball.x + ballRadius > b.x &&
                    ball.x - ballRadius < b.x + brick.width &&
                    ball.y + ballRadius > b.y &&
                    ball.y - ball.radius < b.y + brick.height) {
                    brickHit.play()
                    ball.dy = -ball.dy
                    b.status = false
                    score += scoreUnit
                }
            }
        }
    }
}

function showGameStats(text, textX, textY, img, imgX, imgY) {
    context.fillStyle = '#fff'
    context.font = '25px Germania One'
    context.fillText(text, textX, textY)

    context.drawImage(img, imgX, imgY, width = 25, height = 25)
}

function draw() {
    drawPaddle()
    drawBall()
    drawBricks()
    showGameStats(score, 35, 25, scoreImg, 5, 5)
    showGameStats(life, cvs.width - 25, 25, lifeImg, cvs.width - 55, 5)
    showGameStats(level, cvs.width / 2, 25, levelImg, cvs.width / 2 - 30, 5)
}

function gameOver() {
    if (life <= 0) {
        showYouLose()
        gameover = true
    }
}

function levelUp() {
    var isLevelDone = true

    for (var r = 0; r < brick.row; r++) {
        for (var c = 0; c < brick.column; c++) {
            isLevelDone = isLevelDone && !bricks[r][c].status
        }
    }

    if (isLevelDone) {
        win.play()
        if (level >= maxLevel) {
            showYouWin()
            gameover = true
            return
        }
        brick.row++
        createBricks()
        ball.speed += 0.5
        resetBall()
        level++
    }
}

function update() {
    movePaddle()
    moveBall()
    ballWallCollision()
    ballPaddleCollision()
    ballBrickCollision()
    gameOver()
    levelUp()
}

function loop() {
    context.drawImage(bgImg, 0, 0)

    draw()
    update()

    if (!gameover) {
        requestAnimationFrame(loop)
    }
}

loop()

var soundElement = document.getElementById('sound')
soundElement.addEventListener('click', audioManager)

function audioManager() {
    var imgSrc = soundElement.getAttribute('src')
    var soundImg = imgSrc == 'img/SOUND_ON.png' ? 'img/SOUND_OFF.png' : 'img/SOUND_ON.png'
    soundElement.setAttribute('src', soundImg)

    wallHit.muted = wallHit.muted ? false : true
    paddleHit.muted = paddleHit.muted ? false : true
    brickHit.muted = brickHit.muted ? false : true
    win.muted = win.muted ? false : true
    lifeLost.muted = lifeLost.muted ? false : true
}

var gameIsOver = document.getElementById('gameover')
var youwin = document.getElementById('youwin')
var youlose = document.getElementById('youlose')
var restart = document.getElementById('restart')

restart.addEventListener('click', function () {
    location.reload()
})

function showYouWin() {
    gameIsOver.style.display = 'block'
    youwon.style.display = 'block'
}

function showYouLose() {
    gameIsOver.style.display = 'block'
    youlose.style.display = 'block'
}