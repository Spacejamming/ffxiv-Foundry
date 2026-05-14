const MODULE_ID = "ffxiv-vtt";

export class FFXIVAoeManager {
  constructor() {
    this.aoes = new Map();
    this.showAuras = game.settings.get(MODULE_ID, "displayAoEauras");
  }

  init() {
    Hooks.on("createMeasuredTemplate", (template) => this._registerTemplate(template));
    Hooks.on("deleteMeasuredTemplate", (template) => this._unregisterTemplate(template));
    Hooks.on("updateMeasuredTemplate", (template) => this._updateAurasForTemplate(template));
  }

  _registerTemplate(template) {
    if (!game.user.isGM) return;
    if (!template) return;
    const id = template.id;
    if (this.aoes.has(id)) return;
    const aoe = {
      id,
      template,
      visible: template.visible,
    };
    this.aoes.set(id, aoe);
    this._updateAurasForTemplate(template);
  }

  _unregisterTemplate(template) {
    if (!template) return;
    this.aoes.delete(template.id);
    this._clearAuras();
  }

  _getSelectedTemplate() {
    const [selected] = canvas.templates.controlled;
    return selected ?? null;
  }

  registerSelectedTemplate() {
    const template = this._getSelectedTemplate();
    if (!template) {
      ui.notifications.warn("Select an existing template to register it as an AoE.");
      return null;
    }
    this._registerTemplate(template);
    ui.notifications.info("FFXIV AoE registered.");
    return template;
  }

  toggleAoEVisibility() {
    const template = this._getSelectedTemplate();
    if (!template) {
      ui.notifications.warn("Select the AoE template to toggle visibility.");
      return;
    }
    const aoe = this.aoes.get(template.id);
    if (!aoe) {
      ui.notifications.warn("This template is not registered as an AoE.");
      return;
    }
    aoe.visible = !aoe.visible;
    template.visible = aoe.visible;
    template.refresh();
    ui.notifications.info(`AoE visibility ${aoe.visible ? "shown" : "hidden"}.`);
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
    canvas.tokens.controlled.forEach((token) => token.release());
    contained.forEach((token) => token.control({ releaseOthers: false }));
    ui.notifications.info(`${contained.length} token(s) selected inside AoE.`);
    if (this.showAuras) this._updateAurasForTemplate(template);
  }

  toggleTokenAuras() {
    this.showAuras = !this.showAuras;
    game.settings.set(MODULE_ID, "displayAoEauras", this.showAuras);
    if (!this.showAuras) {
      this._clearAuras();
      ui.notifications.info("AoE token auras hidden.");
      return;
    }
    this.aoes.forEach((aoe) => this._updateAurasForTemplate(aoe.template));
    ui.notifications.info("AoE token auras shown.");
  }

  _getTokensInsideTemplate(template) {
    return canvas.tokens.placeables.filter((token) => {
      const point = token.center;
      if (typeof template.containsPoint === "function") {
        return template.containsPoint(point);
      }
      if (template.shape?.contains) {
        return template.shape.contains(point);
      }
      return false;
    });
  }

  _updateAurasForTemplate(template) {
    if (!this.showAuras) return;
    if (!template) return;
    this._clearAuras();
    const tokens = this._getTokensInsideTemplate(template);
    tokens.forEach((token) => this._ensureAura(token));
  }

  _ensureAura(token) {
    if (token._ffxivAoeAura) return;
    const opacity = game.settings.get(MODULE_ID, "aoeAuraOpacity") ?? 0.3;
    const color = game.settings.get(MODULE_ID, "aoeAuraColor") ?? 0xffcc66;
    const aura = new PIXI.Graphics();
    aura.beginFill(Number(color), opacity);
    aura.drawEllipse(token.w / 2, token.h * 0.95, token.w * 0.55, token.h * 0.25);
    aura.endFill();
    aura.blendMode = PIXI.BLEND_MODES.ADD;
    aura.name = "ffxiv-vtt-aoe-aura";
    aura.zIndex = -1;
    token.addChildAt(aura, 0);
    token._ffxivAoeAura = aura;
  }

  _clearAuras() {
    canvas.tokens.placeables.forEach((token) => {
      if (token._ffxivAoeAura) {
        token.removeChild(token._ffxivAoeAura);
        delete token._ffxivAoeAura;
      }
    });
  }

  async handleChatAoEAction(action, messageId) {
    if (!game.user.isGM) return;
    const message = game.messages.get(messageId);
    if (!message) return;
    const template = this._getSelectedTemplate();
    switch (action) {
      case "place":
        if (!template) return ui.notifications.warn("Select a template before placing the AoE.");
        this._registerTemplate(template);
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
