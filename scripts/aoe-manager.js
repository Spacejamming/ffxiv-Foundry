const MODULE_ID = "ffxiv-vtt";

export class FFXIVAoeManager {
  constructor() {
    this.showAuras = game.settings.get(MODULE_ID, "displayAoEauras");
  }

  init() {
    // We hook into refresh to draw our custom graphics whenever the template updates
    Hooks.on("refreshMeasuredTemplate", (template) => {
      // Check Document Flag instead of a local map, ensuring all players see it
      if (template.document.getFlag(MODULE_ID, "isAoe") && this.showAuras) {
        this._drawFFXIVGraphic(template);
      } else {
        this._clearFFXIVGraphic(template);
      }
    });
  }

  async _registerTemplate(template) {
    if (!game.user.isGM) return;
    if (!template) return;
    if (template.document.getFlag(MODULE_ID, "isAoe")) return;
    
    // Set the flag on the document, this automatically syncs across the network
    await template.document.setFlag(MODULE_ID, "isAoe", true);
  }

  async _unregisterTemplate(template) {
    if (!template) return;
    await template.document.unsetFlag(MODULE_ID, "isAoe");
  }

  _getSelectedTemplate() {
    const [selected] = canvas.templates.controlled;
    return selected ?? null;
  }

  async registerSelectedTemplate() {
    const template = this._getSelectedTemplate();
    if (!template) {
      ui.notifications.warn("Select an existing template to register it as an AoE.");
      return null;
    }
    await this._registerTemplate(template);
    ui.notifications.info("FFXIV AoE registered and synced to players.");
    return template;
  }

  toggleAoEVisibility() {
    const template = this._getSelectedTemplate();
    if (!template) {
      ui.notifications.warn("Select the AoE template to toggle visibility.");
      return;
    }
    if (!template.document.getFlag(MODULE_ID, "isAoe")) {
      ui.notifications.warn("This template is not registered as an AoE.");
      return;
    }
    
    const isHidden = template.document.hidden;
    template.document.update({ hidden: !isHidden });
    ui.notifications.info(`AoE visibility ${isHidden ? "shown" : "hidden"}.`);
  }

  selectTokensInAoE() {
    const template = this._getSelectedTemplate();
    if (!template) {
      ui.notifications.warn("Select the AoE template to select tokens within it.");
      return;
    }
    const contained = this._getTokensInsideTemplate(template);
    if (!contained.length) {
      ui.notifications.info("No tokens found inside the selected AoE.");
      return;
    }
    
    // Switch to the Token Layer so selection is permitted by Foundry
    canvas.tokens.activate();
    
    // Release current tokens and select the new ones
    canvas.tokens.releaseAll();
    contained.forEach((token) => token.control({ releaseOthers: false }));
    ui.notifications.info(`${contained.length} token(s) selected inside AoE.`);
  }

  toggleTokenAuras() {
    this.showAuras = !this.showAuras;
    game.settings.set(MODULE_ID, "displayAoEauras", this.showAuras);
    
    // Refresh all templates to either draw or clear the FFXIV graphic
    for (const template of canvas.templates.placeables) {
      template.refresh();
    }
    
    ui.notifications.info(`FFXIV AoE visuals ${this.showAuras ? "shown" : "hidden"}.`);
  }

  _getTokensInsideTemplate(template) {
    return canvas.tokens.placeables.filter((token) => {
      // Convert token global center to template local coordinates
      const dx = token.center.x - template.document.x;
      const dy = token.center.y - template.document.y;
      
      if (template.shape?.contains) {
        return template.shape.contains(dx, dy);
      }
      return false;
    });
  }

  _drawFFXIVGraphic(template) {
    if (!template.shape) return;
    
    let graphic = template._ffxivGraphic;
    if (!graphic) {
      graphic = new PIXI.Graphics();
      graphic.name = "ffxiv-vtt-aoe-aura";
      
      // Apply the Fog of War / Vision mask so it hides behind walls
      if (canvas.masks?.vision) {
          graphic.mask = canvas.masks.vision;
      }
      
      // Add beneath the standard template graphics
      template.addChildAt(graphic, 0);
      template._ffxivGraphic = graphic;
    }
    
    graphic.clear();
    
    // Hide standard Foundry template fill/border so ours takes over
    if (template.template) {
      template.template.alpha = 0; 
    }
    
    // FFXIV Colors
    const opacity = game.settings.get(MODULE_ID, "aoeAuraOpacity") ?? 0.3;
    const fillColor = 0xff6600; // Orange
    const borderColor = 0xff0000; // Red
    
    // Draw the main orange fill with a solid red border
    graphic.lineStyle(4, borderColor, 1);
    graphic.beginFill(fillColor, opacity);
    graphic.drawShape(template.shape);
    graphic.endFill();
    
    // Simulate a glowing border by drawing thicker, transparent lines
    graphic.lineStyle(10, borderColor, 0.4);
    graphic.drawShape(template.shape);
    graphic.lineStyle(20, borderColor, 0.15);
    graphic.drawShape(template.shape);
  }

  _clearFFXIVGraphic(template) {
    // Restore standard Foundry template visuals
    if (template.template) {
      template.template.alpha = 1;
    }
    
    if (template._ffxivGraphic) {
      template.removeChild(template._ffxivGraphic);
      template._ffxivGraphic.destroy();
      delete template._ffxivGraphic;
    }
  }

  async handleChatAoEAction(action, messageId) {
    if (!game.user.isGM) return;
    const template = this._getSelectedTemplate();
    switch (action) {
      case "place":
        if (!template) return ui.notifications.warn("Select a template before placing the AoE.");
        await this._registerTemplate(template);
        ui.notifications.info("Telegraphed AoE placed from chat item.");
        break;
      case "select":
        this.selectTokensInAoE();
        break;
      case "resolve":
        this.selectTokensInAoE();
        ui.notifications.info("Resolve action is not yet implemented beyond selection.");
        break;
    }
  }
}
