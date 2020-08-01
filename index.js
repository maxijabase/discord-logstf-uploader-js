//TODO: move from 'request' to 'got'

/* Dependencies */
const Discord = require('discord.js');
const client = new Discord.Client();

var request = require('request');
var mysql = require('mysql');

/* Variables */
let TOKEN = '';
let db_logid;
let api_logid;

/* Database stuff */
var connection = mysql.createConnection({
    host: 'localhost',
    database: 'test',
    user: 'root',
    password: '',
    port: '3306',
});

connection.connect(function(error) {
    if (error) throw error;
});

/* Begin interval */

setInterval(FetchAPI, 5000);

/* Fetch logs.tf API */

function FetchAPI() {
    request('http://logs.tf/api/v1/log?title=Legacy&limit=1&uploader=76561198179807307', function(error, response, body) {
        if (error) throw error;
        var data = JSON.parse(body);
        api_logid = data.logs[0].id;
        QueryDatabase();
    });
}

function QueryDatabase() {

    connection.query('SELECT log_id FROM discordlogs_ids ORDER BY entry DESC LIMIT 1;', function(error, result) {
        if (error) throw error;
        if (result[0] === undefined) {
            AddLatestLog();
            return;
        }
        db_logid = result[0].log_id;
        CompareIDS();
    })

};

function CompareIDS() {
    if (db_logid === api_logid) {
        console.log(`[DL] No new logs added! Equal.`);
        return;
    } else
        AddLatestLog();
}

function AddLatestLog() {
    connection.query(`INSERT INTO discordlogs_ids (log_id) VALUES (${api_logid});`, function(error, result) {
        if (error) throw error;
        console.log(`[DL] New log added: ${api_logid}`);
        //TODO: BroadcastLog();
    })
}

/* Discord */

const exampleEmbed = new Discord.MessageEmbed()

.setColor('#ff9001')
    .setTitle('Latest Log')
    .setURL(`https://logs.tf/${api_logid}`)
    .setTimestamp()

client.on('ready', () => {

    console.log(`Bot has connected as ${client.user.tag}`);

})

client.on('message', msg => {

    if (msg.content === 'messagetest')
        msg.channel.send(exampleEmbed);

})

client.login(TOKEN);
