let board, info, bottomRow
const squareSize = 30
const boardColumns = 15
const boardRows = 20

const starting_rows = 4
let rowCount = 4
let counter = 0

const colors = ['green', 'red', 'yellow', 'blue']

let bgMusic, clickingVoice

let addBottomRow
let time, topScore, topScoreElement

let gameSpeed = 200

let minutes = 0
let seconds = 0

let level = 1
let score = 0


$(document).ready(function () {
  // initializing board, the side panel, and the bottom fill row
  board = $('#board')
  bottomRow = $('#bottomRow')
  info = $('.info')
  topScoreElement = $('#topScore')
  // starting the bg music and make to the clicking voice
  bgMusic = $('#backgroundMusic')[0]
  clickingVoice = $('#clickVoice')[0]

  bgMusic.addEventListener('ended', function () {
    bgMusic.currentTime = 0
    bgMusic.play()
  })


  initializeSquares()
  $(window).on('mousedown', startGame)

  // get the highest score from the localstore if exist
  topScore = localStorage.getItem('topScore') === null ? 0 : localStorage.getItem('topScore')
  topScoreElement.text(topScore)
  $('#level').text(1)
});

function startGame() {
  $(window).unbind('mousedown')
  $('#start').remove()
  $('#restart').remove()


  bgMusic.play();
  time = setInterval(timeHandler, 1000);
  addBottomRow = setInterval(addSquare, gameSpeed);
  $(document).on('click', '.square', function () {
    const selectSquares = $(this)
    let removeSquares

    const color = selectSquares.attr('class').split(' ')[1]
    const squaresToDelete = []
    searchSquaresToDelete(selectSquares, color, squaresToDelete)
    if (squaresToDelete.length < 3) return
    squaresToDelete.forEach(square => square.remove())
    removeSquares = squaresToDelete.length
    if (removeSquares) {
      clickingVoice.currentTime = 0
      clickingVoice.play()
      addScore(removeSquares)
    }

    for (let i = 0; i < boardColumns; i++) {
      let holeNum = 0

      for (let j = boardRows - 1; j >= 0; j--) {
        const square = $(`.square[data-x=${i}][data-y=${j}]`)

        if (square.length) {
          if (holeNum > 0) {
            square.attr('data-y', j + holeNum)
            square.animate({top: (j + holeNum) * squareSize}, 150)
          }
        } else {
          holeNum++
        }
      }
    }

    for (i = 0; i < boardColumns; i++) {
      const bottomSquare = $(`.square[data-x=${i}][data-y=${boardRows - 1}]`)

      if (!bottomSquare.length) {
        board.children().each(function () {
          const square = $(this)
          const actualXPlace = parseInt(square.attr('data-x'))
          if (i < boardColumns / 2) {
            if (actualXPlace < i) {
              square.animate({
                left: '+=' + squareSize
              }, 10)
              const actualXPlace = parseInt(square.attr('data-x'))
              square.attr('data-x', actualXPlace + 1)
            } else if (i > boardColumns / 2 && actualXPlace > i) {
              square.animate({
                left: '-=' + squareSize
              }, 20)

              square.attr('data-x', actualXPlace - 1)
            }
          } else if (i > boardColumns / 2 && actualXPlace > i) {
            square.animate({
              left: '-=' + squareSize
            }, 10)
            square.attr('data-x', actualXPlace - 1)
          }
        })
      }
    }
  })
}

function restartGame() {
  clearGame()
  initializeSquares()

  // get the Highest Score
  topScore = localStorage.getItem('topScore')
  topScoreElement.text(topScore)
  startGame()
}

function gameOver() {
  clearInterval(addBottomRow)
  clearInterval(time)
  $(document).unbind('click')
  $('<div id="restart">Oops, game is over. Click to restart!</div>').appendTo(info)

  if (score > topScore) {
    topScore = score
    localStorage.setItem('topScore', topScore)
  }
  bgMusic.pause();
  bgMusic.currentTime = 0;
  $(window).on('mousedown', restartGame)
}

function clearGame() {
  level = 1
  score = 0
  minutes = 0
  seconds = 0
  gameSpeed = 200
  setTime()
  $('#score').text(score)
  $('#level').text(1)
  $('#board').empty()
}

function addScore(deletedSquares) {
  score += deletedSquares
  $('#score').text(score)
}

function setTime() {
  let minute, second
  if (seconds < 10) second = '0' + seconds
  else second = seconds

  if (minutes < 10) minute = '0' + minutes
  else minute = minutes

  let time = minute + ':' + second
  $('#timerDisplay').text(time)
}

function timeHandler() {
  seconds++
  if (seconds === 60) {
    seconds = 0
    minutes++

    // the game is over when minutes reach 60
    if (minutes === 60) {
      gameOver()
    }
  }
  setTime();
}


function searchSquaresToDelete(square, color, squaresToDelete) {
  if (itSquareExist(squaresToDelete, square)) return
  if (!square.hasClass(color)) return

  squaresToDelete.push(square)
  const x_coord = parseInt(square.css('left')) / squareSize
  const y_coord = parseInt(square.css('top')) / squareSize
  const nextToArray = []


  const rightSideSquare = $(`.square[data-x=${x_coord + 1}][data-y=${y_coord}]`)
  if (rightSideSquare.length) {
    if (!nextToArray.includes(rightSideSquare)) {
      nextToArray.push(rightSideSquare)
    }
  }
  const leftSideSquare = $(`.square[data-x=${x_coord - 1}][data-y=${y_coord}]`)
  if (x_coord > 0 && leftSideSquare.length) {
    if (!nextToArray.includes(leftSideSquare)) {
      nextToArray.push(leftSideSquare);
    }
  }
  const topSquare = $(`.square[data-x=${x_coord}][data-y=${y_coord - 1}]`)
  if (y_coord > 0 && topSquare.length) {
    if (!nextToArray.includes(topSquare)) {
      nextToArray.push(topSquare)
    }
  }
  const bottomSquare = $(`.square[data-x=${x_coord}][data-y=${y_coord + 1}]`)
  if (bottomSquare.length) {
    if (!nextToArray.includes(bottomSquare)) {
      nextToArray.push(bottomSquare)
    }
  }
  nextToArray.forEach(nextToSquare => searchSquaresToDelete(nextToSquare, color, squaresToDelete))
}


// When start a game, it creates the 4 rows
function initializeSquares() {
  for (let i = boardRows - 1; i >= boardRows - starting_rows; i--) {
    for (let j = 0; j < boardColumns; j++) {
      const square = createSquare();
      square.css({
        top: i * squareSize,
        left: j * squareSize,
      });
      square.attr('data-x', j);
      square.attr('data-y', i);

      square.appendTo(board);
    }
  }
}

function createSquare() {
  const color = colors[Math.floor(Math.random() * 4)]
  let square = $('<div></div>')
  square.addClass('square')

  square.addClass(color)
  square.css({width: squareSize, height: squareSize});
  return square
}

function itSquareExist(squaresArray, square) {
  const foundIndex = squaresArray.findIndex(element => {
    const isTopEqual = square.css('top') === element.css('top')
    const isLeftEqual = square.css('left') === element.css('left')
    return isTopEqual && isLeftEqual
  })

  return foundIndex !== -1
}

function addSquare() {
  // Find the top row if it exists.
  const topSquare = $(`.square[data-y=${0}]`)
  if (topSquare.length) {
    // If the top row is reached, end the game.
    gameOver()
    return
  }

  // If the square hasn't reached the bottom row yet, add a new square.
  if (counter >= boardColumns) {
    board.children().each(function () {
      const square = $(this)
      const currentY = parseInt(square.attr('data-y'))
      square.css({top: '-=' + squareSize})
      square.attr('data-y', currentY - 1)
    })
    bottomRow.children().each(function (index) {
      const square = $(this)
      const x = index
      const y = boardRows - 1
      square.css({top: y * squareSize, left: x * squareSize})
      square.attr('data-x', x)
      square.attr('data-y', y)
      board.append(square)
    })

    // Increase the game level and set the new speed.
    // gameSpeed -= 1
    gameSpeed -= 2
    // gameSpeed -= 4

    if (gameSpeed % 4 === 0) level++
    // console.log(gameSpeed)
    $('#level').text(level)
    clearInterval(addBottomRow)
    addBottomRow = setInterval(addSquare, gameSpeed)

    // Reset the square counter and increase the row count.
    counter = 0
    rowCount++
  } else {
    const bottomRow = $('#bottomRow')
    const square = createSquare()
    square.css({left: counter * squareSize})
    bottomRow.append(square)
    counter++
  }
}


