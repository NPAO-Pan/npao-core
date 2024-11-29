export function hookDoorEvents() {
  // Replace the original mousedown handler with our custom one
  libWrapper.register(
    "npao-core",
    "DoorControl.prototype._onMouseDown",
    function (wrapped, event) {
      const eventHandled = onDoorMouseDown.call(this, event);
      if (eventHandled) return;
      return wrapped(event);
    },
    "MIXED"
  );
}
export function onDoorMouseDown(event) {
  // If the game is paused don't do anything if the current player isn't the gm
  if (game.paused && !game.user.isGM) return false;
  if (onDoorLeftClick.call(this)) return true;
  return false;
}

export function onDoorLeftClick() {
  // Check if this feature is enabled
  const theDoor = this.wall.document;
  const state = theDoor.ds;
  const states = CONST.WALL_DOOR_STATES;
  const doorId = theDoor._id;
  const pcName = canvas.tokens.controlled[0].name;
  // Only customize the response when the door is locked or open and the user isn't a GM.
  if (state == states.CLOSED || game.user.isGM) return false;

  // If the player is whitelisted in the CanUnlock flag, toggle a locked door to open and an open door to closed and locked
  if (!theDoor.getFlag("npao-core", "CanUnlock").includes(pcName)) return false;

  // Change the door's state accordingly
  if (state == states.OPEN) {
    theDoor.update({ ds: 2 });
  } else {
    theDoor.update({ ds: 1 });
  }
  return true;
}
