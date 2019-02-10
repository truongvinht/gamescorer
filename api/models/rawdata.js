// rawdata.js
// Model object for RAWDATA
// ==================

'user strict';

let TABLE = "RAWDATA";

class Rawdata {

    constructor(date, guild_id,player_id, value, id = 0) {
        this.id = id;
	    this.date = date;
	    this.guild_id = guild_id;
	    this.player_id = player_id;
	    this.value = value;
    }
    toString() {
        return `[${this.id}, ${this.date}, ${this.guild_id}, ${this.player_id}, ${this.value} ]`;
    }

    getAddSQL() {
        let sql = `INSERT INTO ${TABLE}(date, guild_id, player_id, value) VALUES('${this.date}','${this.guild_id}',${this.player_id},${this.value})`;
        return sql;           
    }
 
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;           
    }
 
    static getAllSQL() {
        let sql = `SELECT * FROM ${TABLE}`;
        return sql;           
    }
 
    static getAllForGuildSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} where guild_id = ${objectId}`;
        return sql;           
    }
 
    static getAllForPlayerSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} where player_id = ${objectId}`;
        return sql;           
    }
 
    static getAllForPlayerInGuildSQL(guildId,playerId) {
        if (playerId==null&&guildId==null) {
            // fetch all
            return getAllSQL(); 
        }else if (playerId==null) {
            let sql = `SELECT * FROM ${TABLE} where guild_id = ${guild_id}`;
            return sql; 
        } else if (guildId == null) {
            let sql = `SELECT * FROM ${TABLE} where player_id = ${player_id}`;
            return sql; 
        } else {
            let sql = `SELECT * FROM ${TABLE} where player_id = ${player_id} AND guild_id = ${guild_id}`;
            return sql; 
        }
    }
};

module.exports = {
    Rawdata: Rawdata
};