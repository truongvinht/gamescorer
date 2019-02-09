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
        let keys = `name, tag`;
        let values = `'${this.name}','${this.tag}'`;

        let sql = `INSERT INTO ${TABLE}(${keys}) VALUES(${values})`;
        return sql;        
    }

    /**
     * Update SQL query (Guild)
     * @todo needs to separate every attribute update
     * @param {number} objectId table row item id
     * @return {string} query for updating {Guild}
     */
    getUpdateSQL(objectId) {
        let param1 = `name='${this.name}'`;
        let param2 = `tag='${this.tag}'`;

        let sql = `UPDATE ${TABLE} SET ${param1}, ${param2} WHERE id = ${objectId}`;
        return sql;   
    }
    
    /**
     * Read SQL query for getting object with given object id (Guild)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading {Guild}
     */
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Delete SQL query for target object (Guild)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for deleting {Guild}
     */
    static deleteByIdSQL(objectId) {
        let sql = `DELETE FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Query for getting all guilds (Guild)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all {Guild}
     */
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
};

module.exports = {
    Guild: Guild
};