// account.js
// Model object for ACCOUNT
// ==================

'user strict';

let TABLE = "ACCOUNT";

/**
 * User account which manage guild and player data
 * @class 
 * @module Account
 */
class Account {

    /**
     * Initalize new account
     * @constructor 
     * @param {string} email        email of current account
     * @param {string} surname      surname of user
     * @param {string} firstname    firstname of user
     * @param {string} password     password for login user
     * @param {date}   birthdate    birthdate of user
     * @param {number} verified     account is verified (by email)
     */
    constructor(email, surname, firstname, password, birthdate, verified = 0) {

        // varchar 255 | Default: None
        this.email = email;
        
        // varchar 255 | nullable | Default: null
        this.surname = surname;
        
        // varchar 255 | nullable | Default: null
	    this.firstname = firstname;
        
        // varchar 255 | nullable | Default: null
        this.password = password;
        
        // date | nullable | Default: null
        this.birthdate = birthdate;

        // tinyint | Default: 0
        this.verified = verified;
    }

    /**
     * String reprentation of the object
     * @return {string} string reprentation of the object with all attributes
     */
    toString() {
        return `[${this.email}, ${this.surname}, ${this.firstname}, ${this.password}, ${this.birthdate}, ${this.verified}]`;
    }
    
    /**
     * Create SQL query (Account)
     * @return {string} query to create (Account)
     */
    getAddSQL() {

        let keys = `email, surname, firstname, password, birthdate, verified`;
        let values = `'${this.email}','${this.surname}','${this.firstname}','${this.password}',${this.birthdate},${this.verified}`;

        let sql = `INSERT INTO ${TABLE}(${keys}) VALUES(${values})`;
        return sql;           
    }

    /**
     * Update SQL query (Account)
     * @todo needs to separate every attribute update
     * @param {number} objectId table row item id
     * @return {string} query for updating {Account}
     */
    getUpdateSQL(objectId) {
        
        let param1 = `email='${this.email}'`;
        let param2 = `surname='${this.surname}'`;
        let param3 = `firstname='${this.firstname}'`;
        let param4 = `password='${this.password}'`;
        let param5 = `birthdate=${this.birthdate}`;
        let param6 = `verified=${this.verified}`;

        let sql = `UPDATE ${TABLE} SET ${param1}, ${param2}, ${param3}, ${param4}, ${param5}, ${param6} WHERE id = ${objectId}`;
        return sql;   
    }
    
    /**
     * Read SQL query for getting object with given object id (Account)
     * @static
     * @param {number} objectId  table row item id
     * @return {string} query for reading {Account}
     */
    static getByIdSQL(objectId) {
        let sql = `SELECT * FROM ${TABLE} WHERE id = ${objectId}`;
        return sql;
    }
};

module.exports = {
    Account: Account
};