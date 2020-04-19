// Constants
const { welcome_message_header, role_data } = require('./bot_data.json');
const { token, guild_id } = require('./config.json');
const { Client, MessageEmbed } = require('discord.js');
const client = new Client();

// Set on bot ready
var welcomeMessage = '';
var guild;

//-----------------
// Helper functions
//-----------------

function welcomeMember(member) {
    let embed = new MessageEmbed()
        .setTitle('Welcome to the official DigiPen discord server!')
        .setColor(0xC41F37)
        .setDescription(welcomeMessage);

    // Send welcome message
    member.send(embed).then((msg) => {
        // Add emojis for reactions, can unfortunately take a while since we want them in order and need to wait
        // TODO: make this not ugly
        msg.react(role_data[0].emoji)
            .then(() => msg.react(role_data[1].emoji))
            .then(() => msg.react(role_data[2].emoji))
            .then(() => msg.react(role_data[3].emoji))
            .then(() => msg.react(role_data[4].emoji))
            .then(() => msg.react(role_data[5].emoji))
            .then(() => msg.react(role_data[6].emoji))
            .then(() => msg.react(role_data[7].emoji))
            .then(() => msg.react(role_data[8].emoji))
            .then(() => msg.react(role_data[9].emoji))
            .then(() => msg.react(role_data[10].emoji))
            // pronouns
            .then(() => msg.react(role_data[11].emoji))
            .then(() => msg.react(role_data[12].emoji))
            .then(() => msg.react(role_data[13].emoji))
            .catch(console.error);
    }).catch(console.error);
}

function findRoleByEmoji(emoji) {
    // Go over each role
    for (const e of role_data) {
        // Go to the next role if wrong emoji
        if (e.emoji !== emoji) {
            continue;
        }

        // Return role
        return guild.roles.cache.find(role => role.name === e.role_name);
    }
}

//---------------
// Event Handlers
//---------------

// Ready
client.on('ready', () => {
    console.log(`[info] Logged in as ${client.user.tag}!`);

    // Set guild
    guild = client.guilds.cache.get(guild_id);
    if (!guild) {
        console.error(`[fatal] Failed to find guild: ${guild_id}`);
        process.exit(1);
    }

    // Build welcome message
    welcomeMessage += welcome_message_header;
    for (const e of role_data) {
        welcomeMessage += `\n${e.emoji} -> ${e.role_description}`;
    }
});

// New member
client.on('guildMemberAdd', member => {
    welcomeMember(member);
});

// On message (for debug)
client.on('message', message => {
    if (message.content === '!welcomeme') {
        welcomeMember(message.author);
    }
});

// Reaction add
client.on('messageReactionAdd', (reaction, user) => {
    // Return if the reacting user is the bot, the message is from a guild, the author of the message is not the bot
    if (user.id === client.user.id || reaction.message.guild || reaction.message.author.id !== client.user.id) {
        return;
    }

    let role = findRoleByEmoji(reaction.emoji.name);
    if (!role) {
        console.log(`[warn] Failed to find role by emoji: ${reaction.emoji.name}`);
        return;
    }

    // Add the role
    guild.members.fetch(user).then(member => member.roles.add(role).catch(console.error)).catch(console.error);
});

// Reaction remove
client.on('messageReactionRemove', (reaction, user) => {
    // Return if the reacting user is the bot, the message is from a guild, the author of the message is not the bot
    if (user.id === client.user.id || reaction.message.guild || reaction.message.author.id !== client.user.id) {
        return;
    }

    let role = findRoleByEmoji(reaction.emoji.name);
    if (!role) {
        console.log(`[warn] Failed to find role by emoji: ${reaction.emoji.name}`);
        return;
    }

    // Remove the role
    guild.members.fetch(user).then(member => member.roles.remove(role).catch(console.error)).catch(console.error);
});

//------
// Login
//------

client.login(token);
