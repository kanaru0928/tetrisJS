"use strict"

var canvas;
var ctx;
const BLOCK_SIZE = 22;
//  I, O, S, Z, T, J, L, field, none
const COLOR = ["#00bfff", "#ffd700", "#32cd32", "#dc143c", "#9932cc", "#0000cd", "#ff8c00", "#c0c0c0", "#303030"];
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
        ctx.fillStyle = COLOR[this.color];
        ctx.fillRect(this.x * (BLOCK_SIZE + 1) + FIELD_OFFSET_X, this.y * (BLOCK_SIZE + 1) + FIELD_OFFSET_Y, BLOCK_SIZE, BLOCK_SIZE);
    }
}

class Mino {
    constructor(x, y, rot, shape) {
        this.x = x;
        this.y = y;
        this.rot = rot;
        this.shape = shape;
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
        this.tiles[0].fill(7);
        this.tiles[FIELD_HEIGHT + 1].fill(7);
        for (let i = 3; i <= 8; i++) {
            this.tiles[0][i] = 8;
        }
    }

    draw() {
        for (let i = 0; i < FIELD_HEIGHT + 2; i++) {
            for (let j = 0; j < FIELD_WIDTH + 2; j++) {
                new Block(j, i, this.tiles[i][j]).draw();
            }
        }
    }
}

function drawBackground() {
    ctx.fillStyle = "#606060";
    ctx.fillRect(FIELD_OFFSET_X, FIELD_OFFSET_Y, (BLOCK_SIZE + 1) * (FIELD_WIDTH + 2) - 1, (BLOCK_SIZE + 1) * (FIELD_HEIGHT + 2) - 1);
}

function init() {
    drawBackground();
    new Field().draw();
}

function tick() {
    requestAnimationFrame(tick);
}

$(function() {
    canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        ctx = canvas.getContext("2d");
        init();
        tick();
    }
});