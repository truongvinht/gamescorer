// rawdata.js
// Model object for RAWDATA
// ==================

'user strict';

let TABLE = "RAWDATA";
let FOREIGN_TABLE_PLAYER = "PLAYER";
let FOREIGN_TABLE_GUILDLIST = "GUILDLIST";

/**
 * Rawdata for storing collected points of a player.
 * @class 
 * @module Rawdata
 */
class Rawdata {

    /**
     * Initalize new guildlist
     * @constructor 
     * @param {date} date           recording date
     * @param {number} guild_id     foreign key to guild
     * @param {number} player_id    foreign key to player
     * @param {number} value        achieved score for recording
    */
    constructor(date, guild_id,player_id, value) {

        // date | Default: None
        this.date = date;
        
        // int 32 | Default: None
        this.guild_id = guild_id;
        
        // int 32 | Default: None
        this.player_id = player_id;
        
        // double | Default: None
	    this.value = value;
    }

    /**
     * String reprentation of the object
     * @return {string} string reprentation of the object with all attributes
     */
    toString() {
        return `[${this.id}, ${this.date}, ${this.guild_id}, ${this.player_id}, ${this.value} ]`;
    }

    /**
     * Create SQL query (Rawdata)
     * @return {string} query to create (Rawdata)
     */
    getAddSQL() {
        let sql = `INSERT INTO ${TABLE}(date, guild_id, player_id, value) VALUES('${this.date}','${this.guild_id}',${this.player_id},${this.value})`;
        return sql;           
    }

    /**
     * Read SQL query for getting object with given object id (Rawdata)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading {Rawdata}
     */
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Query for getting all rawdata (Rawdata)
     * @static
     * @return {string} query for reading all {Rawdata}
     */
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
 
    /**
     * Query for getting all rawdata for a guild (Rawdata)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all {Rawdata}
     */
    static getAllForGuildSQL(objectId) {
        return Rawdata.getAllForPlayerInGuildSQL(objectId, null);   
    }
 
    /**
     * Query for getting all rawdata for a player (Rawdata)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all {Rawdata}
     */
    static getAllForPlayerSQL(objectId) {
        return Rawdata.getAllForPlayerInGuildSQL(null, objectId);           
    }
 
 
    /**
     * Query for getting all rawdata for a player and/or a guild (Rawdata)
     * @static
     * @param {number} guild_id  matching guild id
     * @param {number} player_id  matching player id
     * @return {string} query for reading all {Rawdata}
     */
    static getAllForPlayerInGuildSQL(guild_id, player_id) {
        if (player_id==null&&guild_id==null) {
            // fetch all
            return getAllSQL(); 
        }else if (player_id==null) {
            let sql = `SELECT * FROM ${TABLE} where guild_id = ${guild_id}`;
            return sql; 
        } else if (guild_id == null) {
            let sql = `SELECT * FROM ${TABLE} where player_id = ${player_id}`;
            return sql; 
        } else {
            let sql = `SELECT * FROM ${TABLE} where player_id = ${player_id} AND guild_id = ${guild_id}`;
            return sql; 
        }
    }

    /**
     * Query for getting all rawdata for a player and/or a guild (Rawdata)
     * @static
     * @param {number} guild_id  matching guild id
     * @return {string} query for reading all {Rawdata}
     */
    static getScoreForGuildlistSQL(guild_id) {
        let sql = `Select x.*, p.name FROM (
            (SELECT l.active, l.notes, d.* FROM GUILDLIST l LEFT JOIN 
            (SELECT DISTINCT player_id, date as 'joined_at', max(value) as value 
            FROM ${TABLE} WHERE guild_id = ${guild_id} GROUP BY player_id) d 
            ON l.player_id = d.player_id)) x LEFT JOIN PLAYER p ON p.id = x.player_id  
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
        SELECT DATE FROM ${TABLE} GROUP BY DATE ORDER BY DATE DESC LIMIT 1) dateNew LEFT JOIN (
        SELECT r.* FROM ${FOREIGN_TABLE_GUILDLIST} l LEFT JOIN ${TABLE} r ON l.player_id = r.player_id 
        WHERE l.guild_id = ${guild_id}) b ON dateNew.date = b.date 
        WHERE b.guild_id = ${guild_id} ORDER BY b.player_id) z RIGHT JOIN (
        SELECT b.date as 'prev_date', b.player_id as 'player_id', b.value as 'prev_value' FROM (
        SELECT * FROM (SELECT DATE FROM ${TABLE} GROUP BY DATE ORDER BY DATE DESC LIMIT 2) z ORDER BY DATE ASC LIMIT 1) a LEFT JOIN(
        SELECT r.* FROM ${FOREIGN_TABLE_GUILDLIST} l LEFT JOIN ${TABLE} r ON l.player_id = r.player_id 
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

        var guildSubquery = 'where guild_id = 1 ';
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
};

module.exports = {
    Rawdata: Rawdata
};