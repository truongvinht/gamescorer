// rawdata.js
// Model object for RAWDATA
// ==================

'user strict';

let TABLE = "RAWDATA";

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
};

module.exports = {
    Rawdata: Rawdata
};