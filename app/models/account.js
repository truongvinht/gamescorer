// account.js
// Model object for ACCOUNT
// ==================

'user strict';

let TABLE = "ACCOUNT";

class Account {

    constructor(email, surname, firstname, password, status, playerId, id = 0) {
        this.id = id;
	    this.email = email;
	    this.surname = surname;
	    this.firstname = firstname;
	    this.password = password;
        this.status = status;
        this.playerId = playerId;
    }
    toString() {
        return `[${this.email}, ${this.surname}, ${this.firstname}, ${this.password}, ${this.status}, ${this.playerId}]`;
    }
    
    getAddSQL() {
        let sql = `INSERT INTO ${TABLE}(email, surname, firstname, password, status) VALUES('${this.email}','${this.surname}','${this.firstname}','${this.password}','${this.status}'`;
        return sql;           
    }

    getUpdateSQL(objectId) {
        let sql = `UPDATE ${TABLE} SET email='${this.email}', surname='${this.surname}', firstname='${this.firstname}', password='${this.password}', player_id='${this.playerId}' WHERE id = ${objectId}`;
        return sql;   
    }
 
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
};

module.exports = {
    Guild: Guild
};