/*
========================================
VERSION: 1.0
SYSTEM: MAIN PAGE
AUTHOR: Monal Gupta
DESCRIPTION:
-  main/title page
- Has background + Play game button
========================================
*/

import { CANVAS } from "../config.js";

export function createMainPageSystem() {

    const playButtonWidth = 260;
    const playButtonHeight = 80;
    const playButtonX = CANVAS.WIDTH / 2 - playButtonWidth / 2;
    const playButtonY = CANVAS.HEIGHT * 0.62;

    function isHover(x, y, w, h) {
        return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
    }

    function drawPlayButton() {
        const hover = isHover(playButtonX, playButtonY, playButtonWidth, playButtonHeight);

        noStroke();
        fill(0, 0, 0, 120);
        rect(playButtonX + 3, playButtonY + 4, playButtonWidth, playButtonHeight, 10);

        fill(hover ? color(0, 210, 190) : color(0, 140, 130));
        rect(playButtonX, playButtonY, playButtonWidth, playButtonHeight, 10);

        fill(255, 255, 255, 40);
        rect(playButtonX, playButtonY, playButtonWidth, playButtonHeight * 0.35, 10);

        fill(255);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(32);
        text("PLAY", CANVAS.WIDTH / 2, playButtonY + playButtonHeight / 2);
        textStyle(NORMAL);
    }


    return {

        draw(mainPageBg) {

            if (mainPageBg) {
                image(mainPageBg, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            } else {
                background(10, 15, 40);
            }

            // const hover = isHover(playButtonX, playButtonY, playButtonWidth, playButtonHeight);
            // fill(hover ? color(0, 200, 180) : color(0, 130, 120));
            // rect(playButtonX, playButtonY, playButtonWidth, playButtonHeight, 10);
            // fill(255);
            // textAlign(CENTER, CENTER);
            // textSize(32);
            // text("PLAY", CANVAS.WIDTH / 2, playButtonY + playButtonHeight / 2);

            drawPlayButton();
        },


        checkClick(mX, mY) {
            if (
                mX > playButtonX && mX < playButtonX + playButtonWidth &&
                mY > playButtonY && mY < playButtonY + playButtonHeight
            ) {
                return "PLAY";
            }
            return null;
        },

    };
}