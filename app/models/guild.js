// guild.js
// Model object for GUILD
// ==================

'user strict';

let TABLE = "GUILD";

class Guild {

    constructor(name, tag, id = 0) {
        this.id = id;
	    this.name = name;
	    this.tag = tag;
    }
    toString() {
        return `[${this.id}, ${this.name}, ${this.tag}]`;
    }
    
    getAddSQL() {
        let sql = `INSERT INTO ${TABLE}(name, game_id, main) VALUES('${this.name}','${this.game_id}',${this.main})`;
        return sql;           
    }

    getUpdateSQL(playerId) {
        let sql = `UPDATE ${TABLE} SET name='${this.name}', game_id='${this.game_id}', main=${this.main} WHERE id = ${playerId}`;
        return sql;   
    }
 
    static getByIdSQL(playerId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${playerId}`;
        return sql;           
    }
 
    static deleteByIdSQL(playerId) {
        let sql = `DELETE FROM ${TABLE} WHERE id = ${playerId}`;
        return sql;           
    }
 
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
};

module.exports = {
    Guild: Guild
};