import { FFXIVAoeManager } from "./aoe-manager.js";

export const MODULE_ID = "ffxiv-vtt";
export const MODULE_VERSION = "0.1.3";
let aoeManager;

class FFXIVVTT {
  static get version() {
    return game.modules.get(MODULE_ID)?.data?.version ?? MODULE_VERSION;
  }

  static log(...args) {
    console.log(`FFXIV VTT |`, ...args);
  }

  static debug(msg) {
    if (game.settings.get(MODULE_ID, "debug")) {
        console.debug(`[FFXIV VTT DEBUG] ${msg}`);
    }
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

    game.settings.register(MODULE_ID, "debug", {
        name: "Enable Debug Logging",
        hint: "Enable debug logging to the console for troubleshooting.",
        scope: "client",
        config: true,
        type: Boolean,
        default: false,
    });
  }

  static init() {
    this.log("Initializing module");
    this.registerSettings();
    this.log(`Version ${this.version} - Init hook fired`);
    this.debug(`Version ${this.version} - DEBUG mode enabled`);

    Hooks.on("getSceneControlButtons", (controls) => {
      FFXIVVTT.addSceneControls(controls);
    });
  }

  static ready() {
    this.log("Ready");
    this.debug("Module fully loaded and enabled in world");

    aoeManager = new FFXIVAoeManager();
    aoeManager.init();

    Hooks.on("renderChatMessage", (message, html) => {
      if (!game.settings.get(MODULE_ID, "enableEffects")) return;
      html.addClass("ffxiv-vtt-chat-effect");
      FFXIVVTT._injectAoEChatButtons(message, html);
    });
  }

  static addSceneControls(controls) {
    if (!game.user.isGM) return;

    this.debug("getSceneControlButtons hook fired. Adding FFXIV VTT controls.");
    this.debug(`Existing control groups: ${controls.map((c) => c.name).join(", ")}`);

    let targetGroup = controls.find((c) => c.name === MODULE_ID);
    if (!targetGroup) {
      this.debug("Creating dedicated FFXIV VTT control group.");
      targetGroup = {
        name: MODULE_ID,
        title: "FFXIV VTT",
        icon: "fas fa-dragon",
        layer: "TokenLayer",
        visible: true,
        tools: [],
      };
      controls.push(targetGroup);
    }

    const tools = [
      {
        name: "registerAoE",
        title: "Register AoE",
        icon: "fas fa-bullseye",
        visible: true,
        onClick: () => aoeManager.registerSelectedTemplate(),
        button: true,
      },
      {
        name: "selectAoE",
        title: "Select Tokens in AoE",
        icon: "fas fa-mouse-pointer",
        visible: true,
        onClick: () => aoeManager.selectTokensInAoE(),
        button: true,
      },
      {
        name: "toggleAoEAuras",
        title: "Toggle AoE Auras",
        icon: "fas fa-eye",
        visible: true,
        onClick: () => aoeManager.toggleTokenAuras(),
        button: true,
      },
      {
        name: "toggleAoEVisibility",
        title: "Toggle AoE Visibility",
        icon: "fas fa-low-vision",
        visible: true,
        onClick: () => aoeManager.toggleAoEVisibility(),
        button: true,
      },
    ];

    tools.forEach((tool) => {
      if (!targetGroup.tools.some((existing) => existing.name === tool.name)) {
        targetGroup.tools.push(tool);
      }
    });

    this.debug(`FFXIV VTT controls group now contains: ${targetGroup.tools.map((tool) => tool.name).join(", ")}`);
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
