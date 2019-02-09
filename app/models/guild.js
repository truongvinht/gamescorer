// guild.js
// Model object for GUILD
// ==================

'user strict';

let TABLE = "GUILD";

/**
 * Guild for collecting scores
 * @class 
 * @module Guild
 */
class Guild {

    /**
     * Initalize new guild
     * @constructor 
     * @param {string} name name of guild
     * @param {string} tag  short guild tag
    */
    constructor(name, tag) {

        // varchar 255 | Default: None
        this.name = name;
        
        // varchar 10 | Default: None
	    this.tag = tag;
    }

    /**
     * String reprentation of the object
     * @return {string} string reprentation of the object with all attributes
     */
    toString() {
        return `[${this.name}, ${this.tag}]`;
    }
    
    /**
     * Create SQL query (Guild)
     * @return {string} query to create (Guild)
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