// server.js
// Main file to launch server application
// ==================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

var p = require('./app/models/player');

const c = require('./app/controllers/configHandler');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
// router.get('/', function(req, res) {
//     res.json({ message: 'hooray! welcome to our api!' });   

// });

let mysql = require("mysql");
app.use(function(req, res, next){
	res.locals.connection = mysql.createConnection({
		host     : c.dbSettings().host,
		user     : c.dbSettings().user,
		password : c.dbSettings().password,
		database : c.dbSettings().database
	});
	//res.locals.connect();
	next();
});

// create a player (accessed at POST http://localhost:8080/api/player)
router.post('/player', (req, res) => {

    console.log("Player POST");
    //read player information from request
    let player = new p.Player(req.body.name, req.body.game_id,req.body.main);
 
    res.locals.connection.query(player.getAddPlayerSQL(),  function (err, data) {

        if(err){
            res.send(JSON.stringify({"status": 500, "error": err, "response": null})); 
        } else {
            res.status(200).json({
                message:"Player added.",
                playerId: data.insertId
            });
        }
    });
});

router.get('/players', function(req, res, next) {
    res.locals.connection.query('SELECT * from PLAYER', function (error, results, fields) {
        if(error){
            res.send(JSON.stringify({"status": 500, "error": error, "response": null})); 
            //If there is error, we send the error in the error section with 500 status
        } else {
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
            //If there is no error, all is good and response is 200OK.
        }
    });
});


 
//handles url http://localhost:8080/api/players/1001
router.get("players/:playerId", (req, res, next) => {
    let pid = 1;//req.params.productId;
 
    res.locals.connection.query(p.Player.getPlayerByIdSQL(pid), (err, data)=> {
        if(!err) {
            if(data && data.length > 0) {
                
                res.status(200).json({
                    message:"Player found.",
                    product: data
                });
            } else {
                res.status(200).json({
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