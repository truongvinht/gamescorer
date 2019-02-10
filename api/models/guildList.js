// guildList.js
// Model object for GUILDLIST
// ==================

'user strict';

let TABLE = "GUILDLIST";

/**
 * Guildlist for displaying members within guild (active and inactive).
 * @class 
 * @module GuildList
 */
class GuildList {

    /**
     * Initalize new guildlist
     * @constructor 
     * @param {string} guildId      foreign key to guild
     * @param {string} playerId     foreign key to player
     * @param {number} active       active status or if false, inactive
     * @param {string} notes        further details about a player (e.g. name, location, remark)
    */
    constructor(guildId, playerId, active, notes = null) {

        // int 32 | Default: None
        this.guildId = guildId;

        // int 32 | Default: None
        this.playerId = playerId;

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
        return `[${this.guildId}, ${this.playerId}, ${this.active}, ${this.notes}]`;
    }
    
    /**
     * Create SQL query (GuildList)
     * @return {string} query to create (GuildList)
     */
    getAddSQL() {
        let keys = `guildId, playerId, active, notes`;
        let values = `${this.guildId},${this.playerId},${this.active},'${this.notes}'`;

        let sql = `INSERT INTO ${TABLE}(${keys}) VALUES(${values})`;
        return sql;        
    }

    /**
     * Update SQL query (GuildList)
     * @todo needs to separate every attribute update
     * @param {number} objectId table row item id
     * @return {string} query for updating {GuildList}
     */
    getUpdateSQL(objectId) {
        let param1 = `guildId=${this.guildId}`;
        let param2 = `playerId=${this.playerId}`;
        let param3 = `active=${this.active}`;
        let param3 = `notes='${this.notes}'`;

        let sql = `UPDATE ${TABLE} SET ${param1}, ${param2}, ${param3}, ${param4} WHERE id = ${objectId}`;
        return sql;   
    }
    
    /**
     * Read SQL query for getting object with given object id (GuildList)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading {GuildList}
     */
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Delete SQL query for target object (GuildList)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for deleting {GuildList}
     */
    static deleteByIdSQL(objectId) {
        let sql = `DELETE FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Query for getting all guilds (GuildList)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all {GuildList}
     */
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
 
    /**
     * Query for getting all guilds (GuildList)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all {GuildList}
     */
    static getAllForGuild(objectId) {
        let sql = `SELECT * FROM ${TABLE} where guild_id = ${objectId}`;
        return sql;           
    }
};

module.exports = {
    GuildList: GuildList
};