// server.js
// Main file to launch server application
// ==================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
let mysql      = require("mysql");

const c = require('./app/controllers/configHandler');

var p = require('./app/models/player');


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
	res.locals.connection = mysql.createConnection({
		host     : c.dbSettings().host,
		user     : c.dbSettings().user,
		password : c.dbSettings().password,
		database : c.dbSettings().database
	});
	next();
});

// READ ALL
router.get('/players', function(req, res, next) {
    res.locals.connection.query('SELECT * from PLAYER', function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 400, "error": error, "response": null})); 
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
});

// CREATE
router.post('/player', (req, res) => {

    console.log("Player POST");
    //read player information from request
    let player = new p.Player(req.body.name, req.body.game_id,req.body.main);
 
    res.locals.connection.query(player.getAddPlayerSQL(),  function (err, data) {

        if(err){
            res.send(JSON.stringify({"status": 400, "error": err, "response": null})); 
        } else {
            res.status(200).json({
                message:"Player added.",
                playerId: data.insertId
            });
        }
    });
});

// READ SINGLE
router.get("/players/:playerId", (req, res) => {
    let pid = req.params.playerId;
 
    res.locals.connection.query(p.Player.getPlayerByIdSQL(pid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                
                res.status(200).json({
                    message:"Player found.",
                    product: data
                });
            } else {
                res.status(400).json({
                    message: "Player Not found."
                });
            }
        } 
    });    
});


//UPDATE
router.put("/player/:playerId", (req, res) => {

    let pid = req.params.playerId;
    let player = new p.Player(req.body.name, req.body.game_id,req.body.main);

    res.locals.connection.query(player.getUpdatePlayerSQL(pid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`Player updated.`,
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(400).json({
                    message:"Player Not found."
                });
            }
        } 
    });   
});

//DELETE
router.delete("/player", (req, res) => {

    var pid = req.body.playerId;

    res.locals.connection.query(p.Player.deletePlayerByIdSQL(pid), (err, data)=> {
        if(!err) {
            if(data && data.affectedRows > 0) {
                res.status(200).json({
                    message:`Player deleted with id = ${pid}.`,
                    affectedRows: data.affectedRows
                });
            } else {
                res.status(400).json({
                    message:"Player Not found."
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