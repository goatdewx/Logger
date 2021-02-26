const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {
    message.delete();
    message.channel.send(new Discord.MessageEmbed()
    .setAuthor("B 👨‍🦰", "https://img.ibxk.com.br/2020/01/30/30021141299110.jpg?w=1120&h=420&mode=crop&scale=both", "https://img.ibxk.com.br/2020/01/30/30021141299110.jpg?w=1120&h=420&mode=crop&scale=both")
    .setTitle("Teste 😋")
    .setDescription("<:mine:808365903665954877> Descrição foda 😎😎😍😛")
    .addFields([
        { name: 'Nome', value: 'Lucas', inline: true },
        { name: 'Idade', value: '15', inline: true },
        { name: 'Localização', value: 'Europa', inline: true},
        { name: 'Inline', value: 'Inline: false', inline: false },
        { name: 'Inline', value: 'Inline: false', inline: false },
    ])
    .setImage("https://img.ibxk.com.br/2020/01/30/30021141299110.jpg?w=1120&h=420&mode=crop&scale=both")
    .setURL("https://img.ibxk.com.br/2020/01/30/30021141299110.jpg?w=1120&h=420&mode=crop&scale=both")
    .setFooter("Footer", message.author.displayAvatarURL({ dynamic: true }))
    .setColor("#3498DB")
    .setThumbnail("https://img.ibxk.com.br/2020/01/30/30021141299110.jpg?w=1120&h=420&mode=crop&scale=both")
    )
}

module.exports.config = {
    name: 'embed',
    description: 'Usado para comer casadas',
    aliases: [],
    permissions: [],
    category: 'util',
    usage: []
}