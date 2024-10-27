import * as config from "../Units/npaoconfig.js";
import { FoundryLogo } from "../Units/foundrylogo.js";
export class LandingPage {
  static goAroundTable() {
    declareActions();
  }
  static hideUI() {
    $("#sidebar").hide();
    $("#navigation").hide();
    $("#controls").hide();
    $("#players").hide();
    $("#hotbar").hide();
    FoundryLogo.hiddenInterface = true;
  }
}

async function declareActions() {
  let gmg = game.settings.settings.get("npao-core.gaming-table");
  let gmgs = gmg.Seats;
  for (let i = 1; i < 8; i++) {
    if (gmgs[i] != "") {
      NarratorTools.createChatMessage(
        "narration",
        gmgs[i] + ", declare your actions!"
      );
      const th = await createDialogforTable(gmgs[i]);
      console.log(th);
    }
  }
}

async function createDialogforTable(pcName) {
  try {
    proceed = await foundry.applications.api.DialogV2.prompt({
      screenY: "50",
      title: "Declare actions around table",
      content: "<p>Move to next player</p>",
      ok: {
        icon: "fas fa-forward",
        callback: () => console.log("Moved on..."),
      },
    });
  } catch {
    console.log("User did not make a guess.");
    return;
  }
}
