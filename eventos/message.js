const Discord = require("discord.js");
const fs = require("fs");

const config = require("../config.json");

module.exports = async (client, message) => {
    if (message.author.bot || message.channel.type == 'dm') return;

    if (message.content.indexOf(config.PREFIXO) != 0) return;

    if (!message.channel.permissionsFor(message.guild.me).has(["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES"])) return console.log("Me faltam permissões");

    const args = message.content.slice(config.PREFIXO.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    fs.readdir('./comandos/', (err, files) => {
        if (err) return console.error(err);

        let file = files.filter(f => f.split(".").pop() == 'js');
        if (file.length == 0) return;

        file.forEach(f => {
            const comando = require('../comandos/' + f);
            if (!comando.config.aliases.includes(command) && !comando.config.name.includes(command)) return;
            if (comando.config.permissions != [] && !message.member.hasPermission(comando.config.permissions)) return message.channel.send("Não tens permissões suficientes para executar o comando.");
            comando.run(client, message, args);
        });
        
    })
};
