Hooks.on("chatCommandsReady", (commands) => {
  commands.register({
    name: "/narrate",
    module: "_chatcommands",
    aliases: ["/n", "%%"],
    description: "Narrate a message for all to see",
    icon: "<class = 'fas fa-sticky-note'>",
    requiredRole: "GAMEMASTER",
    callback: (chat, parameters, messageData) => {
      console.log("Narrated!");
    },
  });
});
