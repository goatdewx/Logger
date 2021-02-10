const Discord = require("discord.js");
const twemoji = require("twemoji");
const fs = require("fs");
const moment = require("moment");
moment.locale("pt-br");

module.exports.run = async (client, message, args) => {

    message.delete();

    let messages = [];

    function multiMessages (msgs, body) {
        let primaryMessage = msgs[0];
        let messageTime = moment(primaryMessage.createdTimestamp).format('LLL');
        let listChat = '';
        
        msgs.forEach(async (dados, index) => {
            let chat = dados.content.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");;
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

            let replyContent = ''
            if (dados.reference != null) {
                let m = messages.map(function (m) { return m.id; }).indexOf(dados.reference.messageID)

                let replyID = 'Inválido';
                let replyIcon = 'https://cdn.discordapp.com/embed/avatars/0.png';
                let replyAuthorName = 'Indefinido';
                
                let svgIcon = `<svg class="repliedTextContentIcon-1ivTae" aria-hidden="false" width="20" height="20" viewBox="0 0 64 64"><path fill="currentColor" d="M56 50.6667V13.3333C56 10.4 53.6 8 50.6667 8H13.3333C10.4 8 8 10.4 8 13.3333V50.6667C8 53.6 10.4 56 13.3333 56H50.6667C53.6 56 56 53.6 56 50.6667ZM22.6667 36L29.3333 44.0267L38.6667 32L50.6667 48H13.3333L22.6667 36Z"></path></svg>`;
                let replyMessageContent = 'Clique para ver anexo';

                if (m != -1) {
                    let replyUser = client.users.cache.get(messages[m].author.id);
                    replyID = messages[m].id;
                    
                    if (replyUser) {
                        replyIcon = replyUser.displayAvatarURL({ dynamic: true });
                        replyAuthorName = replyUser.username;
                    }
                
                    if (messages[m].content != '') {
                        replyMessageContent = messages[m].content;
                    }
                }

                replyContent =  `
                    <div class="chatlog__reply-message">
                        <img src="${replyIcon}" alt="" class="chatlog__reply-avatar">
                        <span class="chatlog__author-name">${replyAuthorName}</span>
                        <div class="chatlog__replied-text-preview">
                            <div class="chatlog__replied-text-content"><em>${replyMessageContent}</em> </div>
                        </div>
                        ${svgIcon}
                    </div>
                `;
            }

            let attachments = "";
            if (dados.attachments.size != 0) {
                dados.attachments.forEach(attachment => {
                    if (attachment.attachment.endsWith("mp3")) {

                    }
                    attachments = `<div class="chatlog__attachment"><a href="${attachment.attachment}"><img class="chatlog__attachment-thumbnail" src="${attachment.attachment}"></a></div>`;
                })
            }
            let userBot = (primaryMessage.author.bot) ? `<span class="chatlog__bot-tag">BOT</span>` : "" ; 
            
            if (index == 0) {
                listChat = listChat + `
                <div class="chatlog__message-group group-start">
                    ${replyContent}
                    <div class="chatlog__messages">
                        <div class="chatlog__author-avatar-container">
                            <img class=chatlog__author-avatar src="${primaryMessage.author.displayAvatarURL({ dynamic: true })}">
                        </div>
                        <span class="chatlog__author-name" title="${primaryMessage.author.tag}" data-user-id="${primaryMessage.author.id}">
                            ${primaryMessage.author.username}
                        </span>
                        ${userBot}
                        <span class="chatlog__timestamp">
                            ${messageTime}
                        </span>
                        <div class="chatlog__content">
                            ${chat}
                        </div>
                            ${attachments}
                        <div class="chatlog__reactions">
                            <div class="chatlog__reactions">${reactions}</div>
                        </div>
                    </div>
                </div>                
                `;
            } else {
                listChat = listChat + `
                    <div class="chatlog__message-group">
                        ${replyContent}
                        <div class="chatlog__messages">
                            <div class="chatlog__message" id="message-${dados.id}" data-message-id="${dados.id}">
                                <span class="chatlog__timestamp compact-timestamp" title="${moment(dados.createdTimestamp).format('LLL')}">${moment(dados.createdTimestamp).format('LT')}</span>
                                <div class="chatlog__content">${chat}</div>
                                    ${attachments}
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

        [...msg].reverse().forEach(dado => {
            mf.push(dado[1]);
            messages.push(dado[1])
        });

        let list = [];
        for(var mc = 0; mc < mf.length; mc++){
            if(list.length > 0){
                if(list[list.length - 1].userID == mf[mc].author.id) {
                    if (list[list.length -1].timestamp + 420000 < mf[mc].createdTimestamp || mf[mc].reference != null) {
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

            fs.appendFile('./transcript/' + message.channel.id + '.html', data, async (err) => {
                if (err) return console.error(err);

                await message.channel.send({
                    files: [{
                        attachment: './transcript/' + message.channel.id + '.html',
                        name: 'mensagens.html'
                    }]
                })
                .catch(err => console.error(err))
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