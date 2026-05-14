const MODULE_ID = "ffxiv-vtt";

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
      default: true
    });
  }

  static init() {
    this.log("Initializing module");
    this.debug("Version 0.0.2 - Init hook fired");
    this.registerSettings();
  }

  static ready() {
    this.log("Ready");
    this.debug("Module fully loaded and enabled in world");
    Hooks.on("renderChatMessage", (message, html) => {
      if (!game.settings.get(MODULE_ID, "enableEffects")) return;
      html.addClass("ffxiv-vtt-chat-effect");
    });
  }
}

Hooks.once("init", () => FFXIVVTT.init());
Hooks.once("ready", () => FFXIVVTT.ready());
