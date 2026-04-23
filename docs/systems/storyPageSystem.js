/*
======================================
VERSION: 1
SYSTEM: Story Page
AUTHOR: Monal Gupta
DESCRIPTION:
- story screen 
- between main page and controls
=======================================
*/

import { CANVAS } from "../config.js";

export function createStoryPageSystem() {
    const padding = 40;

    const boxWidth = CANVAS.WIDTH * 0.75;
    const boxHeight = CANVAS.HEIGHT * 0.55;

    const boxX = CANVAS.WIDTH / 2 - boxWidth / 2;
    const boxY = CANVAS.HEIGHT / 2 - boxHeight / 2 + 40;

    const btnWidth = 120;
    const btnHeight = 45;
    const btnX = CANVAS.WIDTH / 2 - btnWidth / 2;
    const btnY = CANVAS.HEIGHT - btnHeight - 50;

    const storyText = `
A deep sea expedition takes an unexpected turn when your submersible breaks down far below the surface

With limited power and a long journey ahead, you'll need to navigate carefully

Your sonar will guide you through the dark

Your torch will help you see, but "light comes at a cost"

Somewhere above the surface waits


Can you find your way back?
`;

    function isHover(x, y, w, h) {
        return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
    }

    function drawButton(x, y, w, h, label) {
        const hover = isHover(x, y, w, h);

        noStroke();
        fill(0, 0, 0, 120);
        rect(x + 3, y + 4, w, h, 10);

        fill(hover ? color(0, 210, 190) : color(0, 140, 130));
        rect(x, y, w, h, 10);

        fill(255, 255, 255, 40);
        rect(x, y, w, h * 0.35, 10);

        fill(255);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        textSize(18);
        text(label, x + w / 2, y + h / 2);
        textStyle(NORMAL);
    }

    return {
        draw(bgImage) {
            if (bgImage) {
                image(bgImage, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
            } else {
                background(0);
            }

            // fill(0, 0, 0, 180);
            // rect(0, 0, width, height);

            fill(255);
            textAlign(CENTER, CENTER);
            textSize(48);
            textStyle(BOLD);
            text("STORY", CANVAS.WIDTH / 2, 90);

            //trancluscent box
            fill(0, 0, 0, 180);
            noStroke();
            rect(boxX, boxY, boxWidth, boxHeight, 20);

            noStroke();
            fill(255);
            textSize(24);
            textStyle(BOLD);
            textAlign(CENTER, CENTER);

            const textPadding = 20;

            text(
                storyText,
                boxX + textPadding,
                boxY + textPadding,
                boxWidth - textPadding * 2,
                boxHeight - textPadding * 2
            );

            drawButton(btnX, btnY, btnWidth, btnHeight, "NEXT");
        },

        checkClick(mX, mY) {
            if (
                mX > btnX &&
                mX < btnX + btnWidth &&
                mY > btnY &&
                mY < btnY + btnHeight
            ) {
                return "CONTINUE";
            }
            return null;
        },
    };
}