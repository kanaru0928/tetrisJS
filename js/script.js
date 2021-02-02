"use strict"

var canvas;
var ctx;
const BLOCK_SIZE = 22;
//  I, O, S, Z, T, J, L, field, none
const COLOR = ["#00bfff", "#ffd700", "#32cd32", "#ff3030", "#ba55d3", "#5050ff", "#ff8c00", "#c0c0c0", "#303030"];
const FIELD_WIDTH = 10;
const FIELD_HEIGHT = 20;
const FIELD_OFFSET_X = 80;
const FIELD_OFFSET_Y = 60;

class Block {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
    draw() {
        if (this.y >= 0) {
            ctx.fillStyle = COLOR[this.color];
            ctx.fillRect(this.x * (BLOCK_SIZE + 1) + FIELD_OFFSET_X, this.y * (BLOCK_SIZE + 1) + FIELD_OFFSET_Y, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
}

class Mino {
    constructor(x, y, rot, shape) {
        this.x = x;
        this.y = y;
        this.rot = rot;
        this.shape = shape;
    }

    calcBlocks() {
        let blocks = [];
        switch (this.shape) {
            case 0: // I
                blocks = [
                    new Block(-2, 0, 0),
                    new Block(-1, 0, 0),
                    new Block(0, 0, 0),
                    new Block(1, 0, 0),
                ];
                break;

            case 1: // O
                blocks = [
                    new Block(0, 0, 1),
                    new Block(-1, 0, 1),
                    new Block(0, -1, 1),
                    new Block(-1, -1, 1),
                ];
                break;

            case 2: // S
                blocks = [
                    new Block(1, -1, 2),
                    new Block(0, -1, 2),
                    new Block(0, 0, 2),
                    new Block(-1, 0, 2),
                ];
                break;

            case 3: // Z
                blocks = [
                    new Block(-1, -1, 3),
                    new Block(0, -1, 3),
                    new Block(0, 0, 3),
                    new Block(1, 0, 3),
                ];
                break;

            case 4: // T
                blocks = [
                    new Block(0, 0, 4),
                    new Block(1, 0, 4),
                    new Block(0, -1, 4),
                    new Block(-1, 0, 4),
                ];
                break;

            case 5: // J
                blocks = [
                    new Block(-1, -1, 5),
                    new Block(-1, 0, 5),
                    new Block(0, 0, 5),
                    new Block(1, 0, 5),
                ];
                break;

            case 6: // L
                blocks = [
                    new Block(1, -1, 6),
                    new Block(1, 0, 6),
                    new Block(0, 0, 6),
                    new Block(-1, 0, 6),
                ];
                break;
        }

        let rot = (40000000 + this.rot) % 4;
        if (this.shape <= 1) {
            blocks.forEach(b => (b.x += .5, b.y += .5));
        }
        for (let i = 0; i < rot; i++) {
            blocks = blocks.map(b => new Block(-b.y, b.x, b.color));
        }
        if (this.shape <= 1) {
            blocks.forEach(b => (b.x -= .5, b.y -= .5));
        }

        blocks.forEach(b => (b.x += this.x, b.y += this.y));
        return blocks;
    }

    draw() {
        let blocks = this.calcBlocks();
        for (let b of blocks) {
            b.draw();
        }
    }

    copy() {
        return new Mino(this.x, this.y, this.rot, this.shape);
    }
}

class Field {
    constructor() {
        this.tiles = new Array(FIELD_HEIGHT + 2);
        for (let i = 0; i < FIELD_HEIGHT + 2; i++) {
            this.tiles[i] = new Array(FIELD_WIDTH + 2).fill(8);
        }
        this.init();
    }

    init() {
        for (let i = 0; i < FIELD_HEIGHT + 2; i++) {
            this.tiles[i][0] = 7;
            this.tiles[i][FIELD_WIDTH + 1] = 7;
        }
        this.tiles[FIELD_HEIGHT + 1].fill(7);
    }

    draw() {
        for (let i = 0; i < FIELD_HEIGHT + 2; i++) {
            for (let j = 0; j < FIELD_WIDTH + 2; j++) {
                new Block(j, i, this.tiles[i][j]).draw();
            }
        }
    }

    putblock(x, y, c) {
        this.tiles[y][x] = c;
    }

    tileAt(x, y) {
        if (x < 0 || x >= FIELD_WIDTH + 2 || y < 0 || y >= FIELD_HEIGHT + 2) return 0;
        return this.tiles[y][x];
    }

    findFilled() {
        let res = new Array();
        for (let i = 0; i < FIELD_HEIGHT + 1; i++) {
            if (this.tiles[i].every(t => t < 8)) {
                res.push(i);
            }
        }
        return res;
    }

    cutLine(r) {
        console.log("cut");
        this.tiles.splice(r, 1);
        let newLine = new Array(FIELD_WIDTH + 2).fill(8);
        newLine[0] = 7;
        newLine[newLine.length - 1] = 7;
        this.tiles.unshift(newLine);
    }
}

class Game {
    constructor() {
        this.frame = 0;
        this.mino = Game.make_mino(Math.floor(Math.random() * 7));
        this.field = new Field();
        this.minoVx = 0;
        this.minoVy = 0;
        this.minoVr = 0;
    }

    static make_mino(shape) {
        return new Mino(6, 0, 0, shape);
    }

    static isField(mino, field) {
        let blocks = mino.calcBlocks();
        return blocks.some(b => field.tileAt(b.x, b.y) < 8);
    }

    loop() {
        // 落下
        let future = this.mino.copy();
        future.y++;
        let isfield = Game.isField(future, this.field);
        if (isfield) {
            // 接地
            if (this.frame % 90 == 0) {
                let blocks = this.mino.calcBlocks();
                blocks.forEach(b => this.field.putblock(b.x, b.y, this.mino.shape));
                this.mino = Game.make_mino(Math.floor(Math.random() * 7));
            }
        } else {
            if (this.frame % (keyDown ? softDropSpeed : dropSpeed) == 0) {
                this.mino.y++;
            }
        }

        // ライン消去
        let rows = this.field.findFilled();
        rows.forEach(r => {
            this.field.cutLine(r);
        });

        // 左右移動
        if (this.frame % 5 === 1 && keyLeft) {
            this.minoVx--;
        }
        if (this.frame % 5 === 1 && keyRight) {
            this.minoVx++;
        }

        if (this.minoVx !== 0) {
            let future = this.mino.copy();
            future.x += this.minoVx;
            if (!Game.isField(future, this.field)) {
                this.mino.x += this.minoVx;
            }
            this.minoVx = 0;
        }

        // 回転
        if (this.minoVr !== 0) {
            let future = this.mino.copy();
            future.rot += this.minoVr;
            if (!Game.isField(future, this.field)) {
                this.mino.rot += this.minoVr;
            }
            this.minoVr = 0;
        }

        this.field.draw();
        this.mino.draw();
        this.frame++;
    }
}

var game;
var keyLeft = false;
var keyRight = false;
var keyDown = false;
var gamestarted = false;
var softDropSpeed = 5;
var dropSpeed = 30;

function getEvent() {
    document.addEventListener("keydown", e => onKeyDown(e));
    document.addEventListener("keyup", e => onKeyUp(e));
}

function onKeyDown(e) {
    if (!gamestarted && e.keyCode == 32) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        gamestarted = true;
        init();
        game = new Game();
        tick();
    }
    switch (e.keyCode) {
        case 37:
            keyLeft = true;
            break;
        case 38:
            break;
        case 39:
            keyRight = true;
            break;
        case 40:
            keyDown = true;
            break;
        case 88:
            game.minoVr++;
            break;
        case 90:
            game.minoVr--;
            break;
    }
}

function onKeyUp(e) {
    switch (e.keyCode) {
        case 37:
            keyLeft = false;
            break;
        case 38:
            break;
        case 39:
            keyRight = false;
            break;
        case 40:
            keyDown = false;
            break;
    }
}

function drawBackground() {
    ctx.fillStyle = "#606060";
    ctx.fillRect(FIELD_OFFSET_X, FIELD_OFFSET_Y, (BLOCK_SIZE + 1) * (FIELD_WIDTH + 2) - 1, (BLOCK_SIZE + 1) * (FIELD_HEIGHT + 2) - 1);
}

function init() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    new Field().draw();
}


function tick() {
    game.loop();
    requestAnimationFrame(tick);
}

$(function() {
    canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        getEvent();
        ctx.font = '20pt Arial';
        ctx.fillStyle = 'rgba(0, 0, 0)';
        ctx.fillText("Press space key to start", 200, 150);

    }
});