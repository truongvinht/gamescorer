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
const s = require('./api/models/score');


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

/**
 * Check whether request is authorized (tmp workaround using tokens)
 * @param {*} req request
 * @param {*} res  ressource 
 * @param {*} next next callback
 */
function isAuthenticated(req, res, next) {
    // do any checks you want to in here
  
    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    // if (req.user.authenticated)

    let token = process.env.TOKEN || "";

    // ignore auth check
    if (token == "") {
        return next();
    }

    // same token
    if (req.body.token == token)
         return next();

    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    //res.redirect('/');
    res.send(JSON.stringify({"status": 401, "response": "UserUnauthorized"}));  
}

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
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError AccountAlreadyExist    Account could not be created, because email already exist
 * @apiError FailedCreating         Account could not be created
 */
router.post('/accounts',isAuthenticated, (req, res) => {

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
 * @apiParam {Number} account_id     Account unique id
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
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError AccountNotFound        No match found for given account id
 */
router.get("/accounts/:account_id",isAuthenticated, (req, res) => {
    let aid = req.params.account_id;
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
 * @api {put} /accounts/:account_id Update Account
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
 * @apiParam {Number}   account_id   Account unique id
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
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError AccountNotFound No match found for given account id
 */
router.put("/accounts/:account_id",isAuthenticated, (req, res) => {

    let aid = req.params.account_id;

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
                    //data.affectedRows
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


// GUILD
// =============================================================================

/**
 * @api {get} /guilds Read Guilds
 * @apiDescription Get all guilds for an Account
 * @apiName ReadGuilds
 * @apiVersion 1.0.0
 * @apiGroup Guild
 * 
 * @apiHeader {Number} account_id Account unique id, 
 * 
 * @apiSuccess {Object[]}   response    List of matching guilds
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError AccoundIdMissing Account id is mandatory for request
 * @apiError AccountNotFound No match found for given account id
 */
router.get('/guilds',isAuthenticated, function(req, res) {
    let account_id = req.body.account_id;

    if (account_id == undefined) {
        // get all guilds is not permitted
        res.send(JSON.stringify({"status": 403, "error": "accountId missing", "response": "AccoundIdMissing"})); 
    } else {
        // get all guilds for current account
        res.locals.connection.query(gp.GuildPermission.getAllForAccountSQL(account_id), function (error, results, fields) {
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
 * @apiHeader {Number}      account_id  Account unique id, 
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
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError AccoundIdMissing Account id is mandatory for request
 * @apiError CreateGuildFailed Guild creation failed
 * @apiError CreatePermissionFailed Permission creation failed
 */
router.post('/guilds',isAuthenticated, (req, res) => {
    let accountId = req.body.account_id;

    if (accountId==null) {
        // prevent create guilds without account associations
        res.send(JSON.stringify({"status": 403, "error": "accountId missing", "response": "AccoundIdMissing"})); 
    } else {

        let name = req.body.name;
        let tag = req.body.tag;

        let guild = new g.Guild(name, tag);

        res.locals.connection.query(guild.getAddSQL(),  function (guildErr, guildData) {
            if(guildErr){
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
 * @api {get} /guilds/:guild_id Read Guild
 * @apiDescription Read single guild data 
 * @apiName ReadGuild
 * @apiVersion 1.0.0
 * @apiGroup Guild
 * 
 * @apiParam {Number}       guild_id        Guild unique id, 
 * 
 * @apiSuccess {Object}     response        Guild object
 * @apiSuccess {Number}     response.id     Guild unique identifier
 * @apiSuccess {String}     response.name   Guild name
 * @apiSuccess {String}     response.tag    Guild tag
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError GuildNotFound No match found for given <code>guild_id<code>
 */
router.get("/guilds/:guild_id",isAuthenticated, (req, res) => {
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
 * @apiParam {Number}   guild_id    Guild unique id
 * 
 * @apiSuccess {Object}     response            Updated guild
 * @apiSuccess {Number}     response.id         Guild unique id
 * @apiSuccess {String}     response.name       Guild name
 * @apiSuccess {String}     response.tag        Guild tag
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError GuildNotFound No match found for given guild id
 */
router.put("/guilds/:guildId",isAuthenticated, (req, res) => {

    let gid = req.params.guild_id;
    let guild = new g.Guild(req.body.name, req.body.tag);

    res.locals.connection.query(guild.getUpdateSQL(gid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    response: data
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

/**
 * @api {get} /players Read Players
 * @apiDescription Get all players
 * @apiName ReadPlayers
 * @apiVersion 1.0.0
 * @apiGroup Player
 * 
 * @apiSuccess {Object[]}   response    List of all players
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError CantGetPlayers Could not get any players
 */
router.get('/players',isAuthenticated, function(req, res) {
    res.locals.connection.query(p.Player.getAllSQL(), function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 400, "error": error, "response": "CantGetPlayers"})); 
            //If there is error, we send the error in the error section with 500 status
        } else {
            //If there is no error, all is good and response is 200.
            res.status(200).json({
                response: results
            });
        }
    });
});

/**
 * @api {post} /players Create Player
 * @apiDescription Create a new player
 * @apiName CreatePlayer
 * @apiVersion 1.0.0
 * @apiGroup Player
 * 
 * @apiHeader {String}  name        Player name
 * @apiHeader {String}  game_id     Player ingame unique identifier
 * @apiHeader {Boolean} main        Player account is main account
 * 
 * @apiSuccess {Number} response    Created Player id
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError PlayerAlreadyExist     Player could not be created, because name already exist
 * @apiError FailedCreating         Player could not be created
 */
router.post('/players',isAuthenticated, (req, res) => {
    let player = new p.Player(req.body.name, req.body.game_id,req.body.main);
    res.locals.connection.query(player.getAddSQL(),  function (err, data) {
        if(err){
            if (err.code == "ER_DUP_ENTRY") {
                res.send(JSON.stringify({"status": 403, "error": err, "response": "PlayerAlreadyExist"})); 
            } else {
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
 * @api {post} /players/:player_id Read Player
 * @apiDescription Read exsting player data
 * @apiName ReadPlayer
 * @apiVersion 1.0.0
 * @apiGroup Player
 * 
 * @apiParam {Number}       player_id          Player unique id / Player ingame uuid
 * @apiParam {Number}       isUuid             activates uuid search instead of player id search (optional)
 * 
 * @apiSuccess {Object}     response           Player object
 * @apiSuccess {Number}     response.id        Player unique identifier
 * @apiSuccess {String}     response.name      Player name
 * @apiSuccess {String}     response.game_id   Player ingame unique identifier
 * @apiSuccess {Boolean}    response.main      Player account is main account
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError PlayerNotFound     No match found for given <code>player_id</code>
 */
router.get("/players/:player_id",isAuthenticated, (req, res) => {
    let pid = req.params.player_id;

    // check uuid flag
    if (req.body.hasOwnProperty('isUuid')) {
        if (isNaN(req.body.isUuid) && req.body.isUuid == 1) {
            
            res.locals.connection.query(p.Player.getByInGameIdSQL(pid), (err, data)=> {
                if(!err) {
                    if(data && data.length > 0) {
                        res.status(200).json({
                            player: data
                        });
                    } else {
                        res.send(JSON.stringify({"status": 404, "error": err, "response": "PlayerNotFound"})); 
                    }
                } else {
                    res.send(JSON.stringify({"status": 404, "error": err, "response": "PlayerNotFound"})); 
                }
            });   

            return;
        }
    } else {
        res.locals.connection.query(p.Player.getByIdSQL(pid), (err, data)=> {
            if(!err) {
                if(data && data.length > 0) {
                    res.status(200).json({
                        player: data
                    });
                } else {
                    res.send(JSON.stringify({"status": 404, "error": err, "response": "PlayerNotFound"})); 
                }
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "PlayerNotFound"})); 
            }
        });   
    }
 
});

/**
 * @api {put} /players/:player_id Update Player
 * @apiDescription Update exsting player data
 * @apiName UpdatePlayer
 * @apiVersion 1.0.0
 * @apiGroup Player
 * 
 * @apiHeader {String}  name        Player name
 * @apiHeader {String}  game_id     Player ingame unique identifier
 * @apiHeader {Boolean} main        Player account is main account
 * @apiHeader {Number}  account_id  Connect Player with chosen account id
 * 
 * @apiParam {Number}       player_id          Player unique id
 * 
 * @apiSuccess {Object}     response           Player object
 * @apiSuccess {Number}     response.id        Player unique identifier
 * @apiSuccess {String}     response.name      Player name
 * @apiSuccess {String}     response.game_id   Player ingame unique identifier
 * @apiSuccess {Boolean}    response.main      Player account is main account
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError PlayerNotFound     No match found for given <code>player_id</code>
 */
router.put("/players/:player_id",isAuthenticated, (req, res) => {

    let pid = req.params.player_id;
    let player = new p.Player(req.body.name, req.body.game_id,req.body.main);

    res.locals.connection.query(player.getUpdateSQL(pid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    response: data.affectedRows
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "PlayerNotFound"})); 
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "PlayerNotFound"})); 
        }
    });   
});


// GUILDLIST
// =============================================================================

/**
 * @api {get} /guilds/:guild_id/guildlists Read Guildlists
 * @apiDescription Read all guildlist entries for target guild
 * @apiName ReadGuildlists
 * @apiVersion 1.0.0
 * @apiGroup Guildlist
 * 
 * @apiParam {Number}       guild_id           Guild unique id
 * 
 * @apiSuccess {Object[]}     response         List of Guildlist
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError GuildlistNotLoaded     Could not load guildlist
 */
router.get('/guilds/:guild_id/guildlists', isAuthenticated,function(req, res) {

    let gid = req.params.guild_id;

    res.locals.connection.query(gl.Guildlist.getAllForGuild(gid), function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 400, "error": error, "response": "GuildlistNotLoaded"})); 
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.status(200).json({
                response: results
            });
        }
    });
});


/**
 * @api {post} /guilds/:guild_id/guildlists Create Guildlist
 * @apiDescription Create a new Guildlist entry
 * @apiName CreateGuildlist
 * @apiVersion 1.0.0
 * @apiGroup Guildlist
 * 
 * @apiHeader {Number}      player_id       Player unique identifier (player which joins guild)
 * @apiHeader {Boolean}     active          Player activity status
 * @apiHeader {String}      notes           Player info notes
 * 
 * @apiParam {Number}       guild_id        Target guild which a guildlist will be created for
 * 
 * @apiSuccess {Object}     response        Guildlist unique identifier
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError GuildlistAlreadyExist          Guildlist could not be created, because Guildlist already exist
 * @apiError FailedCreating                 Guildlist could not be created
 */
router.post('/guilds/:guild_id/guildlists',isAuthenticated, function(req, res) {

    res.locals.connection.query(gl.Guildlist.getGuildlist(req.params.guild_id, req.body.player_id),  function (err, data) {
        if(err){
            res.send(JSON.stringify({"status": 405, "error": err, "response": "FailedCreating"})); 
        } else {
            //request successful
            if (data.length > 0) {
                res.send(JSON.stringify({"status": 403, "error": "Guildlist already exist", "response": "GuildlistAlreadyExist"})); 
            } else {
                let guildlist = new gl.Guildlist(req.params.guild_id, req.body.player_id, req.body.active, req.body.notes);
                res.locals.connection.query(guildlist.getAddSQL(),  function (err, data) {
                    if(err){
                        res.send(JSON.stringify({"status": 405, "error": err, "response": "FailedCreating"})); 
                    } else {
                        res.status(200).json({
                            response: data.insertId
                        });
                    }
                });
            }
        }
    });
});

/**
 * @api {post} /guilds/:guild_id/guildlists/generate Generate Guildlists
 * @apiDescription Generate Guildlist objects based on matching rawdata
 * @apiName GenerateGuildlists
 * @apiVersion 1.0.0
 * @apiGroup Guildlist
 * 
 * @apiParam {Number}       guild_id        Target guild which a guildlist will be created for
 * 
 * @apiSuccess {Object}     response        Guildlist entries
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError FailedCreating                 Failed inserting  guildlists
 */
router.post('/guilds/:guild_id/guildlists/generate',isAuthenticated, function(req, res) {

    res.locals.connection.query(gl.Guildlist.autoGenerateGuildList(req.params.guild_id),  function (err, data) {
        if(err){
            res.send(JSON.stringify({"status": 405, "error": err, "response": "FailedCreating"})); 
        } else {
            res.status(200).json({
                response: data
            });
        }
    });
});


/**
 * @api {put} /guildlists/:guildlist_id Update Guildlist
 * @apiDescription Update exsting Guildlist data
 * @apiName UpdateGuildlist
 * @apiVersion 1.0.0
 * @apiGroup Guildlist
 * 
 * @apiHeader {Number}      player_id       Player unique identifier (player which joins guild)
 * @apiHeader {Boolean}     active          Player activity status
 * @apiHeader {String}      notes           Player info notes
 * 
 * @apiParam {Number}       guildlist_id    Guildlist unique id
 * 
 * @apiSuccess {Object}     response                Player object
 * @apiSuccess {Number}     response.player_id      Player unique identifier (player which joins guild)
 * @apiSuccess {Boolean}    response.active         Player activity status
 * @apiSuccess {String}     response.notes          Player info notes
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError GuildlistNotFound     No match found for given <code>guildlist_id</code>
 */
router.put('/guildlists/:guildlist_id',isAuthenticated, function(req, res) {
    let lid = req.params.guildlist_id;
    let guildlist = new gl.Guildlist(req.body.guild_id, req.body.player_id,req.body.active,req.body.notes);

    res.locals.connection.query(guildlist.getUpdateSQL(lid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    response: data.affectedRows
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "GuildlistNotFound"})); 
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "GuildlistNotFound"})); 
        }
    });   
});

/**
 * @api {delete} /guildlists/:guildlist_id Delete Guildlist
 * @apiDescription Delete Guildlist data
 * @apiName DeleteGuildlist
 * @apiVersion 1.0.0
 * @apiGroup Guildlist
 * 
 * @apiParam {Number}       guildlist_id    Guildlist unique id
 * 
 * @apiSuccess {String}     response        OK message
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError GuildlistNotFound     No match found for given <code>guildlist_id</code>
 */
router.delete('/guildlists/:guildlist_id',isAuthenticated, function(req, res) {
    let lid = req.params.guildlist_id;
    res.locals.connection.query(gl.Guildlist.deleteByIdSQL(lid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    response: "OK"
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "GuildlistNotFound"})); 
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "GuildlistNotFound"})); 
        }
    });   
});

// RAWDATA
// =============================================================================

/**
 * @api {get} /guilds/:guild_id/rawdatas Read Rawdatas
 * @apiDescription Read all rawdata entries for target guild
 * @apiName ReadRawdatas
 * @apiVersion 1.0.0
 * @apiGroup Rawdata
 * 
 * @apiParam {Number}       guild_id           Guild unique id
 * 
 * @apiSuccess {Object[]}     response         List of Rawdata
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError RawdataNotLoaded     Could not load Rawdata
 */
router.get('/guilds/:guild_id/rawdatas',isAuthenticated, function(req, res) {

    let gid = req.params.guild_id;

    res.locals.connection.query(r.Rawdata.getAllForGuildSQL(gid), function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 400, "error": error, "response": "RawdataNotLoaded"})); 
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.status(200).json({
                response: results
            });
        }
    });
});

/**
 * @api {post} /guilds/:guild_id/rawdatas Create Rawdata
 * @apiDescription Create a new Rawdata entry
 * @apiName CreateRawdata
 * @apiVersion 1.0.0
 * @apiGroup Rawdata
 * 
 * @apiHeader {Date}        date            Recording date 
 * @apiHeader {Number}      player_id       Scoring player
 * @apiHeader {Number}      value           Score
 * 
 * @apiParam {Number}       guild_id        Player collected score for target guild
 * 
 * @apiSuccess {Object}     response        Rawdata unique identifier
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError FailedCreating                 Rawdata could not be created
 */
router.post('/guilds/:guild_id/rawdatas',isAuthenticated, (req, res) => {
    let rawdata = new r.Rawdata(req.body.date, req.params.guild_id, req.body.player_id, req.body.value);
    res.locals.connection.query(rawdata.getAddSQL(),  function (err, data) {
        if(err){
            res.send(JSON.stringify({"status": 404, "error": error, "response": "FailedCreating"})); 
        } else {
            res.status(200).json({
                response: data.insertId
            });
        }
    });
});

/**
 * @api {get} /rawdatas/:rawdata_id Read Rawdata
 * @apiDescription Read exsting Rawdata
 * @apiName ReadRawdata
 * @apiVersion 1.0.0
 * @apiGroup Rawdata
 * 
 * @apiParam {Number}       rawdata_id         Rawdata unique id
 * 
 * @apiSuccess {Object}     response            Rawdata object
 * @apiSuccess {Date}       response.date       Rawdata recording date
 * @apiSuccess {Number}     response.player_id  Recording for target player
 * @apiSuccess {Number}     response.guild_id   Recording for target guild
 * @apiSuccess {Number}     response.value      Scoring
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError RawdataNotFound     No match found for given <code>rawdata_id</code>
 */
router.get("/rawdatas/:rawdata_id",isAuthenticated, (req, res) => {
    let rid = req.params.rawdata_id;
    res.locals.connection.query(r.Rawdata.getByIdSQL(rid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    response: data
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "RawdataNotFound"})); 
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "RawdataNotFound"})); 
        }
    }); 
});


// G_PERMISSION
// =============================================================================

/**
 * @api {post} /guilds/:guild_id/gpermission Create GPermission
 * @apiDescription Create GPermission for account
 * @apiName ReadGPermissions
 * @apiVersion 1.0.0
 * @apiGroup GPermission
 * 
 * @apiParam {Number}       guild_id           Guild unique id
 * 
 * @apiSuccess {Object[]}     response         List of Rawdata
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError PermissionAlreadyExist     Permission for account and target guild already exist
 * @apiError FailedCreating             Permission could not be created
 */
router.post('/guilds/:guild_id/gpermission',isAuthenticated, function(req, res) {

    let gid = req.params.guild_id;
    let gPermission = new gp.GuildPermission(req.body.account_id, gid, req.body.owner);

    res.locals.connection.query(gPermission.getAddSQL(), function (error, results, fields) {
        if(err){
            // permission already exist
            if (err.code == "ER_DUP_ENTRY") {
                // forbidden
                res.send(JSON.stringify({"status": 403, "error": err, "response": "PermissionAlreadyExist"}));  
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

// SCORE
// =============================================================================

/**
 * @api {get} /guilds/:guild_id/dates Read Score dates
 * @apiDescription Read recording dates for scoring
 * @apiName ReadScoreDates
 * @apiVersion 1.0.0
 * @apiGroup Score
 * 
 * @apiParam {Number}       guild_id                Guild unique id
 * 
 * @apiSuccess {Date}      response                Recording date
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError ScoresNotFound     No match found for given <code>guild_id</code>
 */
router.get("/guilds/:guild_id/dates",isAuthenticated, (req, res) => {

    let limit = req.body.limit;
    let gid = req.params.guild_id;

    res.locals.connection.query(s.Score.getRecordingDate(limit,gid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    response: data
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "ScoresNotFound"})); 
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "ScoresNotFound"})); 
        }
    }); 
});


/**
 * @api {get} /guilds/:guild_id/last_scores Read total Scores
 * @apiDescription Read total scores data from active guild members
 * @apiName ReadTotalScore
 * @apiVersion 1.0.0
 * @apiGroup Score
 * 
 * @apiParam {Number}       guild_id                Guild unique id
 * 
 * @apiSuccess {Object}     response                Score object
 * @apiSuccess {Boolean}    response.active         Active guild member
 * @apiSuccess {String}     response.notes          Internal notes about player 
 * @apiSuccess {Boolean}    response.player_id      Player unique id
 * @apiSuccess {Date}       response.joined_at      First recording date
 * @apiSuccess {Date}       response.value          Latest total recording value within guild
 * @apiSuccess {Number}     response.name           Player name
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError ScoresNotFound     No match found for given <code>guild_id</code>
 */
router.get("/guilds/:guild_id/guild_scores",isAuthenticated, (req, res) => {
    let gid = req.params.guild_id;

    res.locals.connection.query(s.Score.getScoreForGuildlistSQL(gid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    response: data
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "ScoresNotFound"})); 
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "ScoresNotFound"})); 
        }
    }); 
});

/**
 * @api {get} /guilds/:guild_id/last_scores Read recent Scores
 * @apiDescription Read recent scores data from active guild members
 * @apiName ReadRecentScore
 * @apiVersion 1.0.0
 * @apiGroup Score
 * 
 * @apiParam {Number}       guild_id                Guild unique id
 * 
 * @apiSuccess {Object}     response                Score object
 * @apiSuccess {Number}     response.player_id      Player unique id
 * @apiSuccess {String}     response.name           Player name
 * @apiSuccess {Boolean}    response.main           Main account
 * @apiSuccess {Date}       response.latest_date    Last record date
 * @apiSuccess {Date}       response.prev_date      Previous record date
 * @apiSuccess {Number}     response.score          Score between last and previous record
 * 
 * @apiError UserUnauthorized       Authorization failed, please try again
 * @apiError ScoresNotFound     No match found for given <code>guild_id</code>
 */
router.get("/guilds/:guild_id/last_scores",isAuthenticated, (req, res) => {
    let gid = req.params.guild_id;
    res.locals.connection.query(s.Score.getScoreForLastRecords(gid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    response: data
                });
            } else {
                res.send(JSON.stringify({"status": 404, "error": err, "response": "ScoresNotFound"})); 
            }
        } else {
            res.send(JSON.stringify({"status": 404, "error": err, "response": "ScoresNotFound"})); 
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