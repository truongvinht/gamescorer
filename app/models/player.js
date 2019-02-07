// player.js
// Model object for PLAYER
// ==================

'user strict';

let TABLE = "PLAYER";

class Player {

    constructor(name, game_id, main, id = 0) {
        this.id = id;
	    this.name = name;
	    this.game_id = game_id;
	    this.main = main;
    }
    toString() {
        return `[${this.id}, ${this.name}, ${this.game_id}, ${this.main}]`;
    }

    getAddSQL() {
        let sql = `INSERT INTO ${TABLE}(name, game_id, main) VALUES('${this.name}','${this.game_id}',${this.main})`;
        return sql;           
    }

    getUpdateSQL(objectId) {
        let sql = `UPDATE ${TABLE} SET name='${this.name}', game_id='${this.game_id}', main=${this.main} WHERE id = ${objectId}`;
        return sql;   
    }
 
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    static deleteByIdSQL(objectId) {
        let sql = `DELETE FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
};

module.exports = {
    Player: Player
};