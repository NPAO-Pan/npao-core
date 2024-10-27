import * as config from "../Units/npaoconfig.js";
export class PauseIconSubmenu extends FormApplication {
  constructor() {
    super({});
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      closeOnSubmit: false,
      classes: ["form"],
      popOut: true,
      width: "550",
      height: "auto",
      template: `/modules/npao-core/templates/settings-submenu.html`,
      id: "npao-core-settings-submenu",
      title: "Alternative Pause Icon Settings",
      resizable: false,
    });
  }
  activateListeners(html) {
    super.activateListeners(html);
    const picker = $(".pi-picker-button", html);
    picker[0].addEventListener("click", async function () {
      new FilePicker({
        type: "image",
        callback: async function (imagePath) {
          $(".pi-path").val(imagePath);
        },
      }).render(true);
    });
  }
  getData() {
    let source = game.settings.get(config.moduleName, "pauseSettings");
    if (foundry.utils.isEmpty(source)) {
      source = {
        path: "icons/svg/clockwork.svg",
        opacity: 50,
        dimensionX: 128,
        dimensionY: 128,
        text: game.i18n.format("GAME.Paused"),
        textColor: "#EEEEEE",
        shadow: true,
        fontSize: 2,
      };
    }
    return source;
  }
  async _updateObject(event) {
    const button = event.submitter;
    if (button.name === "submit") {
      await game.settings.set(config.moduleName, "pauseSettings", {
        path: $(".npao-core.pi-path").val(),
        opacity: Number($(".npao-core.pi-opacity").val()),
        dimensionX: Number($(".npao-core.pi-dimensionX").val()),
        dimensionY: Number($(".npao-core.pi-dimensionY").val()),
        text: $(".npao-core.pi-text").val(),
        textColor: $(".npao-core.pi-text-color").val(),
        shadow: $(".npao-core.pi-shadow").prop("checked"),
        fontSize: $(".npao-core.pi-font-size").val(),
      });
      window.location.reload();
    }
  }
}
