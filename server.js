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
var bodyParser = require('body-parser')
var session = require('express-session')
var cookieSession = require('cookie-session')

var { uuid } = require('uuidv4');
require('moment-timezone');
moment.tz('Asia/Tokyo');
var trade_api = 'dfb20a41ebeb6482fac1d08c03a0d0f50b9b8eff43757778d4656ba4af9f17d6';
app.set('trust proxy', 1) // trust first proxy.

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.use(session({
  genid: function(req) {
    return uuid() // use UUIDs for session IDs
  },
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));



// LOCAL HOST
app.get('/t1',function(req , res){
	res.sendFile(path.join(__dirname, 'local/jquery.min.js'));
})
app.get('/t2',function(req , res){
	res.sendFile(path.join(__dirname, 'local/popper.min.js'));
})
app.get('/t3',function(req , res){
	res.sendFile(path.join(__dirname, 'local/bootstrap.min.js'));
})
app.get('/t4',function(req , res){
	res.sendFile(path.join(__dirname, 'local/lightweight-charts.standalone.production.js'));
})

app.get('/t5',function(req , res){
	res.sendFile(path.join(__dirname, 'local/bootstrap.min.css'));
})


app.get('/font-awesome',function(req , res){
	res.sendFile(path.join(__dirname, 'local/font-awesome.css'));
})


app.get('/chartjs',function(req , res){
	res.sendFile(path.join(__dirname, 'local/chartjs.js'));
})



app.get('/menu_file',function(req , res){
	res.sendFile(path.join(__dirname, 'partials/menu.html'));
})



// app.use(express.static('./'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())


var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/exchange";

var bet_list = [];
var win_list = [];

var last_price = 0;

app.post('/change_fee',function(req,res){
	var new_fee = req.body.fee;
	bet_fee = new_fee;
	res.send({'fee' : bet_fee});
});


app.post('/get_bet',function(req,res){
	var len = bet_list.length;
	var arr_bet = [];


	for (i = 0; i < len; i++) {
		if (bet_list[i]['email'] == req.session.info[0]['email']) {
			 arr_bet.push({
				'sell' : bet_list[i]['sell'],
				'buy' : bet_list[i]['buy'],
			})
			
		}
	}
	// console.log(arr_bet);
	res.send(arr_bet);
})

app.post('/get_earn',function(req,res){
	var len = win_list.length;
	var earn_bet = [];

	for (i = 0; i < len; i++) {
		if (win_list[i]['email'] == req.session.info[0]['email']) {
			 earn_bet.push({
				'earn' : win_list[i]['earn'],
			})
			
		}
	}
	// console.log(arr_bet);
	res.send(earn_bet);
})



app.post('/place_bet',function(req,res){
	var sell_bet = req.body.sell;
	var buy_bet = req.body.buy;

	var total_bet = parseInt(sell_bet) + parseInt(buy_bet);

	if (total_bet > 0) {
		if (req.session.info) {
			if (req.session.info[0]['money'] >= total_bet) {
				req.session.info[0]['money'] -= total_bet;

				var obj_bet = {
					'email' : req.session.info[0]['email'],
					'buy' : parseInt(buy_bet),
					'sell' : parseInt(sell_bet),
					'balance' : req.session.info[0]['money'],
				}

				MongoClient.connect(url ,{ useNewUrlParser : true ,  useUnifiedTopology: true } , function(err ,db){
					var dbo = db.db('currency');


					dbo.collection('trader_user').find({'email' : req.session.info[0]['email']}).limit(1).toArray(function(err , main_result){
						if (main_result.length > 0) {
							if (err) throw err;						
								dbo.collection('trader_user').updateOne({'email' : req.session.info[0]['email']},{
									$set : {
										'money' : req.session.info[0]['money'],
									},

								} , {multi : true});

								var bet_len = bet_list.length;
								var match = false;
								for(i = 0; i < bet_len; i++)
								{
									if (bet_list[i]['email'] == req.session.info[0]['email']) {
										bet_list[i]['buy'] += parseInt(buy_bet);
										bet_list[i]['sell'] += parseInt(sell_bet);
										bet_list[i]['balance'] = req.session.info[0]['money'];
										match = true;
									} 
								}

								if (!match) {
									bet_list.push(obj_bet);
								}

								// console.log(bet_list)

								res.send({'status' : 'ok'});
							}
					})

				});


			}
		}
	}


});


app.post('/login/user',function(req,res){
	var username = req.body.user_name;
	var password = req.body.user_pass;
	MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
		if (err) throw err;

		var dbo = db.db('currency');

		dbo.collection('trader_user').find({'username' : username , 'password' : password}).toArray(function(err , main_result){
			
			if (main_result.length > 0) {
				req.session.info = main_result;
				res.redirect('/');
			} else {
				res.redirect('/');
			}
		})
	})

});

app.post('/resgister/user' , function(req,res){
	var username = req.body.user_name;
	var userpass = req.body.user_pass;
	var usermail = req.body.user_email;
	var userfullname = req.body.user_fullname;

	var user_obj = {
		'username' : username,
		'password' : userpass,
		'email' : usermail,
		'fullname' : userfullname,
		'money' : 0,
	}

	MongoClient.connect(url , { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
		var dbo = db.db('currency');
    	dbo.collection('trader_user').insertOne(user_obj, function(err, res){
  		    db.close();
  		}); //End of insertOne
	});

	res.redirect('/login');

});


app.post('/login/user',function(req,res){
	var username = req.body.user_name;
	var password = req.body.user_pass;
	MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
		if (err) throw err;

		var dbo = db.db('currency');

		dbo.collection('trader_user').find({'username' : username , 'password' : password}).toArray(function(err , main_result){
			
			if (main_result.length > 0) {
				req.session.info = main_result;
				res.redirect('/');
			} else {
				res.redirect('/');
			}
		})
	})

});


app.post('/get_all_user',function(req,res){
	var username = req.body.user_name;
	var password = req.body.user_pass;
	MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
		if (err) throw err;

		var dbo = db.db('currency');

		dbo.collection('trader_user').find().toArray(function(err , main_result){
			if (main_result.length > 0) {
				res.send(main_result)
			} 
		})
	})

});



app.get('/user/logout',function(req,res){
	req.session = null;
	res.redirect('/login');
})


app.get('/user_info',function(req,res){
	// console.log(req.session.info)	
	if (!req.session.info) {
		res.send({'status' : '404'});
	} else {
		MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
			if (err) throw err;
			var dbo = db.db('currency');
			dbo.collection('trader_user').find({'email' : req.session.info[0]['email']}).toArray(function(err , main_result){
				// console.log(main)
				if (main_result.length > 0) {
					req.session.info = main_result;
					res.send({
							'status' : 'ok',
							'information' : req.session.info,
						})
				} else {
					res.send({'status' : '404'})
				}
			})
		})
	}
})

app.post('/get_transaction',function(req,res){
	if (!req.session.info) {
		res.send({'status' : '404'});
	} else {
		MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
			if (err) throw err;
			var dbo = db.db('currency');
			dbo.collection('trade_transaction').find({'email' : req.session.info[0]['email']}).limit(5).sort({_id : -1}).toArray(function(err , main_result){
				if (main_result.length > 0) {
					req.session.transaction = main_result;
					res.send({
							'status' : 'ok',
							'information' : req.session.transaction,
						})
				} else {
					res.send({'status' : '404'})
				}
			})
		})
	}
})



app.get('/assets/style',function(req , res){
	res.sendFile(path.join(__dirname, 'assets/style.css'));
})

app.get('/admin/style',function(req , res){
	res.sendFile(path.join(__dirname, 'assets/admin.css'));
})





app.get('/main/script',function(req , res){
	res.sendFile(path.join(__dirname, 'static/main.js'));
})


app.get('/fetch_js',function(req , res){
	res.sendFile(path.join(__dirname, 'static/data_fetcher.js'));
})


app.get('/login',function(req , res){
	res.sendFile(path.join(__dirname, 'login.html'));
})


app.get('/register',function(req , res){
	res.sendFile(path.join(__dirname, 'register.html'));
})





app.get('/', function(req , res) {

	if (!req.session.info) {
		res.sendFile(path.join(__dirname, 'login.html'));
	} else {
		res.sendFile(path.join(__dirname, 'index.html'));
	}
   
});

// ADMIN ROUTES

app.get('/admin', function(req , res) {
	res.sendFile(path.join(__dirname, 'admin.html'));
});


app.post('/update_money',function(req,res){
	var money = parseInt(req.body.money);
	var email = req.body.email;
	MongoClient.connect(url ,{ useNewUrlParser : true ,  useUnifiedTopology: true } , function(err ,db){
		var dbo = db.db('currency');

		dbo.collection('trader_user').find({'email' : email}).limit(1).toArray(function(err , main_result){
			if (main_result.length > 0) {
				if (err) throw err;
				
				
					var new_money =  parseInt(main_result[0]['money']) + money;
				
					dbo.collection('trader_user').updateOne({'email' : email},{
						$set : {
							'money' : new_money,
						},

					} , {multi : true});

					res.send({'money' : new_money})

				}
		})

	});

});

app.post('/checkCredentials_username',function(req,res){
	var username = req.body.username;

	MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
		if (err) throw err;
		var dbo = db.db('currency');
		dbo.collection('trader_user').find({'username' : username}).toArray(function(err , main_result){
			if (main_result.length > 0) {
				res.send({'status' : '503' ,'message' : 'Username is already taken'})
			} else {
				res.send({'status' : 'ok'})
			}
		})

	})
})
app.post('/checkCredentials_email',function(req,res){
	var email = req.body.email;

	MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
		if (err) throw err;
		var dbo = db.db('currency');

		dbo.collection('trader_user').find({'email' : email}).toArray(function(err , main_result_2){
			if (main_result_2.length > 0) {	
				res.send({'status' : '503' , 'message' : 'Email is already taken',})
			} else {
				res.send({'status' : 'ok'})
			}
		})
	})
})




server.listen(5000,function(){
	console.log('Starting server on port5000');
});


var g_lp = 0 ;
var g_ask = 0 ;
var g_bid = 0 ;
var g_open = 0 ;
var g_high = 0 ;
var g_low = 0 ;
var g_close = 0 ;

var bet_fee = 0.1;

var server_money = {
	'loss' : 0,
	'earning' : 0,
	'server_money' : 0,
	'collected_fee' : 0,
	'time' : '',
}

MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
	if (err) throw err;
	var dbo = db.db('currency');
	dbo.collection('statistic').find({}).limit(1).toArray(function(err , static_res){
		if (static_res.length > 0) {
			static_res['loss'] = server_money['loss'];
			static_res['earning'] = server_money['loss'];
			static_res['server_money'] = server_money['loss'];
			static_res['collected_fee'] = server_money['loss'];
		} 
	})
})

MongoClient.connect(url, { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
	if (err) throw err;
	var dbo = db.db('currency');
	dbo.collection('currency_obj').find({}).limit(1).sort({'_id' : -1}).toArray(function(err , result){
		if (result.length > 0) {

			last_price = result[0]['data'][0]['data_val']['open'];
		
		} 
	})
})




// var currency_obj = [];

var data = [];

// function genrate_result(data,callback) {

// 	data = [];
// 	// 17 DATA
// 	// var data_api ='https://tvc4.forexpros.com/fb014e4ae781fb51b9589302f4ddb609/1584587294/18/18/88/quotes?symbols=USD%2FKRW%2CUSD%2FJPY%2CJPY%2FKRW%2CEUR%2FUSD%2CAUD%2FUSD%2CitBit%3ABTC%2FUSD%2CICE%3ADX%2CEUR%2FKRW%2CGBP%2FUSD%2CEUR%2FJPY%2CUSD%2FCHF%2CUSD%2FCAD%2CGBP%2FJPY%2CNZD%2FUSD%2CAUD%2FJPY%2CUSD%2FCNY%2CMCX%3AUSD%2FRUB';
// 	// 1 Data
// 	var data_api = 'https://min-api.cryptocompare.com/data/v2/histominute?fsym=GBP&tsym=AUD&limit=1&api_key={'+trade_api+'}';
// 	request.get(data_api,function(err,res,body){
// 		if (body) {

// 			var obj = {
// 				'date' : timestamp.utc('YYYY/MM/DD'),
// 				'time_stamp' : timestamp.utc('YYYY-MM-DD HH:mm') +':00',
// 				'data' : [{
// 					'name' : 'GBP/AUD',
// 					'data_val' : data_obj['Data']['Data'][0],
// 				}],
// 			}
// 			data.push(obj);
// 			callback(data);

		
// 		} else {
// 			return genrate_result(data,callback);
// 		}

// 	})
// }


function generate_own_data(data,callback) {


	var decider = Math.floor(Math.random() * 2);

		g_lp += Math.floor(Math.random() * (2.60 * 100 - 1 * 100) + 1 * 100) / (1*100);
		g_ask += Math.floor(Math.random() * (2.60 * 100 - 1 * 100) + 1 * 100) / (1*100);
		g_bid += Math.floor(Math.random() * (2.60 * 100 - 1 * 100) + 1 * 100) / (1*100);

		g_open = ((10 + Math.round(Math.random() * 10000) / 100) / 12.5) + (Math.random() * -12) + 6;
		g_high =((10 + Math.round(Math.random() * 10000) / 100) / 12.5) + (Math.random() * -12) + 6;
		g_low = ((10 + Math.round(Math.random() * 10000) / 100) / 12.5) + (Math.random() * -12) + 6;
		g_close = ((10 + Math.round(Math.random() * 10000) / 100) / 12.5) + (Math.random() * -12) + 6;



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
		open:  g_open.toFixed(2),
		high:  g_high.toFixed(2),
		low:  g_low.toFixed(2),
		close:  g_close.toFixed(2),
		volume: "49,646",
	}

	var obj_pass = {
				'date' : timestamp.utc('YYYY/MM/DD'),
				'time_stamp' : timestamp.utc('YYYY-MM-DD HH:mm') +':00',
				'data' : [{
					'name' : 'GBP/AUD',
					'data_val' : obj,
				}],
			}

	callback(obj_pass);

}



function anaylze_bet_result(bet_list,result,callback){
		
		var sell = parseInt(bet_list['sell']);
		var buy = parseInt(bet_list['buy']);

		var bet_sell_fee = sell * bet_fee;
		var bet_buy_fee = buy * bet_fee;
		var total_fee = bet_sell_fee + bet_buy_fee;


		server_money['collected_fee'] += total_fee;

		var money_win = 0;
		if (result == 'high') {
			money_win = (buy - sell);
			sell = 0;
			buy *= 2;
		} else if (result == 'low') {
			money_win = (sell - buy);
			sell *= 2;
			buy = 0;
		}

		var balance = bet_list['balance'] + (buy + sell);


		if (money_win < 0) {
			money_win += total_fee;
		} else if (money_win > 0) {
			money_win -= total_fee;
		}

		balance -= total_fee;

	
		var bet_money = parseInt(bet_list['buy']) + parseInt(bet_list['sell']);
		var email = bet_list['email'];

		callback(money_win,bet_money,result,balance,email);

}

function update_money(email,balance){
	MongoClient.connect(url ,{ useNewUrlParser : true ,  useUnifiedTopology: true } , function(err ,db){
		var dbo = db.db('currency');
		dbo.collection('trader_user').find({'email' : email}).limit(1).toArray(function(err , main_result){
			// console.log(main_result)
			if (main_result.length > 0) {
				if (err) throw err;
					

					dbo.collection('trader_user').updateOne({'email' : email},{
						$set : {
							'money' : balance,
						},

					} , {multi : true});

				}
		})

	});

}

function compute_server_statistic(server_money,bet_list,result,timestamp){
	MongoClient.connect(url , { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
		var dbo = db.db('currency');
		for(i = 0; i < bet_list.length; i++){
			var sell = parseInt(bet_list[i]['sell']);
			var buy = parseInt(bet_list[i]['buy']);
			var bet_sell_fee = sell * bet_fee;
			var bet_buy_fee = buy * bet_fee;
			var total_fee = bet_sell_fee + bet_buy_fee;

			server_money['collected_fee'] += total_fee;
			server_money['time'] = timestamp.utc('YYYY-MM-DD HH:mm') +':00';
			var money_win = 0;
			if (result == 'high') {
				money_win = (buy - sell);
				sell = 0;
				buy *= 2;
			} else if (result == 'low') {
				money_win = (sell - buy);
				sell *= 2;
				buy = 0;
			}


			if (money_win > 0) {
				server_money['loss'] += Math.abs(money_win);
			} else {
				server_money['earning'] += Math.abs(money_win);
			}
		}




		server_money['server_money'] += (parseInt('-'+server_money['loss']) + server_money['earning']);
		
		var obj = {
			'loss' : server_money['loss'],
			'earning' : server_money['earning'],
			'time' : server_money['time'],
			'collected_fee' : server_money['collected_fee'],
			'server_money' : server_money['server_money'] + total_fee,
		}


    	dbo.collection('statistic').insertOne(obj, function(err, res){
  		    db.close();


  		}); //End of insertOne

  		return server_money;
	});


	// console.log(server_money);

}


setInterval(function(){
	
	// console.log(genrate_result())
	var seconds = 60 - moment().format('ss');
	var time =  timestamp.utc('YYYY-MM-DD HH:mm:ss');
	io.sockets.emit('time', {time});
	if (seconds == 2) {		


		generate_own_data(data,function(result){
			
			MongoClient.connect(url , { useNewUrlParser: true ,  useUnifiedTopology: true}, function(err , db){
				if (err) throw err;
				var dbo = db.db('currency');
			  	dbo.collection('currency_obj').insertOne(result, function(err, res){
			  		// console.log(err)
			  		if (err) throw err;
					    db.close();
				}); //End of insertOne
			})	

			if (last_price > result['data'][0]['data_val']['open']) {
				var res = 'low';
			} else {
				var res = 'high';
			}

			win_list = [];

			if (bet_list.length != []) {
				compute_server_statistic(server_money,bet_list,res,timestamp);
			}


			for(i = 0; i < bet_list.length; i++)
			{
				anaylze_bet_result(bet_list[i],res,function(earn,bet_money,result,balance,email){

					MongoClient.connect(url, {useNewUrlParser : true, useUnifiedTopology : true}, function(err,db){
							var transaction_history = {
								'email' : email,
								'bet_money' : bet_money,
								'result' : result,
								'earn' : earn,
								'balance' : balance,
							}
							var dbo = db.db('currency');

						  	dbo.collection('trade_transaction').insertOne(transaction_history, function(err, res){
						  		if (err) throw err;
						  		update_money(email,balance);
						  		// record_earning()
								db.close();
							}); //End of insertOne
					})

					win_list.push({'email' : bet_list['email'] , 'earn' : earn });
					
				});
			}


			last_price = result['data'][0]['data_val']['open'];
			io.sockets.emit('get_prize');
			io.sockets.emit('data', {result});

			server_money['loss'] = 0;
			server_money['earning'] = 0;
			server_money['collected_fee'] = 0;
			server_money['time'] = '';
			bet_list = [];
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

	socket.on('get_statistic',function(){
		if (bet_fee == 0.1) {
			var t_fee = '10%';
		} else if (bet_fee == 0.15) {
			var t_fee = '15%';
		} else if (bet_fee == 0.2) {
			var t_fee = '20%';
		} else if (bet_fee == 0.25) {
			var t_fee = '25%';
		}
		
		MongoClient.connect(url,{ useNewUrlParser: true ,  useUnifiedTopology: true},function(err , db){
			var mysort = {_id : -1};
			if (err) throw err;
			var dbo = db.db('currency');
			dbo.collection('statistic').find({}).sort(mysort).limit(20).toArray(function(err, result){
				// socket.emit('chart_data', result);
				socket.emit('data_statistic',{'fee' : t_fee , 'statistic' : result});
				db.close();
			});
		});
		
	})
})



