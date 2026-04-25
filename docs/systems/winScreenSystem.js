/*
========================================
SYSTEM: WIN SCREEN SYSTEM
AUTHOR: jude
DESCRIPTION:
- Handles the win screen rendering and logic
- Operates outside the main ECS engine loop
========================================
*/

import { CANVAS } from "../config.js";

export function createWinScreenSystem() {
  const btnWidth  = 200;
  const btnHeight = 60;
  const gap       = 40;

  const totalWidth = btnWidth * 2 + gap;
  const startX     = CANVAS.WIDTH / 2 - totalWidth / 2;
  const btnRestartX = startX;
  const btnHomeX    = startX + btnWidth + gap;
  const btnY        = CANVAS.HEIGHT / 2 + 40;

  return {
    draw() {
      // 1. Dark Overlay
      noStroke();
      rectMode(CORNER);
      fill(0, 0, 0, 180);
      rect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

      // 2. Win Title
      fill(255, 215, 0);
      textAlign(CENTER, CENTER);
      textSize(64);
      text("SURFACE REACHED", CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 - 60);

      // tagline
      fill(200);
      textSize(20);
      text("You found your way back.", CANVAS.WIDTH / 2, CANVAS.HEIGHT / 2 + 10,);

      // 3. Restart Button
      const hoverRestart =
        mouseX > btnRestartX && mouseX < btnRestartX + btnWidth &&
        mouseY > btnY        && mouseY < btnY + btnHeight;
      fill(hoverRestart ? color(50, 150, 110) : color(25, 100, 70));
      rect(btnRestartX, btnY, btnWidth, btnHeight, 10);
      fill(255);
      textSize(24);
      text("Restart", btnRestartX + btnWidth / 2, btnY + btnHeight / 2);

      // 4. Home Button
      const hoverHome =
        mouseX > btnHomeX && mouseX < btnHomeX + btnWidth &&
        mouseY > btnY     && mouseY < btnY + btnHeight;
      fill(hoverHome ? color(60, 140, 220) : color(30, 100, 180));
      rect(btnHomeX, btnY, btnWidth, btnHeight, 10);
      fill(255);
      text("Home", btnHomeX + btnWidth / 2, btnY + btnHeight / 2);
    },

    checkClick(mX, mY) {
      if (
        mX > btnRestartX && mX < btnRestartX + btnWidth &&
        mY > btnY        && mY < btnY + btnHeight
      ) {
        return "RESTART";
      }
      if (
        mX > btnHomeX && mX < btnHomeX + btnWidth &&
        mY > btnY     && mY < btnY + btnHeight
      ) {
        return "MENU";
      }
      return null;
    },
  };
}
