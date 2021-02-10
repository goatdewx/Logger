const Discord = require("discord.js");
const fs = require("fs");

const config = require('./config.json');

const client = new Discord.Client({
    ws: { Intents: new Discord.Intents(Discord.Intents.ALL) },
    partials: ["REACTION", "MESSAGE"]
})

fs.readdir('./eventos/', (err, files) => {
    if (err) return console.error(err);

    files.forEach(file => {
        const evento = require('./eventos/' + file);
        const name = file.split(".")[0];
        client.on(name, evento.bind(null, client));
    })
})

client.login(config.TOKEN)
.then(console.log("CONA"))
.catch(err => console.error(err));