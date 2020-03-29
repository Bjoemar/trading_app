const express = require('express')
const app = express();
var http = require('http');
var path = require('path');
var server = http.Server(app);
var request = require('request');
const timestamp = require('time-stamp');
var moment = require('moment');
var socketIO = require('socket.io');
var io = socketIO(server);
var passport = require('passport')

require('moment-timezone');
moment.tz('Asia/Tokyo');
app.use(express.static('./'));



var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/exchange";


app.get('/assets/style',function(req , res){
	res.sendFile(path.join(__dirname, 'assets/style.css'));
})


app.get('/main/script',function(req , res){
	res.sendFile(path.join(__dirname, 'static/main.js'));
})


app.get('/', function(req , res) {
    res.sendFile(path.join(__dirname, 'index.html'));

});


server.listen(5000,function(){
	console.log('Starting server on port5000');
});


var g_lp = 1212.73 ;
var g_ask = 1213.23 ;
var g_bid = 1212.23 ;
var g_open = 1212.90 ;
var g_high = 1227.05 ;
var g_low = 1205.72 ;
var g_close = 1212.90 ;




var currency_obj = [];

// app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/users/' + req.user.username);
//   });


// function genrate_result(currency_obj) {
// 	// 17 DATA
// 	// var data_api ='https://tvc4.forexpros.com/fb014e4ae781fb51b9589302f4ddb609/1584587294/18/18/88/quotes?symbols=USD%2FKRW%2CUSD%2FJPY%2CJPY%2FKRW%2CEUR%2FUSD%2CAUD%2FUSD%2CitBit%3ABTC%2FUSD%2CICE%3ADX%2CEUR%2FKRW%2CGBP%2FUSD%2CEUR%2FJPY%2CUSD%2FCHF%2CUSD%2FCAD%2CGBP%2FJPY%2CNZD%2FUSD%2CAUD%2FJPY%2CUSD%2FCNY%2CMCX%3AUSD%2FRUB';
// 	// 1 Data
// 	var data_api = 'https://tvc4.forexpros.com/fb014e4ae781fb51b9589302f4ddb609/1584587294/18/18/88/quotes?symbols=USD%2FKRW';
// 	request.get(data_api,function(err,res,body){
// 		// console.log(body)
// 		if (body) {

// 		var data = JSON.parse(body);
// 		var currency_obj = {
// 			'date' : timestamp.utc('YYYY/MM/DD'),
// 			'time_stamp' : timestamp.utc('YYYY-MM-DD HH:mm') +':00',
// 			'data' : [{
// 				'name' : data['d'][0]['n'],
// 				'data_val' : data['d'][0]['v'],
// 			}],

// 		}

// 		}

// 	})
// }


function generate_own_data() {


	// var result = Math.floor(Math.random() * (-3.05 * 100 - 1 * 100) + 1 * 100) / (1*100);

	var decider = Math.floor(Math.random() * 2);

		if (decider == 0) {

			g_lp += Math.floor(Math.random() * (-1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_ask += Math.floor(Math.random() * (-1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_bid += Math.floor(Math.random() * (-1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_open += Math.floor(Math.random() * (-1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_high+= Math.floor(Math.random() * (-1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_low += Math.floor(Math.random() * (-1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_close += Math.floor(Math.random() * (-1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
		} else {

			g_lp += Math.floor(Math.random() * (1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_ask += Math.floor(Math.random() * (1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_bid += Math.floor(Math.random() * (1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_open += Math.floor(Math.random() * (1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_high+= Math.floor(Math.random() * (1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_low += Math.floor(Math.random() * (1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
			g_close += Math.floor(Math.random() * (1.05 * 100 - 1 * 100) + 1 * 100) / (1*100);
		}



	var obj = {
		ch: "-0.17",
		chp: "-0.01",
		short_name: "USD/KRW",
		exchange: " 실시간 FX",
		description: "USD/KRW",
		lp: g_lp.toFixed(2),
		ask: g_ask.toFixed(2),
		bid: g_bid.toFixed(2),
		spread: 100,
		open_price: g_open.toFixed(2),
		high_price: g_high.toFixed(2),
		low_price: g_low.toFixed(2),
		prev_close_price: g_close.toFixed(2),
		volume: "49,646",
	}

	return obj;

}

setInterval(function(){
	var seconds = 60 - moment().format('ss');

	if (seconds == 1) {		
		MongoClient.connect(url , { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
			if (err) throw err;
			var dbo = db.db('currency');

			var currency_obj = {
				'date' : timestamp.utc('YYYY/MM/DD'),
				'time_stamp' : timestamp.utc('YYYY-MM-DD HH:mm') + ':00',
				'data' : [{
					// 'name' : "data['d'][0]['n']",
					'name' : "USD/KRW",
					'data_val' : generate_own_data(),
				}],

			}

        	dbo.collection('currency_obj').insertOne(currency_obj, function(err, res){
      		    db.close();

      		    io.sockets.emit('data', {currency_obj});
      		}); //End of insertOne
		})
	}

},1000);

io.on('connection',function(socket){
	socket.on('new_user',function(){
		MongoClient.connect(url,{ useNewUrlParser: true ,  useUnifiedTopology: true},function(err , db){
			var mysort = {_id : -1};
			if (err) throw err;
			var dbo = db.db('currency');
			dbo.collection('currency_obj').find({}).sort(mysort).toArray(function(err, result){
				socket.emit('chart_data', result);
				db.close();
			});
		});
	})
})



