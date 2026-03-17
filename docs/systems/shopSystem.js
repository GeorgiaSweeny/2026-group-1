/*
========================================
VERSION: 1.0
SYSTEM: SHOP SYSTEM
AUTHOR/s: Archie
DESCRIPTION:
- Manages shop UI overlay
- Displays upgradeable abilities: power, torch, sonar
- Displays purchasable items: missiles
- Frontend-only: reads player coins, no mutations

RULES:
- No drawing inside update() function
- No state changes inside draw() function
- Mutations handled by other systems later
- Only reads player.coins, does not modify player state directly

DESIGN GOALS:
- Decouple shop UI from gameplay systems
- Provide clear purchase feedback without action
- Enable future integration with upgrade/purchase handlers

RESPONSIBILITIES:
- Shop open/close state management
- UI rendering and hit detection
- Log purchase attempts to console
- Display current upgrade levels and item quantities
- Handle mouse clicks on upgrade/item cards

DEPENDENCIES:
- Player object (read-only: coins property)
- p5.js drawing functions (fill, rect, text, etc.)
- Mouse events (mouseX, mouseY from p5.js)

USAGE:
import { createShopSystem } from './systems/shopSystem.js';

const shopSystem = createShopSystem(player);
engine.register(shopSystem);

// In draw():
if (shopSystem.isShopOpen()) {
  shopSystem.draw();
}

// In keyPressed():
shopSystem.onKeyPressed?.(key, keyCode);
========================================
NOTES:
- Purchase attempts logged to console (no coins deducted yet)
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
// SHOP SYSTEM
//======================================

export function createShopSystem(player) {
  let shopOpen = false;

  // Upgrade levels (cosmetic display, actual upgrades handled by other systems)
  const upgrades = {
    power: { 
      level: 1, 
      cost: 50, 
      description: "Increase max power capacity",   
    },
    torch: { 
      level: 1, 
      cost: 40, 
      description: "Expand torch radius" 
    },
    sonar: { 
      level: 1, 
      cost: 60, 
      description: "Increase sonar range" 
    },
  };

  // Purchasable items
  const items = {
    missiles: { 
      quantity: 0, 
      costPerUnit: 20, 
      description: "Missiles" 
    },
  };

  // Button constants
  const BUTTON_W = 160;
  const BUTTON_H = 40;
  const ITEM_WIDTH = 200;
  const ITEM_HEIGHT = 80;

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
      ? color(80, 80, 80)
      : hovered 
      ? color(80, 130, 200) 
      : color(50, 60, 80);
    fill(bgColor);
    rect(x, y, w, h, 6);
    fill(canAfford ? 255 : 150);
    textAlign(CENTER, CENTER);
    textSize(14);
    text(label, x + w / 2, y + h / 2);
  }

  function drawUpgradeCard(name, upgrade, x, y) {
    const playerCoins = player?.coins ?? 0;
    const canAfford = playerCoins >= upgrade.cost;

    // Card background
    noStroke();
    fill(40, 50, 70);
    rect(x, y, ITEM_WIDTH, ITEM_HEIGHT, 8);

    // Border (color based on affordability)
    stroke(canAfford ? color(80, 130, 200) : color(100, 100, 100));
    strokeWeight(2);
    noFill();
    rect(x, y, ITEM_WIDTH, ITEM_HEIGHT, 8);

    // Title
    textAlign(LEFT, TOP);
    textSize(16);
    fill(255);
    noStroke();
    text(name.toUpperCase(), x + 10, y + 8);

    // Level
    textSize(12);
    fill(150);
    text(`Level: ${upgrade.level}`, x + 10, y + 28);

    // Description
    textSize(11);
    fill(180);
    text(upgrade.description, x + 10, y + 45);

    // Cost and affordability
    textSize(13);
    fill(canAfford ? color(255, 200, 100) : color(150, 150, 150));
    text(`Cost: ${upgrade.cost}`, x + 10, y + 60);
  }

  function drawItemCard(itemName, item, x, y) {
    const playerCoins = player?.coins ?? 0;
    const canAfford = playerCoins >= item.costPerUnit;

    // Card background
    noStroke();
    fill(40, 50, 70);
    rect(x, y, ITEM_WIDTH, ITEM_HEIGHT, 8);

    // Border (color based on affordability)
    stroke(canAfford ? color(100, 180, 100) : color(100, 100, 100));
    strokeWeight(2);
    noFill();
    rect(x, y, ITEM_WIDTH, ITEM_HEIGHT, 8);

    // Title
    textAlign(LEFT, TOP);
    textSize(16);
    fill(255);
    noStroke();
    text(item.description, x + 10, y + 8);

    // Quantity
    textSize(12);
    fill(150);
    text(`Owned: ${item.quantity}`, x + 10, y + 28);

    // Description
    textSize(11);
    fill(180);
    text("Combat resource", x + 10, y + 45);

    // Cost per unit and affordability
    textSize(13);
    fill(canAfford ? color(255, 200, 100) : color(150, 150, 150));
    text(`Cost: ${item.costPerUnit}`, x + 10, y + 60);
  }

  //--------------------------------------
  // SHOP DISPLAY
  //--------------------------------------
  function drawShopUI() {
    // Semi-transparent overlay
    noStroke();
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    const cx = width / 2;
    const baseY = height / 2 - 200;

    // Title
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(255, 200, 100);
    noStroke();
    text("SHOP", cx, baseY);

    // Coin display
    textSize(20);
    fill(255, 255, 150);
    text(`Coins: ${player?.coins ?? 0}`, cx, baseY + 50);

    // Upgrades section
    textAlign(LEFT, CENTER);
    textSize(18);
    fill(200, 220, 255);
    text("UPGRADES", 50, baseY + 100);

    // Upgrade cards layout
    const upgradeY = baseY + 130;
    let upgradeX = 50;
    for (const [key, upgrade] of Object.entries(upgrades)) {
      drawUpgradeCard(key, upgrade, upgradeX, upgradeY);
      upgradeX += ITEM_WIDTH + 20;
    }

    // Items section
    textAlign(LEFT, CENTER);
    textSize(18);
    fill(200, 220, 255);
    text("ITEMS", 50, baseY + 230);

    // Items cards layout
    const itemsY = baseY + 260;
    let itemsX = 50;
    for (const [key, item] of Object.entries(items)) {
      drawItemCard(key, item, itemsX, itemsY);
      itemsX += ITEM_WIDTH + 20;
    }

    // Close button
    const closeButtonX = cx - BUTTON_W / 2;
    const closeButtonY = height - 80;
    drawButton(
      "Close (B)",
      closeButtonX,
      closeButtonY,
      BUTTON_W,
      BUTTON_H,
      isOver(closeButtonX, closeButtonY, BUTTON_W, BUTTON_H),
      true
    );
  }

  //--------------------------------------
  // PURCHASE LOGIC (frontend only - displays feedback)
  //--------------------------------------
  function attemptUpgradePurchase(upgradeName) {
    const upgrade = upgrades[upgradeName];
    if (!upgrade) return false;

    const playerCoins = player?.coins ?? 0;
    if (playerCoins < upgrade.cost) {
      console.log(`❌ Not enough coins for ${upgradeName} upgrade. Need: ${upgrade.cost}, Have: ${playerCoins}`);
      return false;
    }

    // Display only - actual purchase handling done by other systems
    console.log(`✓ Attempting to purchase ${upgradeName} upgrade for ${upgrade.cost} coins`);
    return true;
  }

  function attemptItemPurchase(itemName, quantity = 1) {
    const item = items[itemName];
    if (!item) return false;

    const totalCost = item.costPerUnit * quantity;
    const playerCoins = player?.coins ?? 0;
    if (playerCoins < totalCost) {
      console.log(`❌ Not enough coins for ${quantity}x ${itemName}. Need: ${totalCost}, Have: ${playerCoins}`);
      return false;
    }

    console.log(`✓ Attempting to purchase ${quantity}x ${itemName} for ${totalCost} coins`);
    return true;
  }

  //--------------------------------------
  // CLICK HANDLING
  //--------------------------------------
  function handleClick() {
    if (!shopOpen) return;

    const cx = width / 2;
    const baseY = height / 2 - 200;
    const closeButtonX = cx - BUTTON_W / 2;
    const closeButtonY = height - 80;

    // Close button
    if (isOver(closeButtonX, closeButtonY, BUTTON_W, BUTTON_H)) {
      shopOpen = false;
      return;
    }

    // Upgrade buttons
    const upgradeY = baseY + 130;
    let upgradeX = 50;

    for (const [key, upgrade] of Object.entries(upgrades)) {
      if (isOver(upgradeX, upgradeY, ITEM_WIDTH, ITEM_HEIGHT)) {
        attemptUpgradePurchase(key);
        return;
      }
      upgradeX += ITEM_WIDTH + 20;
    }

    // Item buttons
    const itemsY = baseY + 260;
    let itemsX = 50;

    for (const [key, item] of Object.entries(items)) {
      if (isOver(itemsX, itemsY, ITEM_WIDTH, ITEM_HEIGHT)) {
        attemptItemPurchase(key, 1);
        return;
      }
      itemsX += ITEM_WIDTH + 20;
    }
  }

  //--------------------------------------
  // SYSTEM INTERFACE
  //--------------------------------------
  return {
    // STATE QUERIES
    isShopOpen() {
      return shopOpen;
    },

    // STATE CONTROL
    toggleShop() {
      shopOpen = !shopOpen;
    },

    openShop() {
      shopOpen = true;
    },

    closeShop() {
      shopOpen = false;
    },

    // ENGINE INTERFACE
    update(deltaTime) {
      // Update logic here if needed
      // Currently shop is stateless except for open/closed
    },

    draw() {
      if (!shopOpen) return;
      drawShopUI();
    },

    // INPUT INTERFACE
    onMousePressed() {
      if (!shopOpen) return;
      handleClick();
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
