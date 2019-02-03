// player.js
// Model object for player
// ==================

'user strict';

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
        let sql = `INSERT INTO PLAYER(name, game_id, main) VALUES('${this.name}','${this.game_id}',${this.main})`;
        return sql;           
    }
 
    static getPlayerByIdSQL(prd_id) {
        let sql = `SELECT * FROM PLAYER WHERE id = ${prd_id}`;
        return sql;           
    }
 
    static deletePlayerByIdSQL(prd_id) {
        let sql = `DELETE FROM PLAYER WHERE id = ${prd_id}`;
        return sql;           
    }
 
    static getAllPlayerSQL() {
        let sql = `SELECT * FROM PLAYER`;
        return sql;           
    }
};

module.exports = {
    Player: Player
};