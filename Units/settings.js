import { PauseIconSubmenu } from "../Units/pauseiconsubmenu.js";
import * as config from "./npaoconfig.js";
// import { ChatTimer, i18n } from "./chat-timer.js";

export class NPAOSettings {
  static InitSettings() {
    game.settings.register(config.moduleName, "pauseSettings", {
      scope: "world",
      config: false,
      type: Object,
      default: {
        path: "icons/svg/clockwork.svg",
        opacity: 50,
        dimensionX: 128,
        dimensionY: 128,
        text: game.i18n.format("GAME.Paused"),
        textColor: "#EEEEEE",
        shadow: true,
        fontSize: 2,
        speed: "5",
      },
    });
    game.settings.registerMenu(config.moduleName, "pauseSettings", {
      name: game.i18n.format("Pause icon settings"),
      label: game.i18n.format("Modify settings"),
      // icon: "fas fa-atlas",
      type: PauseIconSubmenu,
      restricted: true,
    });
    game.settings.register(config.moduleName, "notesDisplayToggle", {
      name: game.i18n.format("Display journal notes"),
      hint: game.i18n.format("Display journal notes to player by default."),
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      onChange: (_) => {
        game.settings.set(
          "core",
          "notesDisplayToggle",
          game.settings.get(config.moduleName, "notesDisplayToggle")
        );
      },
    });
    game.settings.register(
      config.moduleName,
      "gaming-table",
      config.tableSeats
    );
    game.settings.register(config.moduleName, "tokenSyncToggle", {
      name: game.i18n.format("Sync actor name and tokens"),
      hint: game.i18n.format("Sync token with changes to the actor's name."),
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    });
    game.settings.register(config.moduleName, "disableTokenDrag", {
      name: `Disable token drag for players`,
      hint: `Non GM players cannot drag tokens and must use WASD/Arrow keys.`,
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    });
    game.settings.register(config.moduleName, "displayExposeJournal", {
      name: game.i18n.format("Display Expose Journal button"),
      hint: game.i18n.format(
        "Show button to allow players to view NPC journals on token HUD."
      ),
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    });
    game.settings.register(config.moduleName, "enableHypeTrack", {
      name: "Enable hype tracks",
      hint: "Play hype tracks at start of players' combat turns",
      scope: "world",
      type: Boolean,
      default: false,
      config: true,
      onChange: async (s) => {
        if (!game.npao.hypeTrack) {
          return;
        }

        await game.npao.hypeTrack._checkForHypeTracksPlaylist();
      },
    }),
      game.settings.register(config.moduleName, "pauseOtherSounds", {
        name: "Pause for hype",
        hint: "Pause other sounds while playing hype tracks",
        scope: "world",
        type: Boolean,
        default: false,
        config: true,
        onChange: async (s) => {},
      });
  }
}
