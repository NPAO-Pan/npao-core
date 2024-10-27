import * as config from "../Units/npaoconfig.js";
export class SyncTokenName {
  static RenameToken(a, c, d, u) {
    let syncIt = game.settings.get(config.moduleName, "tokenSyncToggle");
    if (syncIt == true && game.user.id == u && c.name !== undefined) {
      a.update({ "token.name": c.name });
      if (a.isToken) {
        canvas.tokens.get(a.token.id).data.update({ name: c.name });
      }
    }
  }
}
