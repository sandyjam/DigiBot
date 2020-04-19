// Constants
const { welcome_message_header, role_data } = require('./bot_data.json');
const { token, guild_id } = require('./config.json');
const { Client, MessageEmbed } = require('discord.js');
const client = new Client();

// Set on bot ready
var welcomeMessage = welcome_message_header;
var guild;

//-----------------
// Helper functions
//-----------------

function log(msg) {
    console.log(`[${new Date().toISOString()}]${msg}`);
}

function log_info(msg) {
    log(`[info] ${msg}`);
}

function log_warn(msg) {
    log(`[warn] ${msg}`);
}

function log_fatal(msg) {
    log(`[fatal] ${msg}`);
    process.exit(1);
}

async function welcomeMember(member) {
    log_info(`Welcoming ${member.tag}`);

    const embed = new MessageEmbed()
        .setTitle('Welcome to the official DigiPen discord server!')
        .setColor(0xC41F37)
        .setDescription(welcomeMessage);

    // Send welcome message
    const msg = await member.send(embed).catch(log_warn);

    // Add emojis for reactions, can unfortunately take a while since we want them in order and need to wait
    for (const e of role_data) {
        await msg.react(e.emoji).catch(log_warn);
    }
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
    log_info(`Logged in as ${client.user.tag}!`);

    // Set guild
    guild = client.guilds.cache.get(guild_id);
    if (!guild) {
        log_fatal(`Failed to find guild: ${guild_id}`);
    }

    // Build welcome message
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

    const role = findRoleByEmoji(reaction.emoji.name);
    if (!role) {
        log_warn(`Failed to find role by emoji: ${reaction.emoji.name}`);
        return;
    }

    // Add the role
    guild.members.fetch(user).then(member => member.roles.add(role).catch(log_warn)).catch(log_warn);
});

// Reaction remove
client.on('messageReactionRemove', (reaction, user) => {
    // Return if the reacting user is the bot, the message is from a guild, the author of the message is not the bot
    if (user.id === client.user.id || reaction.message.guild || reaction.message.author.id !== client.user.id) {
        return;
    }

    const role = findRoleByEmoji(reaction.emoji.name);
    if (!role) {
        log_warn(`Failed to find role by emoji: ${reaction.emoji.name}`);
        return;
    }

    // Remove the role
    guild.members.fetch(user).then(member => member.roles.remove(role).catch(log_warn)).catch(log_warn);
});

//------
// Login
//------

client.login(token);
