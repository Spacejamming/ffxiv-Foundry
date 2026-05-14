import { FFXIVAoeManager } from "./aoe-manager.js";

export const MODULE_ID = "ffxiv-vtt";
let aoeManager;

class FFXIVVTT {
  static log(...args) {
    console.log(`FFXIV VTT |`, ...args);
  }

  static debug(msg) {
    console.debug(`[FFXIV VTT DEBUG] ${msg}`);
  }

  static registerSettings() {
    game.settings.register(MODULE_ID, "enableEffects", {
      name: "Enable FFXIV effects",
      hint: "Toggle FFXIV-inspired visual and audio effects.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register(MODULE_ID, "displayAoEauras", {
      name: "Display AoE token auras",
      hint: "Show a translucent glowing aura under tokens inside registered AoEs.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register(MODULE_ID, "aoeAuraOpacity", {
      name: "AoE aura opacity",
      hint: "Set the opacity for AoE token auras.",
      scope: "world",
      config: true,
      type: Number,
      range: {
        min: 0.1,
        max: 1.0,
        step: 0.05,
      },
      default: 0.3,
    });

    game.settings.register(MODULE_ID, "aoeAuraColor", {
      name: "AoE aura color",
      hint: "Set the color for AoE token auras.",
      scope: "world",
      config: true,
      type: String,
      default: "0xffcc66",
    });
  }

  static init() {
    this.log("Initializing module");
    this.debug("Version 0.0.3 - Init hook fired");
    this.registerSettings();
  }

  static ready() {
    this.log("Ready");
    this.debug("Module fully loaded and enabled in world");

    aoeManager = new FFXIVAoeManager();
    aoeManager.init();

    Hooks.on("renderChatMessage", (message, html) => {
      if (!game.settings.get(MODULE_ID, "enableEffects")) return;
      html.addClass("ffxiv-vtt-chat-effect");
      this._injectAoEChatButtons(message, html);
    });

    Hooks.on("getSceneControlButtons", (controls) => {
      if (!game.user.isGM) return;
      const measure = controls.find((c) => c.name === "measure");
      if (!measure) return;
      measure.tools.push({
        name: "registerAoE",
        title: "Register AoE from Selected Template",
        icon: "fas fa-bullseye",
        visible: true,
        onClick: () => aoeManager.registerSelectedTemplate(),
        button: true,
      });
      measure.tools.push({
        name: "selectAoE",
        title: "Select tokens in selected AoE",
        icon: "fas fa-mouse-pointer",
        visible: true,
        onClick: () => aoeManager.selectTokensInAoE(),
        button: true,
      });
      measure.tools.push({
        name: "toggleAoEAuras",
        title: "Toggle AoE token auras",
        icon: "fas fa-eye",
        visible: true,
        onClick: () => aoeManager.toggleTokenAuras(),
        button: true,
      });
      measure.tools.push({
        name: "toggleAoEVisibility",
        title: "Toggle AoE visibility",
        icon: "fas fa-low-vision",
        visible: true,
        onClick: () => aoeManager.toggleAoEVisibility(),
        button: true,
      });
    });
  }

  static _injectAoEChatButtons(message, html) {
    if (!game.user.isGM) return;
    const itemData = message.flags?.dnd5e?.itemData;
    if (!itemData) return;
    const aoeFlag = itemData.flags?.[MODULE_ID]?.aoe;
    if (!aoeFlag) return;

    const actions = document.createElement("div");
    actions.classList.add("ffxiv-vtt-chat-actions");
    actions.innerHTML = `
      <button class="ffxiv-vtt-chat-button" data-action="place">Place AoE</button>
      <button class="ffxiv-vtt-chat-button" data-action="select">Select Tokens</button>
      <button class="ffxiv-vtt-chat-button" data-action="resolve">Resolve AoE</button>
    `;
    html[0].appendChild(actions);
    actions.addEventListener("click", (event) => {
      const action = event.target.dataset.action;
      if (!action) return;
      aoeManager.handleChatAoEAction(action, message.id);
    });
  }
}

Hooks.once("init", () => FFXIVVTT.init());
Hooks.once("ready", () => FFXIVVTT.ready());
