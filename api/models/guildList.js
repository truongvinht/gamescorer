// guildList.js
// Model object for GUILDLIST
// ==================

'user strict';

let TABLE = "GUILDLIST";
let FOREIGN_TABLE = "PLAYER";
let FOREIGN_TABLE_RAWDATA = "RAWDATA";

/**
 * Guildlist for displaying members within guild (active and inactive).
 * @class 
 * @module Guildlist
 */
class Guildlist {

    /**
     * Initalize new guildlist
     * @constructor 
     * @param {string} guild_id      foreign key to guild
     * @param {string} player_id     foreign key to player
     * @param {number} active       active status or if false, inactive
     * @param {string} notes        further details about a player (e.g. name, location, remark)
    */
    constructor(guild_id, player_id, active, notes = null) {

        // int 32 | Default: None
        this.guild_id = guild_id;

        // int 32 | Default: None
        this.player_id = player_id;

        // tinyint | Default: 0
        this.active = active;
        
        // text | nullable | Default: null
	    this.notes = notes;
    }

    /**
     * String reprentation of the object
     * @return {string} string reprentation of the object with all attributes
     */
    toString() {
        return `[${this.guild_id}, ${this.player_id}, ${this.active}, ${this.notes}]`;
    }
    
    /**
     * Create SQL query (Guildlist)
     * @return {string} query to create (Guildlist)
     */
    getAddSQL() {
        let keys = `guild_id, player_id, active, notes`;
        let values = `${this.guild_id},${this.player_id},${this.active},'${this.notes}'`;

        let sql = `INSERT INTO ${TABLE}(${keys}) VALUES(${values})`;
        return sql;        
    }

    /**
     * Update SQL query (Guildlist)
     * @todo needs to separate every attribute update
     * @param {number} objectId table row item id
     * @return {string} query for updating {Guildlist}
     */
    getUpdateSQL(objectId) {
        let param1 = `guild_id=${this.guild_id}`;
        let param2 = `player_id=${this.player_id}`;
        let param3 = `active=${this.active}`;
        let param3 = `notes='${this.notes}'`;

        let sql = `UPDATE ${TABLE} SET ${param1}, ${param2}, ${param3}, ${param4} WHERE id = ${objectId}`;
        return sql;   
    }

    /**
     * Read SQL query for getting object with given object id (Guildlist)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading {Guildlist}
     */
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Delete SQL query for target object (Guildlist)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for deleting {Guildlist}
     */
    static deleteByIdSQL(objectId) {
        let sql = `DELETE FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Query for getting all guildlist entries (Guildlist)
     * @static
     * @return {string} query for reading all {Guildlist}
     */
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
 
    /**
     * Query for getting all guildlist entries for target guild (Guildlist) with player details
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all {Guildlist}
     */
    static getAllForGuild(objectId) {
        let sql = `SELECT ${TABLE}.*, p.name, p.game_id, p.main FROM ${TABLE} LEFT JOIN ${FOREIGN_TABLE} p ON p.id = player_id where guild_id = ${objectId}`;
        return sql;
    }
 
    /**
     * Query for getting player in guild
     * @static
     * @param {number} guild_id  Guild unique identifier
     * @param {number} player_id  Player unique identifier
     * @return {string} query for reading all {Guildlist}
     */
    static getGuildlist(guild_id, player_id) {
        let sql = `SELECT * FROM ${TABLE} where guild_id = ${guild_id} AND player_id = ${player_id}`;
        return sql;           
    }

    /**
     * Query for inserting new guildlist based on existing rawdata for a target guild
     * @static
     * @param {number} guild_id  Guild unique identifier
     * @return {string} query for inserting all missing rawdata entries
     */
    static autoGenerateGuildList(guild_id) {
        return `
        INSERT INTO ${TABLE} (guild_id, player_id, active) SELECT guild_id, player_id, 1 AS active 
        FROM ${FOREIGN_TABLE_RAWDATA} WHERE guild_id = ${guild_id} GROUP by player_id`;
    }
};

module.exports = {
    Guildlist: Guildlist
};