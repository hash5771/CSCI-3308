/***********************
  Load Components!

  Express      - A Node.js Framework
  Body-Parser  - A tool to help use parse the data in a post request
  Pg-Promise   - A database tool to help use connect to our PostgreSQL database
***********************/
var express = require('express'); //Ensure our express framework has been added
var app = express();
var bodyParser = require('body-parser'); //Ensure our body-parser tool has been added
app.use(bodyParser.json());              // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

//Create Database Connection
var pgp = require('pg-promise')();

/**********************
  Database Connection information
  host: This defines the ip address of the server hosting our database.
		We'll be using `db` as this is the name of the postgres container in our
		docker-compose.yml file. Docker will translate this into the actual ip of the
		container for us (i.e. can't be access via the Internet).
  port: This defines what port we can expect to communicate to our database.  We'll use 5432 to talk with PostgreSQL
  database: This is the name of our specific database.  From our previous lab,
		we created the football_db database, which holds our football data tables
  user: This should be left as postgres, the default user account created when PostgreSQL was installed
  password: This the password for accessing the database. We set this in the
		docker-compose.yml for now, usually that'd be in a seperate file so you're not pushing your credentials to GitHub :).
**********************/
const dbConfig = {
	host: 'db',
	port: 5432,
	database: 'football_db',
	user: 'postgres',
	password: 'pwd'
};

var db = pgp(dbConfig);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/'));//This line is necessary for us to use relative paths and access our resources directory



/*********************************
 Below we'll add the get & post requests which will handle:
   - Database access
   - Parse parameters from get (URL) and post (data package)
   - Render Views - This will decide where the user will go after the get/post request has been processed

 Web Page Requests:

  Login Page:        Provided For your (can ignore this page)
  Registration Page: Provided For your (can ignore this page)
  Home Page:
			/home - get request (no parameters)
					This route will make a single query to the favorite_colors table to retrieve all of the rows of colors
					This data will be passed to the home view (pages/home)

			/home/pick_color - post request (color_message)
					This route will be used for reading in a post request from the user which provides the color message for the default color.
					We'll be "hard-coding" this to only work with the Default Color Button, which will pass in a color of #FFFFFF (white).
					The parameter, color_message, will tell us what message to display for our default color selection.
					This route will then render the home page's view (pages/home)

			/home/pick_color - get request (color)
					This route will read in a get request which provides the color (in hex) that the user has selected from the home page.
					Next, it will need to handle multiple postgres queries which will:
						1. Retrieve all of the color options from the favorite_colors table (same as /home)
						2. Retrieve the specific color message for the chosen color
					The results for these combined queries will then be passed to the home view (pages/home)

			/team_stats - get request (no parameters)
				This route will require no parameters.  It will require 3 postgres queries which will:
					1. Retrieve all of the football games in the Fall 2018 Season
					2. Count the number of winning games in the Fall 2018 Season
					3. Count the number of lossing games in the Fall 2018 Season
				The three query results will then be passed onto the team_stats view (pages/team_stats).
				The team_stats view will display all fo the football games for the season, show who won each game,
				and show the total number of wins/losses for the season.

			/player_info - get request (no parameters)
				This route will handle a single query to the football_players table which will retrieve the id & name for all of the football players.
				Next it will pass this result to the player_info view (pages/player_info), which will use the ids & names to populate the select tag for a form
************************************/

// login page
app.get('/', function (req, res) {
	res.render('pages/login', {
		local_css: "signin.css",
		my_title: "Login Page"
	});
});

// registration page
app.get('/register', function (req, res) {
	res.render('pages/register', {
		my_title: "Registration Page"
	});
});

/*Add your other get/post request handlers below here: */
// A way for us to access the home page via a GET request below
/*
app.get('/home', function(req, res) {
	res.render('pages/home',{
		my_title:'Home Page',
		color: 'FF0000',
		color_msg: 'The Color Red'
	});
});
*/

// A way to work on handling a simple database request.
app.get('/home', function (req, res) {
	var query = 'select * from favorite_colors;';
	db.any(query)
		.then(function (rows) {
			res.render('pages/home', {
				my_title: "Home Page",
				data: rows,
				color: '',
				color_msg: ''
			})

		})
		.catch(function (err) {
			console.log('error', err);
			res.render('pages/home', {
				my_title: 'Home Page',
				data: '',
				color: '',
				color_msg: ''
			})
		})
});

// A new route that can accept and process our GET request's color_selection parameter.
app.get('/home/pick_color', function (req, res) {
	var color_choice = req.query.color_selection; // Investigate why the parameter is named "color_selection"
	var color_options = "SELECT hex_value FROM favorite_colors;"; // Write a SQL query to retrieve the colors from the database
	var color_message = "SELECT color_msg FROM favorite_colors WHERE hex_value = \'" + color_choice + "\';"; // Write a SQL query to retrieve the color message for the selected color
	db.task('get-everything', task => {
		return task.batch([
			task.any(color_options),
			task.any(color_message)
		]);
	})
		.then(info => {
			res.render('pages/home', {
				my_title: "Home Page",
				data: info[0], // Return the color options
				color: color_choice, // Return the color choice
				color_msg: info[1][0].color_msg, // Return the color message
			})
		})
		.catch(err => {
			console.log('error', err);
			res.render('pages/home', {
				my_title: 'Home Page',
				data: '',
				color: '',
				color_msg: ''
			})
		});

});

app.post('/home/pick_color', function (req, res) {
	var color_hex = req.body.color_hex;
	var color_name = req.body.color_name;
	var color_message = req.body.color_message;
	var insert_statement = "INSERT INTO favorite_colors(hex_value, name, color_msg) VALUES(\'" + color_hex + "\', \'" + color_name + "\', \'" + color_message + "\');"; // Write a SQL statement to insert a color into the favorite_colors table
	var color_select = "SELECT * FROM favorite_colors;"; // Write a SQL statement to retrieve all of the colors in the favorite_colors table

	db.task('get-everything', task => {
		return task.batch([
			task.any(insert_statement),
			task.any(color_select)
		]);
	})
		.then(info => {
			res.render('pages/home', {
				my_title: "Home Page",
				data: info[1], // Return the color choices
				color: color_hex, // Return the hex value of the color added to the table
				color_msg: color_message // Return the color message of the color added to the table
			})
		})
		.catch(err => {
			console.log('error', err);
			res.render('pages/home', {
				my_title: 'Home Page',
				data: '',
				color: '',
				color_msg: ''
			})
		});
});

app.get('/team_stats', function (req, res) {
	var query1 = 'SELECT * from football_games;';
	var query2 = 'SELECT COUNT(home_score) FROM football_games WHERE home_score > visitor_score;';
	var query3 = 'SELECT COUNT(home_score) FROM football_games WHERE home_score < visitor_score;';
	db.task('get-everything', task => {
		return task.batch([
			task.any(query1),
			task.any(query2),
			task.any(query3)
		]);
	})
		.then(data => {
			res.render('pages/team_stats', {
				my_title: "Team Stats",
				result_1: data[0],
				result_2: data[1][0].count,
				result_3: data[2][0].count
			})
		})
		.catch(err => {
			// display error message in case an error
			console.log('error', err);
			res.render('pages/team_stats', {
				my_title: "Team Stats",
				result_1: '',
				result_2: '',
				result_3: ''
			})
		});
});

app.get('/player_info', function (req, res) {
	var query = 'SELECT id, name FROM football_players;';
	db.any(query)
		.then(function (rows) {
			res.render('pages/player_info', {
				my_title: "Player Info",
				result_1: rows,
				result_2: '',
				result_3: ''
			})
		})
		.catch(function (err) {
			// display error message in case an error
			console.log('error', err);
			res.render('pages/player_info', {
				my_title: "Player Info",
				result_1: '',
				result_2: '',
				result_3: ''
			})
		})
});

app.get('/player_info/player', function (req, res) {
	var playerID = req.query.player_choice;
	var query1 = 'SELECT id, name FROM football_players;';
	var query2 = 'SELECT * FROM football_players WHERE id =' + playerID + ';';
	var query3 = 'SELECT COUNT(*) AS gamesplayed FROM football_games WHERE ' + playerID + '=ANY(players);';
	db.task('get-everything', task => {
		return task.batch([
			task.any(query1),
			task.any(query2),
			task.any(query3)
		]);
	})
		.then(data => {
			res.render('pages/player_info', {
				my_title: "Player Info",
				result_1: data[0], // stores results of query one, populating the table with all player ID's and names.
				result_2: data[1][0], // stores the results of query two, populating the table with all information for a given player based on ID.
				result_3: data[2][0].gamesplayed // stores the results of query three, populating the table with the number of games played by a specific player depending on ID value.
			})
		})
		.catch(err => {
			// display error message in case an error
			console.log('error', err);
			res.render('pages/player_info', {
				my_title: "Player Info",
				result_1: '',
				result_2: '',
				result_3: ''
			})
		});
});

app.post('/player_info/add_player', function(req, res){
	var playerName = req.body.player_name;
	var playerMajor = req.body.player_major;
	var playerYear = req.body.player_year;
	var playerPassingYards = req.body.player_passing_yards;
	var playerRushingYards = req.body.player_rushing_yards;
	var playerReceivingYards = req.body.player_receiving_yards;
	var insert_statement = "INSERT INTO football_players(name, year, major, passing_yards, rushing_yards, receiving_yards) VALUES('" + playerName + "', '" + playerYear + "', '" + playerMajor + "', '" + playerPassingYards + "', '" + playerRushingYards + "', '" + playerReceivingYards + "');";

	db.any(insert_statement)
		.then(info => {
			res.render('pages/player_info', {
				my_title: "Add Player Page",
				result_1: '',
				result_2: '',
				result_3: ''
			})
		})
		.catch(err => {
			console.log('error', err);
			res.render('pages/player_info', {
				my_title: "Add Player Page",
				result_1: '',
				result_2: '',
				result_3: ''
			})
		});
});

app.post('/player_info/add_game', function(req, res){
	var visitor = req.body.visitor_name;
	var homeScore = req.body.home_score;
	var oppScore = req.body.visitor_score;
	var gameDate = req.body.game_date;
	var players = req.body.players;
	var insert_statement = "INSERT INTO football_games(visitor_name, home_score, visitor_score, game_date, players) VALUES('" + visitor + "', '" + homeScore + "', '" + oppScore + "', '" + gameDate + "', '" + players + "');";

	db.any(insert_statement)
		.then(info => {
			res.render('pages/player_info', {
				my_title: "Add Player Page",
				result_1: '',
				result_2: '',
				result_3: ''
			})
		})
		.catch(err => {
			console.log('error', err);
			res.render('pages/player_info', {
				my_title: "Add Player Page",
				result_1: '',
				result_2: '',
				result_3: ''
			})
		});
});

app.listen(3000);
console.log('3000 is the magic port');
