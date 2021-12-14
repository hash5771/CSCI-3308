var express = require('express');
var router = express.Router();
var axios = require('axios');
const { Pool, Client } = require('pg');
const insertReviewSQL = 'INSERT INTO reviews(name, review) VALUES($1, $2)';

const pool = new Pool({
	user: 'mrmaqucublqhlh',
	host: 'ec2-18-210-159-154.compute-1.amazonaws.com',
	database: 'dv67eh40l6su0',
	password: 'd603aa933c97752288f68b44c8d64c94a680b6dd6ee7ef56375c3eb7ac66e330',
	port: 5432,
	ssl: {rejectUnauthorized: false}
});

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('pages/main', { title: 'Express' });
});

/* GET reviews page. */
router.get('/reviews', async function (req, res, next) {
	var data = await filterReviews(req.query.filter);
	if (!data || data.length == 0)
	{
		data = await filterReviews("");
	}
	res.render('pages/reviews', { title: 'Review List', reviewData: data });
});

router.get('/search/shows', async function (req, res, next) {
	try {
		const response = await axios({
			url: "https://api.tvmaze.com/search/shows",
			method: "get",
			params: { q: req.query.search }
		});
		res.status(200).json(response.data);
	} catch (err) {
		res.status(500).json({ message: err });
	}
});

router.post('/save/review', function (req, res, next) {
	console.log("get route", req.body);
	let values = [req.body.title, req.body.review]
	pool.query(insertReviewSQL, values, (err, response) => {
		console.log(err, response)
		res.status(200).json({ message: "success" });
	})
});

async function filterReviews(filter) {
	if (!filter) {
		filter = '';
	}
	var sql = `SELECT * FROM reviews WHERE UPPER(name) LIKE '%${filter.toUpperCase()}%'`;
	var data = await pool.query(sql)
	return data.rows;
}



module.exports = router;


