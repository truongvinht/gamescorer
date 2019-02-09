// server.js
// Main file to launch server application
// ==================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
let mysql      = require("mysql");

const c = require('./app/controllers/configHandler');

const a = require('./app/models/account');
const p = require('./app/models/player');
const g = require('./app/models/guild');
const gp = require('./app/models/guildPermission');
const r = require('./app/models/rawdata');


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

// CREATE
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
                res.send(JSON.stringify({"status": 403, "error": err, "response": null}));  
            } else {
                // all other errors
                res.send(JSON.stringify({"status": 405, "error": err, "response": null})); 
            }
        } else {
            res.status(200).json({
                message: "Account added.",
                account_id: data.insertId
            });
        }
    });
});

// READ SINGLE
router.get("/accounts/:accountId", (req, res) => {
    let aid = req.params.accountId;
    res.locals.connection.query(a.Account.getByIdSQL(aid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                res.status(200).json({
                    message:"Account found.",
                    account: data
                });
            } else {
                res.status(404).json({
                    message: "Account Not found."
                });
            }
        } 
    });    
});

//UPDATE
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

// GUILD
// =============================================================================

// READ ALL
router.get('/guilds', function(req, res) {
    let accountId = req.body.accountId;

    if (accountId == undefined) {
        // get all guilds
        res.locals.connection.query(g.Guild.getAllSQL(), function (error, results, fields) {
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

//DELETE
router.delete("/players/:playerId", (req, res) => {
    var pid = req.body.playerId;
    res.locals.connection.query(p.Player.deleteByIdSQL(pid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`Player deleted with id = ${pid}.`,
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