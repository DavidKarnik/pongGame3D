/**
 * Pong ThreeJS Game
 * JS Script for Player VS Player
 */

// console.clear();

// Příznak pro sledování stavu kláves
let keyState = {
    ArrowUp: false,
    ArrowDown: false
};

const ballSpeed = 5;
const paddleSpeed = 10;

function startGameFunction(window, document, THREE) {
    // "constants"
    let WIDTH = window.innerWidth - (0.05 * window.innerWidth),
        HEIGHT = window.innerHeight - (0.1 * window.innerHeight),
        VIEW_ANGLE = 45,
        ASPECT = WIDTH / HEIGHT,
        NEAR = 0.1,
        FAR = 10000,
        FIELD_WIDTH = WIDTH / 2,
        FIELD_LENGTH = HEIGHT,
        BALL_RADIUS = 20,
        PADDLE_WIDTH = 200,
        PADDLE_HEIGHT = 30,

        //get the scoreboard element.
        scoreBoard = document.getElementById('scoreBoard'),

        //declare members.
        container, renderer, camera, mainLight,
        scene, ball, paddle1, paddle2, field, running,
        score = {
            player1: 0,
            player2: 0
        };


    function startBallMovement() {
        let direction = Math.random() > 0.5 ? -1 : 1;
        ball.$velocity = {
            x: 0,
            z: direction * ballSpeed
        };
        ball.$stopped = false;
    }

    function processCpuPaddle() {
        let ballPos = ball.position,
            cpuPos = paddle2.position;

        if (cpuPos.x - 100 > ballPos.x) {
            cpuPos.x -= Math.min(cpuPos.x - ballPos.x, 6);
        } else if (cpuPos.x - 100 < ballPos.x) {
            cpuPos.x += Math.min(ballPos.x - cpuPos.x, 6);
        }
    }

    function processBallMovement() {
        if (!ball.$velocity) {
            startBallMovement();
        }

        if (ball.$stopped) {
            return;
        }

        updateBallPosition();

        if (isSideCollision()) {
            ball.$velocity.x *= -1;
        }

        if (isPaddle1Collision()) {
            hitBallBack(paddle1);
        }

        if (isPaddle2Collision()) {
            hitBallBack(paddle2);
        }

        if (isPastPaddle1()) {
            scoreBy('player2');
        }

        if (isPastPaddle2()) {
            scoreBy('player1');
        }
    }

    function isPastPaddle1() {
        return ball.position.z > paddle1.position.z + 100;
    }

    function isPastPaddle2() {
        return ball.position.z < paddle2.position.z - 100;
    }

    function updateBallPosition() {
        let ballPos = ball.position;

        //update the ball's position.
        ballPos.x += ball.$velocity.x;
        ballPos.z += ball.$velocity.z;

        // add an arc to the ball's flight. Comment this out for boring, flat pong.
        ballPos.y = -((ballPos.z - 1) * (ballPos.z - 1) / 5000) + 435;
    }

    function isSideCollision() {
        let ballX = ball.position.x,
            halfFieldWidth = FIELD_WIDTH / 2;
        return ballX - BALL_RADIUS < -halfFieldWidth || ballX + BALL_RADIUS > halfFieldWidth;
    }

    function hitBallBack(paddle) {
        ball.$velocity.x = (ball.position.x - paddle.position.x) / 5;
        ball.$velocity.z *= -1;
    }

    function isPaddle2Collision() {
        return ball.position.z - BALL_RADIUS <= paddle2.position.z &&
            isBallAlignedWithPaddle(paddle2);
    }

    function isPaddle1Collision() {
        return ball.position.z + BALL_RADIUS >= paddle1.position.z &&
            isBallAlignedWithPaddle(paddle1);
    }

    function isBallAlignedWithPaddle(paddle) {
        let halfPaddleWidth = PADDLE_WIDTH / 2,
            paddleX = paddle.position.x,
            ballX = ball.position.x;
        return ballX > paddleX - halfPaddleWidth &&
            ballX < paddleX + halfPaddleWidth;
    }

    function scoreBy(playerName) {
        addPoint(playerName);
        updateScoreBoard();
        stopBall();
        setTimeout(reset, 2000);
    }

    function updateScoreBoard() {
        scoreBoard.innerHTML = 'Player 1: ' + score.player1 + ' Player 2: ' +
            score.player2;
    }

    function stopBall() {
        ball.$stopped = true;
    }

    function addPoint(playerName) {
        score[playerName]++;
        console.log(score);
    }

    function startRender() {
        running = true;
        render();
    }

    function stopRender() {
        running = false;
    }

    function render() {
        if (running) {
            requestAnimationFrame(render);

            processBallMovement();
            processCpuPaddle();

            movePaddle(); // Nová funkce pro pohyb pálky

            renderer.render(scene, camera);
        }
    }

    function reset() {
        ball.position.set(0, 0, 0);
        ball.$velocity = null;
    }

    function onWindowResize() {
        WIDTH = window.innerWidth - (0.05 * window.innerWidth);
        HEIGHT = window.innerHeight - (0.1 * window.innerHeight);

        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();

        renderer.setSize(WIDTH, HEIGHT);
    }

    function init() {
        container = document.getElementById('container');

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(WIDTH, HEIGHT);
        // background color
        renderer.setClearColor(0x848493, 1);
        container.appendChild(renderer.domElement);

        // Změna na ortografickou kameru
        camera = new THREE.OrthographicCamera(
            -FIELD_WIDTH / 2, FIELD_WIDTH / 2,
            HEIGHT / 2, -HEIGHT / 2,
            NEAR, FAR
        );

        // Nastavení pozice kamery nad hracím polem
        camera.position.set(0, FIELD_LENGTH, 0);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        scene = new THREE.Scene();
        scene.add(camera);

        // podložka hry
        let fieldGeometry = new THREE.CubeGeometry(FIELD_WIDTH, 5, FIELD_LENGTH, 1, 1, 1),
            fieldMaterial = new THREE.MeshLambertMaterial({color: 0x003300});
        field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        field.position.set(0, -50, 0);

        scene.add(field);
        paddle1 = addPaddle();
        paddle1.position.z = FIELD_LENGTH / 2;
        paddle2 = addPaddle();
        paddle2.position.z = -FIELD_LENGTH / 2;

        let ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 16, 16),
            ballMaterial = new THREE.MeshLambertMaterial({color: 0xCC0000});
        ball = new THREE.Mesh(ballGeometry, ballMaterial);
        scene.add(ball);

        // camera.lookAt(ball.position);

        mainLight = new THREE.HemisphereLight(0xFFFFFF, 0x003300, 1);
        scene.add(mainLight);

        // camera.lookAt(ball.position);

        updateScoreBoard();
        startRender();


        // Inicializace resize by window resize
        onWindowResize(); // call při startu, aby se nastavila správná velikost
        window.addEventListener('resize', onWindowResize, false);
    }

    function addPaddle() {
        let paddleGeometry = new THREE.CubeGeometry(PADDLE_WIDTH, PADDLE_HEIGHT, 10, 1, 1, 1),
            paddleMaterial = new THREE.MeshLambertMaterial({color: 0xf28179}),
            paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
        scene.add(paddle);
        return paddle;
    }

    function containerMouseMove(e) {
        let mouseX = e.clientX;
        camera.position.x = paddle1.position.x = -((WIDTH - mouseX) / WIDTH * FIELD_WIDTH) + (FIELD_WIDTH / 2);
    }

    init();




// Funkce pro zpracování stisknutí klávesy
    function handleKeyDown(event) {
        if (event.key in keyState) {
            keyState[event.key] = true;
        }

        console.log('Stisknuto: ' + event.key);
    }

// Funkce pro zpracování uvolnění klávesy
    function handleKeyUp(event) {
        if (event.key in keyState) {
            keyState[event.key] = false;
        }
    }

// Funkce pro pohyb pálky
    function movePaddle() {
        if (keyState.ArrowUp) {
            // Pohyb pálky doprava
            paddle1.position.x += paddleSpeed;
        }
        if (keyState.ArrowDown) {
            // Pohyb pálky doleva
            paddle1.position.x -= paddleSpeed;
        }

        // Omezení pohybu pálky uvnitř hracího pole
        const halfPaddleWidth = PADDLE_WIDTH / 2;
        const halfFieldWidth = FIELD_WIDTH / 2;

        paddle1.position.x = Math.min(halfFieldWidth - halfPaddleWidth, Math.max(-halfFieldWidth + halfPaddleWidth, paddle1.position.x));
    }

    // Přidat posluchače událostí pro šipky
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}



// Funkce pro zobrazení hry a skrytí tlačítka "Start"
function showGame() {
    // Skryj tlačítko "Start"
    const startMenu = document.getElementById('mainMenu');
    startMenu.style.display = 'none';

    // Zobraz herní canvas
    const theGame = document.getElementById('game-container');
    theGame.style.display = 'block';

    // start Wave -> Game
    startGameFunction(window, window.document, window.THREE)
}

// Přidejte obsluhu kliknutí na tlačítko "Start"
// const startButton = document.getElementById('startButton');
// startButton.addEventListener('click', showGame);