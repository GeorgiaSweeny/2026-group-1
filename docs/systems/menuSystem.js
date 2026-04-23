/*
========================================
VERSION: 1.1
SYSTEM: MENU SYSTEM
AUTHOR: jude
DESCRIPTION:
- Handles the landing page rendering and logic
- Operates outside the main ECS engine loop

========================================
*/

import { CANVAS } from "../config.js";

export function createMenuSystem() {
  const btnWidth = 160;
  const btnHeight = 60;
  const gap = 40;

  const totalWidth = btnWidth * 2 + gap;
  const startX = CANVAS.WIDTH / 2 - totalWidth / 2;

  const btnEasyX = startX;
  const btnHardX = startX + btnWidth + gap;

  // DEMO button sits at original center Y; EASY/HARD pushed down below it
  const demoY = CANVAS.HEIGHT / 2;
  const btnY = demoY + btnHeight + gap;
  const settingsY = btnY + btnHeight + 20;

  const backToControlsY = settingsY + btnHeight + 20;

  // "main" shows mode select; "demo_difficulty" shows difficulty for demo mode
  let screen = "main";

  function isHover(x, y, w, h) {
    return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
  }

  function drawBtn(x, y, w, h, label, hoverCol, normalCol) {
    fill(isHover(x, y, w, h) ? hoverCol : normalCol);
    rect(x, y, w, h, 10);
    fill(255);
    textSize(24);
    text(label, x + w / 2, y + h / 2);
  }

  return {
    draw(titleImage) {
      // 1. Draw background & Overlay
      if (titleImage) {
        image(titleImage, 0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
      } else {
        background(30);
      }
      fill(0, 0, 0, 0);
      rect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

      // 2. Game Title
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(48);
      text("The Abyss", CANVAS.WIDTH / 2, CANVAS.HEIGHT / 3 - 40);


      if (screen === "main") {
        textSize(20);
        text("Select Mode", CANVAS.WIDTH / 2, CANVAS.HEIGHT / 3 + 10);

        // DEMO button (full width, at original btnY)
        drawBtn(startX, demoY, totalWidth, btnHeight, "DEMO",
          color(60, 160, 100), color(20, 100, 60));

        // EASY / HARD buttons below
        drawBtn(btnEasyX, btnY, btnWidth, btnHeight, "EASY",
          color(60, 100, 180), color(25, 50, 120));
        drawBtn(btnHardX, btnY, btnWidth, btnHeight, "HARD",
          color(180, 60, 60), color(120, 25, 25));

        // SETTINGS button
        drawBtn(startX, settingsY, totalWidth, btnHeight, "SETTINGS",
          color(60, 140, 220), color(30, 100, 180));

        drawBtn(startX, backToControlsY, totalWidth, btnHeight, "BACK",
          color(80, 80, 80), color(50, 50, 50));

      } else {
        // Demo difficulty sub-screen
        textSize(20);
        text("Demo Mode — Select Difficulty", CANVAS.WIDTH / 2, CANVAS.HEIGHT / 3 + 10);

        drawBtn(btnEasyX, btnY, btnWidth, btnHeight, "EASY",
          color(60, 100, 180), color(25, 50, 120));
        drawBtn(btnHardX, btnY, btnWidth, btnHeight, "HARD",
          color(180, 60, 60), color(120, 25, 25));

        // BACK button
        drawBtn(startX, settingsY, totalWidth, btnHeight, "BACK",
          color(100, 100, 100), color(60, 60, 60));
      }
    },

    checkClick(mX, mY) {
      if (screen === "main") {
        if (mX > startX && mX < startX + totalWidth && mY > demoY && mY < demoY + btnHeight)
          return "DEMO";
        if (mX > btnEasyX && mX < btnEasyX + btnWidth && mY > btnY && mY < btnY + btnHeight)
          return "EASY";
        if (mX > btnHardX && mX < btnHardX + btnWidth && mY > btnY && mY < btnY + btnHeight)
          return "HARD";
        if (mX > startX && mX < startX + totalWidth && mY > settingsY && mY < settingsY + btnHeight)
          return "SETTINGS";
        if (mX > startX && mX < startX + totalWidth && mY > backToControlsY && mY < backToControlsY + btnHeight)
          return "CONTROLS";
      } else {
        if (mX > btnEasyX && mX < btnEasyX + btnWidth && mY > btnY && mY < btnY + btnHeight)
          return "DEMO_EASY";
        if (mX > btnHardX && mX < btnHardX + btnWidth && mY > btnY && mY < btnY + btnHeight)
          return "DEMO_HARD";
        if (mX > startX && mX < startX + totalWidth && mY > settingsY && mY < settingsY + btnHeight)
          return "BACK";
      }
      return null;
    },

    setScreen(s) { screen = s; },
    getScreen() { return screen; },
  };
}
