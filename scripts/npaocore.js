// Custom UI for settings, exposing a safe composite of key elements
// * from other modules, including:
// * Custom Foundry logo that toggles other UI elements (Minimal-UI)
// * Set default "Show Journal Notes" to true for all players (ShowNotes)
// * Set alternative pause icon and speed (Pause Icon)
// * Hype tracks (Maestro)
// * Exclusive audio (Chris-sound-module)
// * PF2e chances (Scari08)

// Also includes customs:
// * Option to expose reset password
// * Option to sync token name (with actor)
// * Option to expose token journals (once NPCs are "met", automatically extend ownership of their associated journal.  Intended for tie-in with LNPC.
// * Option to limit player control of token movement to WSAD keys
// * Minimize UI automatically for players when viewing a scene with "_hideUI" in the Scene Name (not the Navigation Name)

// Under development:
// * Incorporation of some functionality from Narrator
// * Incorporation of some functionality from Monk's Chat Timer
// * Extension of exlusive audio to support constant objects (to stop or otherwise act on) with multiple players - 27 Oct plan: add/remove objects to a flag or other registered global

//================================================================================
import * as config from "../Units/npaoconfig.js";
import { NPAOSettings } from "../Units/settings.js";
import { FoundryLogo } from "../Units/foundrylogo.js";
import { LandingPage } from "../Units/landingpage.js";
import { PauseIconSubmenu } from "../Units/pauseiconsubmenu.js";
import { SyncTokenName } from "../Units/synctokenname.js";
import { UserPassword } from "../Units/userpassword.js";
import HypeTrack from "../Units/hype-track.js";
import * as Playback from "../Units/hypePlayback.js";
import * as Misc from "../Units/misc.js";

Hooks.once("init", async function () {
  game.npao = {};
  NPAOSettings.InitSettings();
  FoundryLogo.initHooks();
  UserPassword.initHooks();
});
Hooks.once("ready", async function () {
  game.settings.set(config.moduleName, "notesDisplayToggle", true);
  game.npao.hypeTrack = new HypeTrack();
  HypeTrack._onReady();
  game.npao.pause = Playback.pauseSounds;
  game.npao.playByName = Playback.playSoundByName;
  game.npao.findSound = Playback.findPlaylistSound;
  game.npao.pauseAll = Playback.pauseAll;
  game.npao.resume = Playback.resumeSounds;
  game.socket.on("module.npao-core", (data) => {
    console.log("Received playSound command for this user:", data);
    if (data.action === "playSound" && data.userId === game.user.id) {
      console.log("Playing sound for user:", data.userId);
      try {
        // BLF: won't be able to create a stop function until it's returned to a constant, but still allows for
        // multiple players.  Module array with add/clear?
        let exclusiveaudioSound = new Audio(data.data.src);
        exclusiveaudioSound.volume = data.data.volume;
        exclusiveaudioSound.loop = data.data.loop;
        exclusiveaudioSound
          .play()
          .then(() => {
            console.log("Sound ${data.data.src} is playing.");
          })
          .catch((error) => {
            console.error(`Audio playback failed: ${error}`);
          });
      } catch (error) {
        console.error(`Error playing audio: ${error}`);
      }
    } else {
      console.log(
        `Message not for this user or incorrect action. Expected user ID: ${game.user.id}, received: ${data.userId}`
      );
    }
  });
  window.exclusiveAudio = Misc.exclusiveAudio;
  // NEED TO CLEANUP THE FOLLOWING CODE (FOR THE CHANCE-TO-HIT STATS)
  Hooks.on("preCreateChatMessage", async (chatMessage) => {
    if (
      !chatMessage.flags ||
      !chatMessage.flags.pf2e ||
      !chatMessage.flags.pf2e.modifiers ||
      !chatMessage.flags.pf2e.context.dc
    )
      return;

    let dc =
      10 +
      (chatMessage.flags.pf2e.context.dc.value ??
        chatMessage.flags.pf2e.context.dc.parent?.dc?.value ??
        0);
    let modifier = 10; //adding artificial 10 to be safe from negative dcs and modifiers
    chatMessage.flags.pf2e.modifiers.forEach(
      (e) => (modifier += e.enabled ? e.modifier : 0)
    );
    const diff = dc - modifier;
    const chances = [0, 0, 0, 0];

    Misc.chancesCalculation(diff, chances);

    const div = document.createElement("div");
    div.style.cssText = "display:flex;margin:8px 0 8px 0;height:24px";
    div.innerHTML = `<div style="display:flex;justify-content:center;overflow:hidden;border-bottom:12px solid;color:#c42522;width:${chances[0]}%;">${chances[0]}</div>
    <div style="display:flex;justify-content:center;overflow:hidden;border-bottom:12px solid;color:#874644 ;width:${chances[1]}%;">${chances[1]}</div>
    <div style="display:flex;justify-content:center;overflow:hidden;border-bottom:12px solid;color: #002564 ;width:${chances[2]}%;">${chances[2]}</div>
    <div style="display:flex;justify-content:center;overflow:hidden;border-bottom:12px solid;color:#448746;width:${chances[3]}%;">${chances[3]}</div>`;

    const flavor = chatMessage.flavor;
    const $flavor = $(`<div>${flavor}</div>`);
    $flavor.find("div.result.degree-of-success").before(div);
    const newFlavor = $flavor.html();
    await chatMessage.updateSource({ flavor: newFlavor });
  });
});
Hooks.on("getSceneControlButtons", (controls) => {
  const changePassword = {
    icon: "fas fa-key",
    name: "userPassword",
    title: game.i18n.format("Set user password"),
    button: true,
    onClick: UserPassword.updatePasswordDialog,
  };
  const declareActions = {
    icon: "fas fa-people-line",
    name: "declare-actions",
    title: game.i18n.format("Declare Actions"),
    button: true,
    visible: game.user.isGM,
    onClick: LandingPage.goAroundTable,
  };
  let tokenControls = controls.find((x) => x.name === "token");
  tokenControls.tools.push(changePassword);
  tokenControls.tools.push(declareActions);
});
Hooks.on("renderPause", function () {
  if ($("#pause").attr("class") !== "paused") return;
  const path = game.settings.get(config.moduleName, "pauseSettings").path;
  const opacity =
    game.settings.get(config.moduleName, "pauseSettings").opacity / 100;
  const text = game.settings.get(config.moduleName, "pauseSettings").text;
  const dimensionX = game.settings.get(
    config.moduleName,
    "pauseSettings"
  ).dimensionX;
  const dimensionY = game.settings.get(
    config.moduleName,
    "pauseSettings"
  ).dimensionY;
  const top = `${-16 - (dimensionY - 128) / 2}px`;
  const left = `calc(50% - ${dimensionX / 2}px)`;
  const textColor = game.settings.get(
    config.moduleName,
    "pauseSettings"
  ).textColor;
  const shadow = game.settings.get(config.moduleName, "pauseSettings").shadow;
  const fontSize = game.settings.get(
    config.moduleName,
    "pauseSettings"
  ).fontSize;
  const size = `${(text.length * fontSize * 90) / 12 + 70}px 100px`;
  if (path === "None" || dimensionX === 0 || dimensionY === 0) {
    $("#pause.paused img").hide();
  } else {
    $("#pause.paused img").attr("src", path);
    $("#pause.paused img").css({
      top: top,
      left: left,
      width: dimensionX,
      height: dimensionY,
      opacity: opacity,
    });
  }
  $("#pause.paused figcaption").text(text);
  if (text.length !== 0 && shadow) {
    $("#pause.paused").css({ "background-size": size });
    $("#pause.paused figcaption").css({
      color: textColor,
      "font-size": `${fontSize}em`,
    });
  } else if (text.length !== 0 && !shadow) {
    $("#pause.paused figcaption").css({
      color: textColor,
      "font-size": `${fontSize}em`,
    });
    $("#pause.paused figcaption").css({ color: textColor });
    $("#pause.paused").css("background", "none");
  } else {
    $("#pause.paused").css("background", "none");
  }
});
Hooks.on("getUserContextOptions", function (html, contextOptions) {
  contextOptions.push({
    name: game.i18n.format("Set user password"),
    icon: '<i class="fas fa-key"></i>',
    callback: UserPassword.updatePasswordDialog,
    condition: (html) =>
      html.attr("data-user-id") === game.userId &&
      game.settings.get(config.moduleName, "showPWordContext"),
  });
});
//  Token HUD button to quickly grant player access to the associated journal (includes chat announcement)
Hooks.on("renderTokenHUD", (app, html) => {
  const token = app.object;
  const colLeft = $(html).find(".left");
  const button = $(`
  <div class="control-icon ${""}" id="expose-journal">
      <img src="${
        config.bookmarkIcon
      }" width="36" height="36" title="${game.i18n.format(
    "Expose journal to players"
  )}">
      </div>
  `);
  if (
    game.user.isGM &&
    game.settings.get(config.moduleName, "displayExposeJournal")
  ) {
    colLeft.append(button);
    button.on("click", (e) => {
      exposeJournal(token.actor.name);
    });
  }
});
Hooks.on("preUpdatePlaylistSound", (sound, update, options, userId) => {
  Misc._onPreUpdatePlaylistSound(sound, update, options, userId);
});
Hooks.on("updateCombat", (combat, update, options, userId) => {
  HypeTrack._onUpdateCombat(combat, update, options, userId);
});
Hooks.on("deleteCombat", (combat, options, userId) => {
  HypeTrack._onDeleteCombat(combat, options, userId);
});
Hooks.on("renderActorSheet", (app, html, data) => {
  HypeTrack._onRenderActorSheet(app, html, data);
});
Hooks.on("renderPlaylistDirectory", (app, html, data) => {
  Misc._onRenderPlaylistDirectory(app, html, data);
});
Hooks.on("sightRefresh", (visibility) => {
  if (canvas.scene.name.search("_hideUI") > -1) {
    if (!game.user.isGM) {
      LandingPage.hideUI();
    }
  } else {
    if ((FoundryLogo.hiddenInterface = true)) {
      FoundryLogo.toggleHide();
    }
  }
});
Hooks.on("renderApplication", (app, html, data) => {
  if (
    app.constructor.name == "TokenBar" &&
    FoundryLogo.hiddenInterface == true
  ) {
    $("#tokenbar-controls").hide();
    $("#token-action-bar").hide();
  }
});
function exposeJournal(journalName) {
  let jl = game.journal.directory;
  jl.documents.forEach((e) => {
    if (e.name == journalName) {
      // Add a check to ensure current permissions = 0.  If not, break...
      e.update({ permission: { default: 1 } });
      ChatMessage.create({
        content: "You are now able to see the journal entry for " + e.name,
        speaker: { alias: "The voices in your head" },
      });
    }
  });
}
