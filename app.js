// app.js
// Main file to launch server application
// ==================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
let mysql      = require("mysql");

const c = require('./services/configHandler');

const a = require('./api/models/account');
const p = require('./api/models/player');
const g = require('./api/models/guild');
const gp = require('./api/models/guildPermission');
const gl = require('./api/models/guildList');
const r = require('./api/models/rawdata');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// initialize db connection
app.use(function(req, res, next){
    res.setHeader('Content-Type', 'application/json');
	res.locals.connection = mysql.createConnection({
		host     : c.dbSettings().host,
		user     : c.dbSettings().user,
		password : c.dbSettings().password,
		database : c.dbSettings().database
	});
	next();
});


// ACCOUNT
// =============================================================================

/**
 * @api {post} /accounts Create Account
 * @apiName CreateAccount
 * @apiVersion 1.0.0
 * @apiGroup Account
 * 
 * @apiHeader {String} email email address for authentication
 * @apiHeader {String} surname user surename
 * @apiHeader {String} firstname user firstname
 * @apiHeader {String} password user password
 * @apiHeader {Object} birthdate user birthdate
 * @apiHeader {Number} verified account verified status
 * 
 * @apiSuccess {String} message Request status
 * @apiSuccess {String} account_id Created Account id 
 * 
 * @apiError AccountAlreadyExist Account could not be created, because email already exist
 * @apiError FailedCreating Account could not be created
 */
router.post('/accounts', (req, res) => {

    //input
    let email = req.body.email;
    let surname = req.body.surname;
    let firstname = req.body.firstname;
    let password = req.body.password;
    let birthdate = req.body.birthdate;

    //optional
    let verified = req.body.verified;

    let account = new a.Account(email, surname, firstname, password, birthdate,verified);
    res.locals.connection.query(account.getAddSQL(),  function (err, data) {
        if(err){
            // email already exist
            if (err.code == "ER_DUP_ENTRY") {
                // forbidden
                res.send(JSON.stringify({"status": 403, "error": err, "response": "AccountAlreadyExist"}));  
            } else {
                // all other errors
                res.send(JSON.stringify({"status": 405, "error": err, "response": "FailedCreating"})); 
            }
        } else {
            res.status(200).json({
                response: "Account added.",
                error: null,
                account_id: data.insertId
            });
        }
    });
});

/**
 * @api {get} /accounts/:accountId Read Account
 * @apiName ReadAccount
 * @apiVersion 1.0.0
 * @apiGroup Account
 * 
 * @apiParam {Number} accountId account unique id
 * 
 * @apiSuccess {String} message Request status
 * @apiSuccess {Object} account matching user account
 * 
 * @apiError AccountNotFound No match found for given account id
 */
router.get("/accounts/:accountId", (req, res) => {
    let aid = req.params.accountId;
    res.locals.connection.query(a.Account.getByIdSQL(aid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    response:"Account found.",
                    account: data
                });
            } else {
                res.status(404).json({
                    response: "Account Not found.",
                    error: err
                });
            }
        } 
    });    
});

/**
 * @api {put} /accounts/:accountId Update Account
 * @apiName UpdateAccount
 * @apiVersion 1.0.0
 * @apiGroup Account
 * 
 * @apiHeader {String} email email address for authentication
 * @apiHeader {String} surname user surename
 * @apiHeader {String} firstname user firstname
 * @apiHeader {String} password user password
 * @apiHeader {Object} birthdate user birthdate
 * @apiHeader {Number} verified account verified status
 * 
 * @apiParam {Number} accountId account unique id
 * 
 * @apiSuccess {String} message Request status
 * @apiSuccess {Object} updated user account
 * 
 * @apiError AccountNotFound No match found for given account id
 */
router.put("/accounts/:accountId", (req, res) => {

    let aid = req.params.accountId;

    let email = req.body.email;
    let surname = req.body.surname;
    let firstname = req.body.firstname;
    let password = req.body.password;
    let birthdate = req.body.birthdate;
    let status = req.body.status;

    let account = new a.Account(email, surname, firstname, password, birthdate, status, null);

    res.locals.connection.query(account.getUpdateSQL(aid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`Account updated.`,
                    account: data.affectedRows
                });
            } else {
                res.status(404).json({
                    message:"Account Not found.",
                    error: err
                });
            }
        } 
    });   
});

// GUILD
// =============================================================================

// READ ALL
router.get('/guilds', function(req, res) {
    let accountId = req.body.accountId;

    if (accountId == undefined) {
        // get all guilds is not permitted
        res.send(JSON.stringify({"status": 403, "error": "accountId missing", "response": null})); 
    } else {
        // get all guilds for current account
        res.locals.connection.query(gp.GuildPermission.getAllForAccountSQL(accountId), function (error, results, fields) {
            if(error){
                res.send(JSON.stringify({"status": 404, "error": error, "response": null})); 
            } else {
                res.status(200).json({
                    "status": 200,
                    "error": error,
                    response: results
                });
            }
        });
    }
});

// CREATE GUILD AND LINK PERMISSION
router.post('/guilds', (req, res) => {
    let accountId = req.body.accountId;

    if (accountId==null) {
        // prevent create guilds without account associations
        res.send(JSON.stringify({"status": 403, "error": "accountId missing"})); 
    } else {
        let guild = new g.Guild(req.body.name, req.body.tag);
        res.locals.connection.query(guild.getAddSQL(),  function (err, data) {
            if(err){
                res.send(JSON.stringify({"status": 404, "error": err, "response": null})); 
            } else {

                // trigger creating guild permission after creating guild
                let guildPermission = new gp.GuildPermission(accountId, data.insertId, true);
                res.locals.connection.query(guildPermission.getAddSQL(),  function (err, data) {
                    if(err){
                        res.send(JSON.stringify({"status": 404, "error": err, "response": null})); 
                    } else {
                        res.status(200).json({
                            message: "Guild added.",
                            guildpermission:guildPermission,
                            guildPermission_id: data.insertId
                        });
                    }
                });
            }
        });
    }
});

// READ SINGLE
router.get("/guilds/:guildId", (req, res) => {
    let gid = req.params.guildId;
    res.locals.connection.query(g.Guild.getByIdSQL(gid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    message:"Guild found.",
                    guild: data
                });
            } else {
                res.status(404).json({
                    message: "Guild Not found."
                });
            }
        } 
    });    
});

//UPDATE
router.put("/guilds/:guildId", (req, res) => {

    let gid = req.params.guildId;
    let guild = new g.Guild(req.body.name, req.body.tag);

    res.locals.connection.query(guild.getUpdateSQL(gid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`Guild updated.`,
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(404).json({
                    message:"Guild Not found."
                });
            }
        } 
    });   
});


// PLAYER
// =============================================================================

// READ ALL
router.get('/players', function(req, res) {
    res.locals.connection.query(p.Player.getAllSQL(), function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 404, "error": error, "response": null})); 
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
});

// CREATE
router.post('/players', (req, res) => {
    let player = new p.Player(req.body.name, req.body.game_id,req.body.main);
    res.locals.connection.query(player.getAddSQL(),  function (err, data) {
        if(err){
            res.send(JSON.stringify({"status": 404, "error": err, "response": null})); 
        } else {
            res.status(200).json({
                message:"Player added",
                playerId: data.insertId
            });
        }
    });
});

// READ SINGLE
router.get("/players/:playerId", (req, res) => {
    let pid = req.params.playerId;
    res.locals.connection.query(p.Player.getByIdSQL(pid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    message:"Player found",
                    player: data
                });
            } else {
                res.status(404).json({
                    message: "Player Not found."
                });
            }
        } 
    });    
});

//UPDATE
router.put("/players/:playerId", (req, res) => {

    let pid = req.params.playerId;
    let player = new p.Player(req.body.name, req.body.game_id,req.body.main);

    res.locals.connection.query(player.getUpdateSQL(pid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`Player updated`,
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(404).json({
                    message:"Player Not found"
                });
            }
        } 
    });   
});


// GUILDLIST
// =============================================================================

// READ ALL DATA
router.get('/guilds/:guildId/guildlist', function(req, res) {

    let gid = req.params.guildId;

    res.locals.connection.query(gl.GuildList.getAllForPlayerInGuildSQL(req.body.guildId,req.body.playerId), function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 404, "error": error, "response": null})); 
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
});


// RAWDATA
// =============================================================================

// READ ALL DATA
router.get('/rawdatas', function(req, res) {
    res.locals.connection.query(r.Rawdata.getAllForPlayerInGuildSQL(req.body.guildId,req.body.playerId), function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 404, "error": error, "response": null})); 
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
});

// CREATE
router.post('/rawdatas', (req, res) => {
    let rawdata = new r.Rawdata(req.body.date, req.body.guildId, req.body.playerId, req.body.value);
    res.locals.connection.query(rawdata.getAddSQL(),  function (err, data) {
        if(err){
            res.send(JSON.stringify({"status": 404, "error": err, "response": null})); 
        } else {
            res.status(200).json({
                message: "Rawdata added.",
                rawdata_id: data.insertId
            });
        }
    });
});

// READ SINGLE

/**
 * @apiIgnore Not finished Method
 * @api {get} /rawdatas/:rawdataId Getting rawdata by id
 */
router.get("/rawdatas/:rawdataId", (req, res) => {
    let rid = req.params.rawdataId;
    res.locals.connection.query(r.Rawdata.getByIdSQL(rid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    message:"Rawdata found",
                    rawdata: data
                });
            } else {
                res.status(404).json({
                    message: "Rawdata Not found."
                });
            }
        } 
    }); 
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Ready at Port ' + port);