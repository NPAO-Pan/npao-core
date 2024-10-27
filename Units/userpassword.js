import * as config from "../Units/npaoconfig.js";
export class UserPassword {
  static initHooks() {
    game.settings.register(config.moduleName, "showPWordIcon", {
      name: "Show user password icon",
      hint: "Show icon on toolbar",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true,
    });
    game.settings.register(config.moduleName, "showPWordContext", {
      name: "Show user context menu",
      hint: "Show user context menu on player",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      requiresReload: true,
    });
  }
  static updatePasswordDialog() {
    new Dialog({
      title: game.i18n.format("Update your password"),
      content: `<label for="new-password">${game.i18n.format(
        "Enter your new password."
      )}</label><input id="new-password" type="password"><label for="confirm-new-password">${game.i18n.format(
        "Confirm the new password."
      )}</label><input id="confirm-new-password" type="password">`,
      buttons: {
        apply: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.format("Apply new password"),
          callback: async (html) => {
            const newPassword = html.find("#new-password")[0].value;
            const confirmPassword = html.find("#new-password")[0].value;
            if (newPassword !== confirmPassword) {
              ui.notifications.error(
                "Passwords do not match.  Try again or cancel.",
                { localize: false }
              );
              return;
            }
            if (newPassword.length !== 0) {
              await game.user.update({ password: newPassword });
            }
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.format("Cancel"),
        },
      },
      default: "apply",
    }).render(true);
  }
}
