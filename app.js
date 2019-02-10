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
 * @apiDescription Create a new account
 * @apiName CreateAccount
 * @apiVersion 1.0.0
 * @apiGroup Account
 * 
 * @apiHeader {String}  email       Email address for authentication
 * @apiHeader {String}  surname     Account surename
 * @apiHeader {String}  firstname   Account firstname
 * @apiHeader {String}  password    Account password
 * @apiHeader {Date}    birthdate   Account birthdate
 * @apiHeader {Boolean} verified    Account verified status
 * 
 * @apiSuccess {String} response    Created Account id
 * 
 * @apiError AccountAlreadyExist    Account could not be created, because email already exist
 * @apiError FailedCreating         Account could not be created
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
                response: data.insertId
            });
        }
    });
});

/**
 * @api {get} /accounts/:accountId Read Account
 * @apiDescription Read existing account
 * @apiName ReadAccount
 * @apiVersion 1.0.0
 * @apiGroup Account
 * 
 * @apiParam {Number} accountId     Account unique id
 * 
 * @apiSuccess {Object}     response            Requested account object
 * @apiSuccess {Number}     response.id         Account unique identifier
 * @apiSuccess {String}     response.email      Account email
 * @apiSuccess {String}     response.surname    Account surname
 * @apiSuccess {String}     response.firstname  Account firstname
 * @apiSuccess {String}     response.password   Account password
 * @apiSuccess {Date}       response.birthdate  Account birthdate
 * @apiSuccess {Boolean}    response.verified   Account verified status
 * 
 * @apiError AccountNotFound        No match found for given account id
 */
router.get("/accounts/:accountId", (req, res) => {
    let aid = req.params.accountId;
    res.locals.connection.query(a.Account.getByIdSQL(aid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    response: data
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "AccountNotFound"}));
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "AccountNotFound"}));
        }
    });    
});

/**
 * @api {put} /accounts/:accountId Update Account
 * @apiDescription Update existing account data
 * @apiName UpdateAccount
 * @apiVersion 1.0.0
 * @apiGroup Account
 * 
 * @apiHeader {String}  email       Email address for authentication
 * @apiHeader {String}  surname     Account surename
 * @apiHeader {String}  firstname   Account firstname
 * @apiHeader {String}  password    Account password
 * @apiHeader {Date}    birthdate   Account birthdate
 * @apiHeader {Boolean} verified    Account verified status
 * 
 * @apiParam {Number}   accountId   Account unique id
 * 
 * @apiSuccess {Object}     response            Updated user account
 * @apiSuccess {Number}     response.id         Account unique identifier
 * @apiSuccess {String}     response.email      Account email
 * @apiSuccess {String}     response.surname    Account surname
 * @apiSuccess {String}     response.firstname  Account firstname
 * @apiSuccess {String}     response.password   Account password
 * @apiSuccess {Date}       response.birthdate  Account birthdate
 * @apiSuccess {Boolean}    response.verified   Account verified status
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
                    response:data.affectedRows
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "AccountNotFound"}));
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "AccountNotFound"}));
        }
    });   
});

// GUILD
// =============================================================================


/**
 * @api {get} /guilds Read Guilds
 * @apiDescription Get guilds which are available for account
 * @apiName ReadGuilds
 * @apiVersion 1.0.0
 * @apiGroup Guild
 * 
 * @apiHeader {Number} accountId account unique id, 
 * 
 * @apiSuccess {Object[]}   response    List of matching guilds
 * 
 * @apiError AccoundIdMissing Account id is mandatory for request
 * @apiError AccountNotFound No match found for given account id
 */
router.get('/guilds', function(req, res) {
    let accountId = req.body.accountId;

    if (accountId == undefined) {
        // get all guilds is not permitted
        res.send(JSON.stringify({"status": 403, "error": "accountId missing", "response": "AccoundIdMissing"})); 
    } else {
        // get all guilds for current account
        res.locals.connection.query(gp.GuildPermission.getAllForAccountSQL(accountId), function (error, results, fields) {
            if(error){
                res.send(JSON.stringify({"status": 404, "error": error, "response": "AccountNotFound"})); 
            } else {
                res.status(200).json({
                    response: results
                });
            }
        });
    }
});


/**
 * @api {post} /guilds Create Guild
 * @apiDescription Create a guild with access right for editing
 * @apiName CreateGuild
 * @apiVersion 1.0.0
 * @apiGroup Guild
 * 
 * @apiHeader {String}      name        Guild name
 * @apiHeader {String}      tag         Guild tag
 * @apiHeader {Number}      accountId   Account unique id, 
 * 
 * @apiSuccess {Object}     guild                       Guild object
 * @apiSuccess {Number}     guild.id                    Guild unique identifier
 * @apiSuccess {String}     guild.name                  Guild name
 * @apiSuccess {String}     guild.tag                   Guild tag
 * @apiSuccess {Object}     guildPermission             Permission for guild object
 * @apiSuccess {Number}     guildPermission.id          GuildPermission unique identifier
 * @apiSuccess {Date}       guildPermission.created_at  GuildPermission creation date
 * @apiSuccess {Number}     guildPermission.guild_id    Foreign key to guild
 * @apiSuccess {Number}     guildPermission.account_id  Foreign key to account
 * @apiSuccess {Boolean}    guildPermission.owner       Flag for ownership of guild
 * 
 * @apiError AccoundIdMissing Account id is mandatory for request
 * @apiError CreateGuildFailed Guild creation failed
 * @apiError CreatePermissionFailed Permission creation failed
 */
router.post('/guilds', (req, res) => {
    let accountId = req.body.accountId;

    if (accountId==null) {
        // prevent create guilds without account associations
        res.send(JSON.stringify({"status": 403, "error": "accountId missing", "response": "AccoundIdMissing"})); 
    } else {

        let name = req.body.name;
        let tag = req.body.tag;

        let guild = new g.Guild(name, tag);

        res.locals.connection.query(guild.getAddSQL(),  function (guildErr, guildData) {
            if(err){
                res.send(JSON.stringify({"status": 400, "error": guildErr, "response": "CreateGuildFailed"})); 
            } else {

                // trigger creating guild permission after creating guild
                let guildPermission = new gp.GuildPermission(accountId, data.insertId, true);
                res.locals.connection.query(guildPermission.getAddSQL(),  function (err, data) {
                    if(err){
                        res.send(JSON.stringify({"status": 400, "error": err, "response": "CreatePermissionFailed"})); 
                    } else {
                        res.status(200).json({
                            guild: guildData,
                            guildPermission:guildPermission
                        });
                    }
                });
            }
        });
    }
});

/**
 * @api {get} /guilds/:guildId Read Guild
 * @apiDescription Read single guild data 
 * @apiName ReadGuild
 * @apiVersion 1.0.0
 * @apiGroup Guild
 * 
 * @apiParam {Number}       guildId         Guild unique id, 
 * 
 * @apiSuccess {Object}     guild           Guild object
 * @apiSuccess {Number}     guild.id        Guild unique identifier
 * @apiSuccess {String}     guild.name      Guild name
 * @apiSuccess {String}     guild.tag       Guild tag
 * 
 * @apiError GuildNotFound No match found for given <code>guildId<code>
 */
router.get("/guilds/:guildId", (req, res) => {
    let gid = req.params.guildId;
    res.locals.connection.query(g.Guild.getByIdSQL(gid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    response: data
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": error, "response": "GuildNotFound"})); 
            }
        } 
    });    
});


/**
 * @api {put} /guilds/:guildId Update Guild
 * @apiDescription Update existing guild data
 * @apiName UpdateGuild
 * @apiVersion 1.0.0
 * @apiGroup Guild
 * 
 * @apiHeader {String}  name        Updated guild name
 * @apiHeader {String}  tag         Updated guild tag
 * 
 * @apiParam {Number}   guildId     Guild unique id
 * 
 * @apiSuccess {Object}     response            Updated guild
 * @apiSuccess {Number}     response.id         Guild unique id
 * @apiSuccess {String}     response.name       Guild name
 * @apiSuccess {String}     response.tag        Guild tag
 * 
 * @apiError GuildNotFound No match found for given guild id
 */
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
                res.send(JSON.stringify({"status": 404, "error": error, "response": "GuildNotFound"})); 
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": error, "response": "GuildNotFound"})); 
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