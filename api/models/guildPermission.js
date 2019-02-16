// guildPermission.js
// Model object for G_PERMISSIOn
// ==================

'user strict';

let TABLE = "G_PERMISSION";
let FOREIGN_TABLE = "GUILD";

/**
 * Guild permission for handling guild access
 * @class 
 * @module GuildPermission
 */
class GuildPermission {

    /**
     * Initalize new guild permission
     * @constructor 
     * @param {number} account_id id of the linked account
     * @param {number} guild_id   id of the link guild
    */
    constructor(account_id, guild_id, owner) {

        // int 32 | Default: None
        this.account_id = account_id;
        
        // int 32 | Default: None
	    this.guild_id = guild_id;
        
        // tinyint | Default: 0
	    this.owner = owner;
    }

    /**
     * String reprentation of the object
     * @return {string} string reprentation of the object with all attributes
     */
    toString() {
        return `[${this.account_id}, ${this.guild_id}, ${this.owner}]`;
    }
    
    /**
     * Create SQL query (GuildPermission)
     * @return {string} query to create (GuildPermission)
     */
    getAddSQL() {
        let keys = `account_id, guild_id, owner`;
        let values = `${this.account_id},${this.guild_id},${this.owner}`;

        let sql = `INSERT INTO ${TABLE}(${keys}) VALUES(${values})`;
        return sql;        
    }

    /**
     * Update SQL query (GuildPermission)
     * @todo needs to separate every attribute update
     * @param {number} objectId table row item id
     * @return {string} query for updating {GuildPermission}
     */
    getUpdateSQL(objectId) {
        let param = `owner='${this.owner}'`;

        let sql = `UPDATE ${TABLE} SET ${param} WHERE id = ${objectId}`;
        return sql;   
    }
    
    /**
     * Read SQL query for getting object with given object id (GuildPermission)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading {GuildPermission}
     */
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Delete SQL query for target object (GuildPermission)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for deleting {GuildPermission}
     */
    static deleteByIdSQL(objectId) {
        let sql = `DELETE FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Query for getting all permissions (GuildPermission)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all {GuildPermission}
     */
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
 
    /**
     * Query for getting all permissions for an account (GuildPermission)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all for chosen account {GuildPermission}
     */
    static getAllForAccountSQL(objectId) {
        let sql = `SELECT g.id, name, tag FROM ${TABLE} INNER JOIN ${FOREIGN_TABLE} g ON g.id = guild_id where account_id = ${objectId}`;
        return sql;           
    }
};

module.exports = {
    GuildPermission: GuildPermission
};