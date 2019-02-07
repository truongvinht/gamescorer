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
        let sql = `INSERT INTO ${TABLE}(name, tag) VALUES('${this.name}','${this.tag}'`;
        return sql;           
    }

    getUpdateSQL(objectId) {
        let sql = `UPDATE ${TABLE} SET name='${this.name}', tag='${this.tag}' WHERE id = ${objectId}`;
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
    Guild: Guild
};