const Discord = require("discord.js");
const twemoji = require("twemoji");
const fs = require("fs");
const moment = require("moment");
moment.locale("pt-br");

module.exports.run = async (client, message, args) => {
    
    function parseMarkdown(markdownText) {
        const htmlText = markdownText
            .replace(/(```[a-z]*\n[\s\S]```)/g, `<br /><code class="pre--multiline">$1</code><br />`) // Bloco de codigo com multiplas linhas      
            .replace(/^>([\s\S]*?)\n$/g, `<br /><span class="quote">$1</span><br />`)
            .replace(/\*\*(.*)\*\*/gim, `<span class="markdown"><b>$1</b></span>`)         
            .replace(/\*(.*)\*/gim, `<span><em>$1</em></span>`) 
            .replace(/\~\~(.*)\~\~/gim, `<span><s>$1</s></span>`) 
            .replace(/\_\_(.*)\_\_/gim, `<span><u>$1</u></span>`) // underline 
            .replace(/(https?:\/\/[^\s]+)/g, "<a href='$1'>$1</a>") 
            .replace(/(http?:\/\/[^\s]+)/g, "<a href='$1'>$1</a>")
            .replace(/\n$/gim, '<br />') 
            .replace(/\|\|(.*)\|\|/gim, `<span class="spoiler">$1</span>`) 
            .replace(/\n/g, `<br />`) 
        return htmlText.trim()
    }

    function multiMessages (msgs, body) {
        let primaryMessage = msgs[0];
        let messageTime = moment(primaryMessage.createdTimestamp).format('LLL');
        let listChat = '';

        msgs.forEach((dados, index) => {
            let chat = parseMarkdown(dados.content);
            arrayMention = [];

            dados.mentions.users.forEach(mention => {
                chat = chat.replaceAll("<@!"+mention.id+">", `<span class="mention" title="${mention.tag}">@${mention.username}</span>`);
            });

            message.guild.emojis.cache.forEach(emoji => {
                if (emoji.animated == true) {
                    chat = chat.replaceAll('<a:' + message.guild.emojis.resolveIdentifier(emoji) + '>', `<img class="emoji--large" src=${emoji.url}>`);
                } else {
                    chat = chat.replaceAll('<:' + message.guild.emojis.resolveIdentifier(emoji) + '>', `<img class="emoji--large" src=${emoji.url}>`);
                }
            })

            chat = twemoji.parse(chat, {
                ext: '.png',
                className: "emoji"
            });

            reactions = "";
            if (dados.reactions) {
                dados.reactions.cache.forEach(reaction => { 
                    let emojiImage;
                    if (reaction._emoji.url) {  
                        emojiImage = `<img class="emoji--small" alt="${reaction.emoji.name}" title="${reaction.emoji.name}" src="${reaction._emoji.url}">`;
                    } else {
                        emojiImage = twemoji.parse(reaction._emoji.toString(), {
                            ext: '.png',
                            className: "emoji--small"
                        })
                    }
                    
                    let text = `
                        <div class="chatlog__reaction">
                            ${emojiImage}
                            <span class="chatlog__reaction-count">${reaction.count}</span>
                        </div>
                    `;
                    reactions = reactions + text;
                })
            }


            if (index == 0) {
                listChat = `
                    <div class="chatlog__message-group group-start">
                        <div class="chatlog__author-avatar-container">
                            <img class=chatlog__author-avatar src="${primaryMessage.author.displayAvatarURL({ dynamic: true })}">
                        </div>
                        <div class="chatlog__messages">
                            <span class="chatlog__author-name" title="${primaryMessage.author.tag}" data-user-id="${primaryMessage.author.id}">
                                ${primaryMessage.author.username}
                            </span>
                            <span class="chatlog__timestamp">
                                ${messageTime}
                            </span>
                            <div class="chatlog__content">
                                ${chat}
                            </div>
                            <div class="chatlog__reactions">
                                <div class="chatlog__reactions">${reactions}</div>
                            </div>
                        </div>
                    </div>                
                `;
            } else {
                listChat = listChat + `
                <div class="chatlog__message-group">
                    <div class="chatlog__messages">
                        <div class="chatlog__message" id="message-${dados.id}" data-message-id="${dados.id}">
                            <span class="chatlog__timestamp compact-timestamp" title="${moment(dados.createdTimestamp).format('LLL')}">${moment(dados.createdTimestamp).format('LT')}</span>
                            <div class="chatlog__content">${chat}</div>
                            <div class="chatlog__reactions">
                                <div class="chatlog__reactions">${reactions}</div>
                            </div>
                        </div>
                    </div>
                </div>
                `;                
            }
        });

        return body(listChat);

    }

    message.channel.messages.fetch({ limit: 100 })
    .then(msg => {
        let mf = [];

        [...msg].reverse().forEach(dado=>{
            mf.push(dado[1]);
        });

        let list = [];
        for(var mc = 0; mc < mf.length; mc++){
            if(list.length > 0){
                if(list[list.length - 1].userID == mf[mc].author.id) {
                    if (list[list.length -1].timestamp + 420000 < mf[mc].createdTimestamp) {
                        list.push({
                            userID: mf[mc].author.id,
                            indexes: [mf[mc]],
                            timestamp: mf[mc].createdTimestamp
                        });
                        continue;
                    } else {
                        let pl = list[list.length - 1].indexes;
                        list[list.length - 1].timestamp = mf[mc].createdTimestamp;
                        pl.push(mf[mc]);
                        continue;
                    }
                } else {
                    list.push({
                        userID: mf[mc].author.id,
                        indexes: [mf[mc]],
                        timestamp: mf[mc].createdTimestamp
                    });
                    continue;
                }
            } else {
                list.push({
                    userID: mf[mc].author.id,
                    indexes: [mf[mc]],
                    timestamp: mf[mc].createdTimestamp
                });
            }
        }

        let body = '';
        list.forEach(m => {
            multiMessages(m.indexes, text => {
                body = body + text;
            });
        });

        fs.readFile('./utilidades/arquivo-base.html', (err, data) => {
            if (err) return console.error(err);

            let icon = 'https://cdn.discordapp.com/embed/avatars/0.png';
            if (message.guild.icon) icon = message.guild.iconURL({ dynamic: true })

            data = data.toString()
            .replace('{{title}}', message.guild.name + ' | ' + message.channel.name)
            .replace('{{guild.name}}', message.guild.name)
            .replace('{{channel.name}}', message.channel.name)
            .replace('{{guild.icon}}', icon)
            .replace('{{messages.size}}', msg.size)
            .replace('{{body}}', body);

            fs.appendFile('./transcript/' + message.channel.id + '.html', data, (err) => {
                if (err) return console.error(err);

                message.channel.send({
                    files: [{
                        attachment: './transcript/' + message.channel.id + '.html',
                        name: 'mensagens.html'
                    }]
                })
                .catch(err => console.log("a"))
                // message.channel.send("Arquivo gerado e enviado com sucesso");

                fs.unlink('./transcript/' + message.channel.id + '.html', (err) => {
                    if (err) return console.log("Não consegui bater á punheta");
                });              
            });
        });
    })
    
}

module.exports.config = {
    name: 'comando',
    description: 'Usado para comer casadas',
    aliases: [],
    permissions: ["MANAGE_MESSAGES"],
    category: 'util',
    usage: []
}