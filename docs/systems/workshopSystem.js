/*
========================================
VERSION: 1.0
SYSTEM: WORKSHOP SYSTEM
AUTHOR/s: Archie
DESCRIPTION:
- Manages workshop UI overlay
- Displays upgradeable abilities: power, torch, sonar
- Displays purchasable items: missiles
- Frontend-only: reads player scrap, no mutations

RULES:
- No drawing inside update() function
- No state changes inside draw() function
- Mutations handled by other systems later
- Only reads player.scrap, does not modify player state directly

DESIGN GOALS:
- Decouple workshop UI from gameplay systems
- Provide clear purchase feedback without action
- Enable future integration with upgrade/purchase handlers

RESPONSIBILITIES:
- Workshop open/close state management
- UI rendering and hit detection
- Log purchase attempts to console
- Display current upgrade levels and item quantities
- Handle mouse clicks on upgrade/item cards

DEPENDENCIES:
- Player object (read-only: scrap property)
- p5.js drawing functions (fill, rect, text, etc.)
- Mouse events (mouseX, mouseY from p5.js)

USAGE:
import { createWorkshopSystem } from './systems/workshopSystem.js';

const workshopSystem = createWorkshopSystem(player);
engine.register(workshopSystem);

// In draw():
if (workshopSystem.isWorkshopOpen()) {
  workshopSystem.draw();
}

// In keyPressed():
workshopSystem.onKeyPressed?.(key, keyCode);
========================================
NOTES:
- Purchase attempts logged to console (no scrap deducted yet)
- Upgrades have levels and costs
- Items have quantity tracking and per-unit costs
- UI uses semi-transparent overlay like pauseMenuSystem
========================================
TODO / LIMITATIONS:
- Purchase requests not wired to other systems yet
- No coin deduction on purchases
- No upgrade level changes
- No item quantity changes
- No sound effects yet
- No keyboard navigation (arrow keys)
========================================
*/


//======================================
// WORKSHOP SYSTEM
//======================================

import { CONTROLS, keyLabel } from '../config.js';

export function createWorkshopSystem(player, initialControlMode = CONTROLS.DEFAULT_MODE, getScrapIcon = () => null, soundSystem = null) {
  let workshopOpen = false;
  let controlMode = initialControlMode;

  const INITIAL_UPGRADE_COSTS = { power: 50, torch: 40, sonar: 60 };

  // Upgrade levels (now synced with player)
  const upgrades = {
    power: {
      level: player?.upgrades?.power ?? 1,
      cost: INITIAL_UPGRADE_COSTS.power,
      description: "Increase max power capacity",
    },
    sonar: {
      level: player?.upgrades?.sonar ?? 1,
      cost: INITIAL_UPGRADE_COSTS.sonar,
      description: "Faster ping cooldown & tiles stay visible longer"
    },
    torch: {
      level: player?.upgrades?.torch ?? 1,
      cost: INITIAL_UPGRADE_COSTS.torch,
      description: "Expand torch radius"
    },
  };

  // Purchasable items
  const items = {
    missiles: { 
      quantity: player?.missiles ?? 0, 
      costPerUnit: 20, 
      description: "Missiles" 
    },
  };

  // Layout constants
  const PANEL_W = 900;
  const PANEL_H = 460;
  const CARD_W = 190;
  const CARD_H = 118;
  const BUTTON_W = 110;
  const BUTTON_H = 38;

  //--------------------------------------
  // HIT TESTING
  //--------------------------------------
  function isOver(bx, by, bw, bh) {
    return (
      mouseX >= bx && mouseX <= bx + bw && mouseY >= by && mouseY <= by + bh
    );
  }

  //--------------------------------------
  // DRAWING HELPERS
  //--------------------------------------
  function drawButton(label, x, y, w, h, hovered, canAfford = true) {
    noStroke();
    const bgColor = !canAfford
      ? color(74, 74, 74)
      : hovered
        ? color(92, 170, 212)
        : color(49, 78, 97);
    fill(bgColor);
    rect(x, y, w, h, 4);
    stroke(194, 240, 255, 170);
    strokeWeight(1.5);
    noFill();
    rect(x, y, w, h, 4);
    noStroke();
    fill(canAfford ? 240 : 150);
    textAlign(CENTER, CENTER);
    textSize(13);
    text(label, x + w / 2, y + h / 2);
  }

  function drawTechFrame(x, y, w, h, title, titleBarH = 28) {
    noStroke();
    fill(12, 23, 31, 240);
    rect(x, y, w, h, 10);

    stroke(126, 220, 224, 200);
    strokeWeight(2);
    noFill();
    rect(x, y, w, h, 10);

    const titleBarTop = y + 12;
    noStroke();
    fill(33, 56, 70, 240);
    rect(x + 14, titleBarTop, w - 28, titleBarH, 5);

    fill(227, 244, 248);
    textAlign(LEFT, CENTER);
    textSize(14);
    text(title, x + 24, titleBarTop + titleBarH / 2);
  }

  function drawLevelTicks(x, y, level, maxTicks = 8) {
    const safeLevel = Math.max(0, Math.min(maxTicks, level ?? 0));
    for (let i = 0; i < maxTicks; i++) {
      const tx = x + i * 9;
      noStroke();
      fill(i < safeLevel ? color(117, 250, 126) : color(53, 83, 65));
      rect(tx, y, 6, 10, 1);
    }
  }

  function getLayout() {
    const panelX = width / 2 - PANEL_W / 2;
    const panelY = height / 2 - PANEL_H / 2;
    const upgradesStartX = panelX + 32;
    const upgradesStartY = panelY + 118;
    const cardGap = 18;
    const sectionGapY = 182;

    const upgradeCards = [];
    let i = 0;
    for (const key of Object.keys(upgrades)) {
      upgradeCards.push({
        key,
        x: upgradesStartX + i * (CARD_W + cardGap),
        y: upgradesStartY,
        w: CARD_W,
        h: CARD_H,
      });
      i += 1;
    }

    const itemCards = [];
    let j = 0;
    for (const key of Object.keys(items)) {
      itemCards.push({
        key,
        x: upgradesStartX + j * (CARD_W + cardGap),
        y: upgradesStartY + sectionGapY,
        w: CARD_W,
        h: CARD_H,
      });
      j += 1;
    }

    const rightPanel = {
      x: panelX + PANEL_W - 250,
      y: panelY + 118,
      w: 220,
      h: 306,
    };

    const rp = { x: panelX + PANEL_W - 250, y: panelY + 118, w: 220, h: 306 };
    const closeButton = {
      x: rp.x + (rp.w - BUTTON_W) / 2,
      y: rp.y + rp.h - BUTTON_H - 12,
      w: BUTTON_W,
      h: BUTTON_H,
    };

    return { panelX, panelY, upgradeCards, itemCards, rightPanel, closeButton };
  }

  function drawScrapCost(amount, x, y, canAfford) {
    const icon = getScrapIcon();
    const iconSize = 24;
    const textCol = canAfford ? color(255, 223, 136) : color(132, 132, 132);
    if (icon) {
      tint(canAfford ? color(255, 255, 255) : color(100, 100, 100));
      image(icon, x, y - iconSize / 2, iconSize, iconSize);
      noTint();
    }
    fill(textCol);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(12);
    text(amount, x + iconSize + 4, y);
  }

  function drawUpgradeCard(name, upgrade, x, y) {
    const playerScrap = player?.scrap ?? 0;
    const canAfford = playerScrap >= upgrade.cost;
    const currentLevel = player?.upgrades?.[name] ?? upgrade.level;

    noStroke();
    fill(26, 31, 40, 240);
    rect(x, y, CARD_W, CARD_H, 7);

    stroke(canAfford ? color(143, 234, 255) : color(109, 109, 109));
    strokeWeight(1.8);
    noFill();
    rect(x, y, CARD_W, CARD_H, 7);

    textAlign(LEFT, TOP);
    textSize(15);
    fill(234, 246, 248);
    noStroke();
    text(name.toUpperCase(), x + 10, y + 8);

    fill(149, 177, 182);
    textSize(11);
    text(upgrade.description, x + 10, y + 29);

    fill(174, 205, 211);
    text(`LEVEL ${currentLevel}`, x + 10, y + 50);
    drawLevelTicks(x + 10, y + 68, currentLevel, 8);

    drawScrapCost(upgrade.cost, x + 5, y + 98, canAfford);

    textAlign(RIGHT, CENTER);
    textSize(10);
    fill(canAfford ? color(148, 252, 165) : color(129, 129, 129));
    text(canAfford ? "CLICK TO UPGRADE" : "INSUFFICIENT MATERIALS", x + CARD_W - 10, y + 98);
  }

  function drawItemCard(itemName, item, x, y) {
    const playerScrap = player?.scrap ?? 0;
    const canAfford = playerScrap >= item.costPerUnit;
    const currentQuantity = itemName === 'missiles' ? (player?.missiles ?? 0) : (item.quantity ?? 0);

    noStroke();
    fill(27, 33, 42, 240);
    rect(x, y, CARD_W, CARD_H, 7);

    stroke(canAfford ? color(156, 235, 160) : color(109, 109, 109));
    strokeWeight(1.8);
    noFill();
    rect(x, y, CARD_W, CARD_H, 7);

    textAlign(LEFT, TOP);
    textSize(15);
    fill(234, 246, 248);
    noStroke();
    text(item.description.toUpperCase(), x + 10, y + 8);

    textSize(11);
    fill(149, 177, 182);
    text("Single-use guided projectile", x + 10, y + 29);

    fill(174, 205, 211);
    text(`OWNED ${currentQuantity}`, x + 10, y + 50);

    drawScrapCost(item.costPerUnit, x + 5, y + 98, canAfford);

    textAlign(RIGHT, CENTER);
    textSize(10);
    fill(canAfford ? color(148, 252, 165) : color(129, 129, 129));
    text(canAfford ? "CLICK TO BUY +1" : "INSUFFICIENT MATERIALS", x + CARD_W - 10, y + 98);
  }

  //--------------------------------------
  // SHOP DISPLAY
  //--------------------------------------
  function drawWorkshopUI() {
    noStroke();
    fill(2, 8, 14, 210);
    rect(0, 0, width, height);

    const layout = getLayout();
    const { panelX, panelY } = layout;

    drawTechFrame(panelX, panelY, PANEL_W, PANEL_H, "WORKSHOP", 44);

    const sysBarTop = panelY + 68, sysBarH = 30;
    noStroke();
    fill(28, 42, 54, 220);
    rect(panelX + 30, sysBarTop, 608, sysBarH, 4);
    noStroke();
    fill(220, 237, 242);
    textAlign(LEFT, CENTER);
    textSize(16);
    text("SYSTEMS", panelX + 42, sysBarTop + sysBarH / 2);

    const subBarTop = panelY + 252, subBarH = 30;
    noStroke();
    fill(24, 38, 50, 220);
    rect(panelX + 30, subBarTop, 608, subBarH, 4);
    noStroke();
    fill(220, 237, 242);
    textAlign(LEFT, CENTER);
    textSize(16);
    text("SUBSYSTEMS", panelX + 42, subBarTop + subBarH / 2);

    for (const card of layout.upgradeCards) {
      drawUpgradeCard(card.key, upgrades[card.key], card.x, card.y);
    }

    for (const card of layout.itemCards) {
      drawItemCard(card.key, items[card.key], card.x, card.y);
    }

    const info = layout.rightPanel;
    drawTechFrame(info.x, info.y, info.w, info.h, "Player Loadout");
    noStroke();
    fill(190, 228, 236);
    textSize(13);
    textAlign(LEFT, TOP);

    // Scrap row — highlighted box
    const scrapIcon = getScrapIcon?.();
    const iconSize = 20;
    const boxX = info.x + 14, boxY = info.y + 48, boxW = info.w - 28, boxH = 26;
    noStroke();
    fill(12, 23, 31, 200);
    rect(boxX, boxY, boxW, boxH, 4);
    stroke(126, 220, 224, 140);
    strokeWeight(1.2);
    noFill();
    rect(boxX, boxY, boxW, boxH, 4);
    noStroke();

    const scrapRowY = boxY + boxH / 2;
    if (scrapIcon) {
      image(scrapIcon, boxX + 8, scrapRowY - iconSize / 2, iconSize, iconSize);
    }
    fill(255, 223, 136);
    textSize(13);
    textAlign(LEFT, CENTER);
    text(`Scrap: ${player?.scrap ?? 0}`, boxX + 8 + (scrapIcon ? iconSize + 4 : 0), scrapRowY);

    fill(190, 228, 236);
    textSize(13);
    textAlign(LEFT, TOP);
    text(`Missiles: ${player?.missiles ?? 0}`, info.x + 20, info.y + 82);
    text(`Power Lvl: ${player?.upgrades?.power ?? 1}`, info.x + 20, info.y + 108);
    text(`Torch Lvl: ${player?.upgrades?.torch ?? 1}`, info.x + 20, info.y + 134);
    text(`Sonar Lvl: ${player?.upgrades?.sonar ?? 1}`, info.x + 20, info.y + 160);

    fill(116, 160, 171);
    textSize(11);
    const shopKey = keyLabel(CONTROLS.MODES[controlMode].ACCEPT);
    text(`Click any card to buy. Press ${shopKey} or close to return.`, info.x + 20, info.y + 218, info.w - 40, 80);

    drawButton(
      `CLOSE (${shopKey})`,
      layout.closeButton.x,
      layout.closeButton.y,
      layout.closeButton.w,
      layout.closeButton.h,
      isOver(layout.closeButton.x, layout.closeButton.y, layout.closeButton.w, layout.closeButton.h),
      true
    );
  }

  //--------------------------------------
  // PURCHASE LOGIC (now wired to player state)
  //--------------------------------------
  function attemptUpgradePurchase(upgradeName) {
    const upgrade = upgrades[upgradeName];
    if (!upgrade) return false;

    const playerScrap = player?.scrap ?? 0;
    if (playerScrap < upgrade.cost) {
      console.log(`❌ Not enough scrap for ${upgradeName} upgrade. Need: ${upgrade.cost}, Have: ${playerScrap}`);
      return false;
    }

    // Deduct scrap
    player.scrap -= upgrade.cost;
    
    // Increment upgrade level
    if (player.upgrades && upgradeName in player.upgrades) {
      player.upgrades[upgradeName]++;
    }

    // Update shop display
    upgrade.level++;
    upgrade.cost = Math.ceil(upgrade.cost * 1.5); // Increase cost for next level
    
    soundSystem?.play('upgrade', 0.6);
    console.log(`✓ Purchased ${upgradeName} upgrade! New level: ${upgrade.level}, Scrap left: ${player.scrap}`);
    return true;
  }

  function attemptItemPurchase(itemName, quantity = 1) {
    const item = items[itemName];
    if (!item) return false;

    const totalCost = item.costPerUnit * quantity;
    const playerScrap = player?.scrap ?? 0;
    if (playerScrap < totalCost) {
      console.log(`❌ Not enough scrap for ${quantity}x ${itemName}. Need: ${totalCost}, Have: ${playerScrap}`);
      return false;
    }

    // Deduct scrap
    player.scrap -= totalCost;
    
    // Add to inventory
    if (itemName === 'missiles') {
      player.missiles = (player.missiles ?? 0) + quantity;
    }
    
    // Update shop display
    item.quantity += quantity;
    
    soundSystem?.play('upgrade', 0.6);
    console.log(`✓ Purchased ${quantity}x ${itemName}! Total owned: ${item.quantity}, Scrap left: ${player.scrap}`);
    return true;
  }

  //--------------------------------------
  // CLICK HANDLING
  //--------------------------------------
  function handleClick() {
    if (!workshopOpen) return;

    console.log(`[workshop] click detected at mouseX=${mouseX}, mouseY=${mouseY}, scrap=${player?.scrap ?? 0}`);

    const layout = getLayout();

    if (isOver(layout.closeButton.x, layout.closeButton.y, layout.closeButton.w, layout.closeButton.h)) {
      console.log('[workshop] close button clicked');
      workshopOpen = false;
      return;
    }

    for (const card of layout.upgradeCards) {
      if (isOver(card.x, card.y, card.w, card.h)) {
        console.log(`[workshop] upgrade card clicked: ${card.key}`);
        attemptUpgradePurchase(card.key);
        return;
      }
    }

    for (const card of layout.itemCards) {
      if (isOver(card.x, card.y, card.w, card.h)) {
        console.log(`[workshop] item card clicked: ${card.key}`);
        attemptItemPurchase(card.key, 1);
        return;
      }
    }

    console.log('[workshop] click did not hit any button');
  }

  //--------------------------------------
  // SYSTEM INTERFACE
  //--------------------------------------
  return {
    // STATE QUERIES
    isWorkshopOpen() {
      return workshopOpen;
    },

    setControlMode(mode) {
      if (CONTROLS.MODES[mode]) controlMode = mode;
    },

    // STATE CONTROL
    toggleWorkshop() {
      workshopOpen = !workshopOpen;
    },

    openWorkshop() {
      workshopOpen = true;
    },

    closeWorkshop() {
      workshopOpen = false;
    },

    // ENGINE INTERFACE
    update() {
      // Update logic here if needed
      // Currently workshop is stateless except for open/closed
    },

    draw() {
      if (!workshopOpen) return;
      drawWorkshopUI();
    },

    // INPUT INTERFACE
    onMousePressed() {
      if (!workshopOpen) return;
      handleClick();
    },

    reset() {
      workshopOpen = false;
      for (const name of Object.keys(upgrades)) {
        upgrades[name].level = 1;
        upgrades[name].cost  = INITIAL_UPGRADE_COSTS[name];
      }
      items.missiles.quantity = 0;
    },

    // DATA QUERIES
    getUpgradeLevel(upgradeName) {
      return upgrades[upgradeName]?.level ?? 0;
    },

    getItemQuantity(itemName) {
      return items[itemName]?.quantity ?? 0;
    },
  };
}
//======================================
// END
//======================================
