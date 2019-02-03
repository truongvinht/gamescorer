// player.js
// Model object for PLAYER
// ==================

'user strict';

let TABLE = "PLAYER";

class Player {

    constructor(name, game_id, main) {
        this.id = 0;
	    this.name = name;
	    this.game_id = game_id;
	    this.main = main;
    }
    toString() {
        return `[${this.id}, ${this.name}, ${this.game_id}, ${this.main}]`;
    }

    getAddPlayerSQL() {
        let sql = `INSERT INTO ${TABLE}(name, game_id, main) VALUES('${this.name}','${this.game_id}',${this.main})`;
        return sql;           
    }

    getUpdatePlayerSQL(playerId) {
        let sql = `UPDATE ${TABLE} SET name='${this.name}', game_id='${this.game_id}', main=${this.main} WHERE id = ${playerId}`;
        return sql;   
    }
 
    static getPlayerByIdSQL(playerId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${playerId}`;
        return sql;           
    }
 
    static deletePlayerByIdSQL(playerId) {
        let sql = `DELETE FROM ${TABLE} WHERE id = ${playerId}`;
        return sql;           
    }
 
    static getAllPlayerSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
};

module.exports = {
    Player: Player
};