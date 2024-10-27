import * as config from "../Units/npaoconfig.js";
export class FoundryLogo {
  static hiddenInterface = false;
  static hideAll() {
    $("#logo").click((_) => {
      this.toggleHide();
    });
  }
  static toggleHide() {
    if (!FoundryLogo.hiddenInterface) {
      $("#sidebar").hide();
      $("#navigation").hide();
      $("#controls").hide();
      $("#players").hide();
      $("#hotbar").hide();
      $("#tokenbar-controls").hide();
      $("#token-action-bar").hide();
      FoundryLogo.hiddenInterface = true;
    } else {
      $("#sidebar").show();
      $("#navigation").show();
      $("#controls").show();
      $("#players").show();
      $("#hotbar").show();
      $("#tokenbar-controls").show();
      $("#token-action-bar").show();
      FoundryLogo.hiddenInterface = false;
    }
  }
  static initHooks() {
    Hooks.once("renderSceneNavigation", async function () {
      $("#logo").attr("src", "modules/npao-core/images/npao_logo.webp");
    });
    Hooks.once("ready", async function () {
      FoundryLogo.hideAll();
      config.rootStyle.setProperty("--logovis", "visible");
      if (game.modules.get("lib-wrapper")?.active) {
        libWrapper.register(
          config.moduleName,
          "Token.prototype._canDrag",
          myCanDrag,
          "WRAPPER"
        );
      }
    });
  }
}
function myCanDrag(wrapped, ...args) {
  const canDrag = wrapped(...args);
  try {
    if (
      game.user.isGM &&
      game.settings.get(config.moduleName, "disableTokenDrag") &&
      !this.inCombat
    )
      return false;
  } catch (err) {
    console.err(err);
  }
  return canDrag;
}
