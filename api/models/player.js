// player.js
// Model object for PLAYER
// ==================

'user strict';

let TABLE = "PLAYER";

/**
 * Player or member within a guild
 * @class 
 * @module Player
 */
class Player {

    /**
     * Initalize new Player
     * @constructor 
     * @param {string} name         name of player
     * @param {string} game_id      ingame uuid
     * @param {number} main         flag for main account
    */
    constructor(name, game_id, main) {

        //varchar 255 | Default: None
        this.name = name;
        
        //varchar 255 | nullable | Default: null
        this.game_id = game_id;
        
        //tinyint | Default: 1
	    this.main = main;
    }

    /**
     * String reprentation of the object
     * @return {string} string reprentation of the object with all attributes
     */
    toString() {
        return `[${this.name}, ${this.game_id}, ${this.main}]`;
    }

    /**
     * Create SQL query (Player)
     * @return {string} query to create (Player)
     */
    getAddSQL() {
        let keys = `name, game_id, main`;
        let values = `'${this.name}','${this.game_id}',${this.main}`;

        let sql = `INSERT INTO ${TABLE}(${keys}) VALUES(${values})`;
        return sql;     
    }

    /**
     * Update SQL query (Player)
     * @todo needs to separate every attribute update
     * @param {number} objectId table row item id
     * @return {string} query for updating {Player}
     */
    getUpdateSQL(objectId) {
        let param1 = `name='${this.name}'`;
        let param2 = `game_id='${this.game_id}'`;
        let param3 = `main=${this.main}`;

        let sql = `UPDATE ${TABLE} SET ${param1}, ${param2}, ${param3} WHERE id = ${objectId}`;
        return sql;  
    }
    
    /**
     * Read SQL query for getting object with given object id (Player)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading {Player}
     */
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
    
    /**
     * Read SQL query for getting player with ingame id (Player)
     * @static
     * @param {number} objectId  in game uuid
     * @return {string} query for reading {Player}
     */
    static getByInGameIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE game_id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Delete SQL query for target object (Player)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for deleting {Player}
     */
    static deleteByIdSQL(objectId) {
        let sql = `DELETE FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    /**
     * Query for getting all guilds (Player)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading all {Player}
     */
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
};

module.exports = {
    Player: Player
};