// score.js
// Model object for SCORE (derived)
// ==================

'user strict';

let FOREIGN_TABLE_RAWDATA = "RAWDATA";
let FOREIGN_TABLE_PLAYER = "PLAYER";
let FOREIGN_TABLE_GUILDLIST = "GUILDLIST";

/**
 * Score for displaying scoring data in guild.
 * @class 
 * @module Score
 */
class Score {

    /**
     * Initalize new Score object (should be never used)
     * @constructor 
    */
    constructor() {}

    /**
     * Query for getting all rawdata for a player and/or a guild (Rawdata)
     * @static
     * @param {number} guild_id  matching guild id
     * @return {string} query for reading all {Rawdata}
     */
    static getScoreForGuildlistSQL(guild_id) {
        let sql = `Select x.*, p.name FROM (
            (SELECT l.active, l.notes, d.* FROM ${FOREIGN_TABLE_GUILDLIST} l LEFT JOIN 
            (SELECT DISTINCT player_id, date as 'joined_at', max(value) as value 
            FROM ${FOREIGN_TABLE_RAWDATA} WHERE guild_id = ${guild_id} GROUP BY player_id) d 
            ON l.player_id = d.player_id)) x LEFT JOIN ${FOREIGN_TABLE_PLAYER} p ON p.id = x.player_id  
            ORDER BY value DESC`;
            return sql;     
    }


    /**
     * Query for getting all last achieved score for a guild (Rawdata)
     * @static
     * @param {number} guild_id  matching guild id
     * @return {string} query for reading all {Rawdata}
     */
    static getScoreForLastRecords(guild_id) {
        let sql = `
        SELECT player_id, name, main, latest_date, prev_date, SUM(x.latest_value - x.prev_value) as 'score' 
        FROM ${FOREIGN_TABLE_PLAYER} RIGHT JOIN (
        SELECT y.player_id as 'player_id', z.latest_date as 'latest_date', z.latest_value as 'latest_value', y.prev_date as 'prev_date', y.prev_value as 'prev_value' FROM (
        SELECT b.date as 'latest_date', b.player_id as 'p_id', b.value as 'latest_value' FROM (
        SELECT DATE FROM ${FOREIGN_TABLE_RAWDATA} GROUP BY DATE ORDER BY DATE DESC LIMIT 1) dateNew LEFT JOIN (
        SELECT r.* FROM ${FOREIGN_TABLE_GUILDLIST} l LEFT JOIN ${FOREIGN_TABLE_RAWDATA} r ON l.player_id = r.player_id 
        WHERE l.guild_id = ${guild_id}) b ON dateNew.date = b.date 
        WHERE b.guild_id = ${guild_id} ORDER BY b.player_id) z RIGHT JOIN (
        SELECT b.date as 'prev_date', b.player_id as 'player_id', b.value as 'prev_value' FROM (
        SELECT * FROM (SELECT DATE FROM ${FOREIGN_TABLE_RAWDATA} GROUP BY DATE ORDER BY DATE DESC LIMIT 2) z ORDER BY DATE ASC LIMIT 1) a LEFT JOIN(
        SELECT r.* FROM ${FOREIGN_TABLE_GUILDLIST} l LEFT JOIN ${FOREIGN_TABLE_RAWDATA} r ON l.player_id = r.player_id 
        WHERE l.guild_id = ${guild_id}) b ON a.date = b.date 
        WHERE b.guild_id = ${guild_id} ORDER BY b.player_id) y 
        ON z.p_id = y.player_id) x 
        ON x.player_id = id GROUP BY x.player_id ORDER BY score DESC`;
        return sql;
    }

    /**
     * Query for getting recorded dates 
     * @static
     * @param {number} limit  max number of results
     * @param {number} guild_id  dates only restricted to guild id
     * @return {string} query for reading all recorded dates
     */
    static getRecordingDate(limit, guild_id = null) {

        var guildSubquery = `where guild_id = ${guild_id} `;
        if (guild_id == null) {
            guildSubquery = '';
        }

        if (limit == null || limit == 0) {
            // dates
            return `SELECT date FROM RAWDATA ${guildSubquery}GROUP BY date DESC`
        } else {
            return `SELECT date FROM RAWDATA ${guildSubquery}GROUP BY date DESC LIMIT ${limit}`
        }
    }

    static getPlayerHistory(guild_id, player_id) {
        return `SELECT p.id as 'player_id', p.name, data.guild_id, data.date, data.value 
        FROM ${FOREIGN_TABLE_PLAYER} p, (
            SELECT r.*, l.active 
            FROM ${FOREIGN_TABLE_GUILDLIST} l 
            LEFT JOIN ${FOREIGN_TABLE_RAWDATA} r 
            ON l.guild_id = r.guild_id 
            AND l.player_id = r.player_id ) data 
        WHERE p.id = data.player_id
        AND p.id = ${player_id}
        AND data.guild_id = ${guild_id}`;
    }
};

module.exports = {
    Score: Score
};