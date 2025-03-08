"use strict";
    let canvas;
    let context;

    window.onload = init;

    let treeHeight = 0;
    let treeWidth = 0;

    function init() {
        canvas = document.getElementById('canvas');
        context = canvas.getContext('2d');
        document.addEventListener("keydown", keyPressed);
        let left = document.getElementById('left');
        left.addEventListener('click', goLeft);
        let right = document.getElementById('right');
        right.addEventListener('click', goRight);
        let up = document.getElementById('up');
        up.addEventListener('click', goUp);
        let down = document.getElementById('down');
        down.addEventListener('click', goDown);
        setupElements();

        // Start the first frame request
        window.requestAnimationFrame(gameLoop);
    }

    function setupElements() {
        let tree = document.getElementById("tree");
        treeHeight = tree.height;
        treeWidth = tree.width;
        if (canvas.clientHeight / canvas.clientWidth < tree.height / tree.width) {
            // we are limited by the height
            treeHeight = Math.min(treeHeight, canvas.clientHeight);
            treeWidth = treeHeight / tree.height * tree.width;
        } else {
            // we are limited by the width
            treeWidth = Math.min(treeWidth, canvas.clientWidth);
            treeHeight = treeWidth / tree.width * tree.height;
        }

        Array.from(document.getElementsByClassName("world")).forEach(element => {
            let left = getComputedStyle(element, null).getPropertyValue("--left") / tree.width * treeWidth; 
            let top = getComputedStyle(element, null).getPropertyValue("--top") / tree.height * treeHeight;
            let scale = treeHeight / tree.height;
            element.style.transformOrigin = "top left"
            element.style.transform = "translateX(" + left + "px) translateY(" + top + "px) scale(" + scale + ")";
        });
    }

    let secondsPassed = 0;
    let oldTimeStamp = 0;

    let mirror = false;
    let verticalDirection = 0;
    let horizontalDirection = 0;
    let spriteX = 700;// 300;
    let spriteY = 351; //30;

    function setVerticalDirection(newVerticalDirection) {
        if (verticalDirection == newVerticalDirection) {
            verticalDirection = 0;
        } else {
            verticalDirection = newVerticalDirection;
        }
        horizontalDirection = 0;
    }

    function setHorizontalDirection(newHorizontalDirection) {
        if (horizontalDirection == newHorizontalDirection) {
            horizontalDirection = 0;
        } else {
            horizontalDirection = newHorizontalDirection;
            mirror = horizontalDirection == 1;
        }
        verticalDirection = 0;
    }

    function goLeft() {
        setHorizontalDirection(-1);
    }

    function goRight() {
        setHorizontalDirection(1);
    }

    function goUp() {
        setVerticalDirection(-1);
    }

    function goDown() {
        setVerticalDirection(1);
    }

    function keyPressed(event) {
        if (event.keyCode == 37 /* LEFT */) {
            goLeft();
        } else if (event.keyCode == 38 /* UP */) {
            goUp()
        } else if (event.keyCode == 39 /* RIGHT */) {
            goRight();
        } else if (event.keyCode == 40 /* DOWN */) {
            goDown();
        }
    }

    function gameLoop(timeStamp) {
        // Calculate how much time has passed
        secondsPassed = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;

        // Move forward in time with a maximum amount
        secondsPassed = Math.min(secondsPassed, 0.1);

        // Pass the time to the update
        update(secondsPassed);
        setupElements();
        
        draw();

        // Keep requesting new frames
        window.requestAnimationFrame(gameLoop);
    }

    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawSprite();
    }

    function drawBackground() {
        let tree = document.getElementById("tree");
        let width = toClientX(tree.width);
        let height = toClientY(tree.height);
        context.drawImage(tree, 0, 0, width, height);
    }

    // The sprite image frame starts from 0
    let spriteFrame = 0;

    function drawSprite() {

        let sprite = document.getElementById(mirror ? "spriteMirrored" : "sprite");

        // Define the number of columns and rows in the sprite
        let numColumns = 8;
        let numRows = 8;
        // Define the size of a frame
        let frameWidth = sprite.width / numColumns;
        let frameHeight = 85; //sprite.height / numRows;

        let currentFrame = Math.round(spriteFrame);

        // Make the frames loop
        let maxFrame = 12; //numColumns * numRows - 1;
        if (currentFrame > maxFrame){
            currentFrame = spriteFrame = 9;
        }

        // Update rows and columns
        let column = mirror ? numColumns - currentFrame % numColumns: currentFrame % numColumns;
        let row = Math.floor(currentFrame / numColumns);

        context.drawImage(sprite,
            column * frameWidth,
            row * frameHeight,
            frameWidth,
            frameHeight,
            toClientX(spriteX), toClientY(spriteY), toClientX(frameWidth), toClientY(frameHeight));
    }

    function toClientX(x) {
        return x / tree.width * treeWidth * canvas.width / canvas.clientWidth;
    }

    function toClientY(y) {
        return y / tree.height * treeHeight * canvas.height / canvas.clientHeight;
    }

    function update(secondsPassed) {
            // Pick a new frame
            spriteFrame += 0.2;

            spriteX = spriteX + (horizontalDirection*2);
            spriteY = spriteY + (verticalDirection*2);

            Array.from(document.getElementsByClassName("world")).forEach(element => {
                let showX1 = getComputedStyle(element, null).getPropertyValue("--show-x1");
                let showX2 = getComputedStyle(element, null).getPropertyValue("--show-x2");
                let showY1 = getComputedStyle(element, null).getPropertyValue("--show-y1");
                let showY2 = getComputedStyle(element, null).getPropertyValue("--show-y2");

                if (spriteY > showY1 && spriteY < showY2 && spriteX > showX1 && spriteX < showX2) {
                    element.style.display = "block";
                } else {
                    element.style.display = "none";
                }
            });

    }