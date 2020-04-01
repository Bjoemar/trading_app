var socket = io();
var vol_stat = 0;
var container = document.getElementById('chart');

var user_money = 0;
var user_sell_bet = 0;
var user_buy_bet = 0;
var confirm = false;


socket.emit('new_user');

socket.on('get_prize',function(){

	user_sell_bet = 0;
	user_buy_bet = 0;
	$.ajax({
		url : '/user_info',
		method : 'get',
		success:function(data){
			if (data['status'] != "404") {
				var money = data['information'][0]['money'];
				$('#current_money_info').html(money);
				user_money = money;
				$('#bet_buy_number').html(0);
				$('#bet_sell_number').html(0);
			} else {
				$('#log-out-in').html('Sign In');
				$('#log-out-in').attr('hreh' , '/login')
			}

		}
	})


	$.ajax({
		url : '/get_transaction',
		method : 'post',
		success:function(data){
			$('#transaction_table tbody').html('');
			if (data['information']) {


				for(i = 0; i < data['information'].length; i++)
				{
					var class_color;

					if (i % 2 == 0) {
						class_color = 'odd';
					} else {
						class_color = '';
					}

					if (data['information'][i]['earn'] > 0) {
						var data_earn = '<span style="color : lightgreen; font-weight : 300; font-size:12px;"> ( + '+data['information'][i]['earn']+')</span>';
					} else {
						var data_earn = '<span style="color : red; font-weight : 300; font-size:12px;"> ( '+data['information'][i]['earn']+')</span>';
					}
					$('#transaction_table tbody').append('<tr class="'+class_color+'"><td>'+data['information'][i]['bet_money']+'</td><td>'+data['information'][i]['balance']+'</td><td>'+data['information'][i]['result']+'</td><td>'+data_earn+'</td></tr>')	
				}
				
			}

		}
	})


	// $.ajax({
	// 	url : '/get_transaction',
	// 	method : 'post',
	// 	success:function(data){
	// 		if (data) {
	// 			console.log(data)
	// 			$('#transaction_table tbody').html('')
	// 			if (data['information']['earn'] > 0) {
	// 				var data_earn = '<span style="color : lightgreen; font-weight : 300; font-size:12px;"> ( + '+data['information']['earn']+')</span>';
	// 			} else {
	// 				var data_earn = '<span style="color : red; font-weight : 300; font-size:12px;"> ( '+data['information']['earn']+')</span>';
	// 			}
	// 			$('#transaction_table tbody').append('<tr class="odd"><td>'+data['information']['bet_money']+'</td><td>'+data['information']['balance']+'</td><td>'+data['information']['result']+'</td><td>'+data_earn+'</td></tr>')	
	// 		}
	// 		// if (data) {
	// 		// 	var money = data[0]['earn'];
	// 		// 	if (money > 0) {
	// 		// 		$('#current_money_info').html(user_money+'<span style="color : lightgreen; font-weight : 300; font-size:12px;"> ( + '+money+')</span>');
	// 		// 	} else {
	// 		// 		$('#current_money_info').html(user_money+'<span style="color : red; font-weight : 300; font-size:12px;"> ( '+money+')</span>');
	// 		// 	}
					
	// 		// }
	// 	}
	// })


	var dicider = Math.floor((Math.random() * 2));

	if (dicider == 0) {
		var choose = Math.floor((Math.random() * 4));
		$('.buy_button').eq(choose).click();
		setTimeout(function(){
			$('#confirmbet').click();
		},1000);
		setTimeout(function(){
			$('#place_bet').click();
		},3000)
	} else {
		var choose = Math.floor((Math.random() * 4));
		$('.sell_button').eq(choose).click();
		setTimeout(function(){
			$('#confirmbet').click();
		},1000);
		setTimeout(function(){
			$('#place_bet').click();
		},3000)
	}

})





$('.header_menu').load('menu_file')
var c_width = $('#chart').width();
var c_height = $('#chart').height();
var change = false;

socket.on('time',function(data){
	$('#utc_time').html(data['time']);
})



var chart = LightweightCharts.createChart(document.getElementById('chart'), {
	width: c_width,
  	height: c_height,
	crosshair: {
		mode: LightweightCharts.CrosshairMode.Normal,
	},
	priceScale: {
		scaleMargins: {
			top: 0.3,
			bottom: 0.25,
		},
		borderVisible: false,
	},
	layout: {
		backgroundColor: '#131722',
		textColor: '#d1d4dc',
		fontSize: 12,
	},
	grid: {
		vertLines: {
			color: 'rgba(42, 46, 57, 0)',
		},
		horzLines: {
			color: 'rgba(42, 46, 57, 0.6)',
		},
	},

});


chart.applyOptions({
    timeScale: {
        // rightOffset: 1,
        barSpacing: 10,
        // fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        // rightBarStaysOnScroll: false,
        // borderVisible: false,
        // borderColor: '#fff000',
        visible: true,
        timeVisible: true,
        secondsVisible: true,
    },
    priceFormat: {

        type: 'price',
        precision: 2,
        minMove: 0.05,
    },
     priceScale: {
        autoScale: true
    },

});



var candleSeries = chart.addCandlestickSeries();


candleSeries.applyOptions({
    priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.05,
    },
});


var minuteData = [];
var fiveMinute = [];
var tenMinute = [];
var fifthteenMinute = [];
var thirtyMinute = [];
var sixtyMinute = [];
var twohours = [];
var threeHours = [];
var fourHours = [];




var lastDigit = 0;



socket.on('chart_data',function(data){


	var data_len = data.length;

	lastDigit = data.length;



	$('#result_table tbody').html('');
	for(i = 0; i < data_len; i++)
	{

		var pass_time = data[i]['time_stamp'];
		var open = data[i]['data'][0]['data_val']['open'];
		var high = data[i]['data'][0]['data_val']['high'];
		var low = data[i]['data'][0]['data_val']['low'];
		var close = data[i]['data'][0]['data_val']['close'];
		// console.log(i)

		var res_time = pass_time[10]+''+pass_time[11]+''+pass_time[12]+''+pass_time[13]+''+pass_time[14]+''+pass_time[15];

		if (i <= 5) {

			append_siries(res_time,data[i]['data'][0]['name'],open,high,low,close,i);
		}

		if (i % 5 == 0) {

			push_series_data(fiveMinute,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
		} 

		if (i % 10 == 0) {

			push_series_data(tenMinute,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
		} 

		if (i % 15 == 0) {

			push_series_data(fifthteenMinute,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
		} 

		if (i % 30 == 0) {
			push_series_data(thirtyMinute,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
		}

		if (i % 60 == 0) {
			push_series_data(sixtyMinute,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
		}

		if (i % 120 == 0) {

			push_series_data(twohours,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
		} 

		if (i % 160 == 0) {

			push_series_data(threeHours,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
		} 

		if (i % 240 == 0) {

			push_series_data(fourHours,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
		} 

		push_series_data(minuteData,res_time,data[i]['data'][0]['name'],pass_time,open,high,low,close)
	}


	candleSeries.setData(minuteData);
})


socket.on('data',function(data){
	$('#result_table tbody').find('tr').last().remove();
	lastDigit++;
	var pass_time = data['result']['time_stamp'];
	var open = data['result']['data'][0]['data_val']['open'];
	var high = data['result']['data'][0]['data_val']['high'];
	var low = data['result']['data'][0]['data_val']['low'];
	var close = data['result']['data'][0]['data_val']['close'];
	var res_time = pass_time[10]+''+pass_time[11]+''+pass_time[12]+''+pass_time[13]+''+pass_time[14]+''+pass_time[15];

	push_series_data(minuteData,res_time,data['result']['data'][0]['name'],pass_time,open,high,low,close)


	if ((lastDigit - 1) % 2 == 0) {
		$('#result_table tbody').prepend('<tr >'+
						'<td>'+res_time+'</td>'+
						'<td>'+data['result']['data'][0]['name']+'</td>'+
						'<td>'+open+'</td>'+
						'<td>'+high+'</td>'+
						'<td>'+low+'</td>'+
						'<td>'+close+'</td>'+
					'</tr>')
	} else {

	$('#result_table tbody').prepend('<tr class="odd">'+
					'<td>'+res_time+'</td>'+
					'<td>'+data['result']['data'][0]['name']+'</td>'+
					'<td>'+open+'</td>'+
					'<td>'+high+'</td>'+
					'<td>'+low+'</td>'+
					'<td>'+close+'</td>'+
				'</tr>')
	}

	
	if (change == '1m' || !change) {
		updateCandleSeries(candleSeries,res_time,data['result']['data'][0]['name'],pass_time,open,high,low,close);
	}


	if (lastDigit % 5 == 0) {
		push_series_data(fiveMinute,pass_time,open,high,low,close)
		updateCandleSeries(candleSeries,res_time,data['result']['data'][0]['name'],pass_time,open,high,low,close);

	} else if (lastDigit % 30 == 0) {

		push_series_data(thirtyMinute,pass_time,open,high,low,close)
		updateCandleSeries(candleSeries,res_time,data['result']['data'][0]['name'],pass_time,open,high,low,close);


	} else if (lastDigit % 60 == 0) {
		push_series_data(sixtyMinute,pass_time,open,high,low,close)
		updateCandleSeries(candleSeries,res_time,data['result']['data'][0]['name'],pass_time,open,high,low,close);
	}





})


function createSimpleSwitcher(items, activeItem, activeItemChangedCallback) {
	var switcherElement = document.createElement('div');
	switcherElement.classList.add('switcher');

	var intervalElements = items.map(function(item) {
		var itemEl = document.createElement('button');
		itemEl.innerText = item;
		itemEl.classList.add('switcher-item');
		itemEl.classList.toggle('switcher-active-item', item === activeItem);
		itemEl.addEventListener('click', function() {
			onItemClicked(item);
		});
		switcherElement.appendChild(itemEl);
		return itemEl;
	});

	function onItemClicked(item) {
		change = item;
		if (item === activeItem) {
			return;
		}
		intervalElements.forEach(function(element, index) {
			element.classList.toggle('switcher-active-item', items[index] === item);
		});

		activeItem = item;

		activeItemChangedCallback(item);
	}

	return switcherElement;
}

var intervals = ['1m', '5m', '10m', '15m' , '30m' , '1h' , '2h' , '3h' , '4h' ];


var seriesesData = new Map([
  ['1m', minuteData ],
  ['5m', fiveMinute ],
  ['10m', tenMinute ],
  ['15m', fifthteenMinute ],
  ['30m', thirtyMinute ],
  ['1h', sixtyMinute ],
  ['2h', twohours ],
  ['3h', threeHours ],
  ['4h', fourHours ],
]);



var chartElement = document.createElement('div');

var switcherElement = createSimpleSwitcher(intervals, intervals[0], syncToInterval);



document.body.appendChild(chartElement);
// document.getElementByClass('main_holder').appendChild(switcherElement);

$('.main_holder').append(switcherElement)

var candleSeries = null;

function syncToInterval(interval) {
	if (candleSeries) {
		chart.removeSeries(candleSeries);
		candleSeries = null;
	}
	candleSeries = chart.addCandlestickSeries();
	candleSeries.setData(seriesesData.get(interval));
	var data = seriesesData.get(interval);

	// console.log(data)
	if (data[0]) {

		$('#result_table tbody').html('');
		for(i = 0; i < 5; i++)
		{
			append_siries(data[i]['time_name'],data[i]['name'],data[i]['open'],data[i]['high'],data[i]['low'],data[i]['close'],i);
		}
	}



}

syncToInterval(intervals[0]);


// Update the graph
function updateCandleSeries(candleSeries,time_name,name,pass_time,open,high,low,close)
{
	candleSeries.update({
		name : name,
		time_name : time_name,
	    time: Date.parse(pass_time)/1000,
	    open: parseFloat(open).toFixed(2),
	    high: parseFloat(high).toFixed(2),
	    low: parseFloat(low).toFixed(2),
	    close: parseFloat(close).toFixed(2)
	});
}

// Pur value for each intervals
function push_series_data(data_arr_name,time_name,name,pass_time,open,high,low,close) {
	data_arr_name.push({
		name : name,
		time_name : time_name,
	    time: Date.parse(pass_time)/1000,
	    open: parseFloat(open).toFixed(2),
	    high: parseFloat(high).toFixed(2),
	    low: parseFloat(low).toFixed(2),
	    close: parseFloat(close).toFixed(2)
	})
}

function append_siries(time,name,open,high,low,close,pos) {


	if (pos % 2 != 0) {
		$('#result_table tbody').append('<tr class="odd">'+
						'<td>'+time+'</td>'+
						'<td>'+name+'</td>'+
						'<td>'+open+'</td>'+
						'<td>'+high+'</td>'+
						'<td>'+low+'</td>'+
						'<td>'+close+'</td>'+
					'</tr>')
	} else {

	$('#result_table tbody').append('<tr >'+
					'<td>'+time+'</td>'+
					'<td>'+name+'</td>'+
					'<td>'+open+'</td>'+
					'<td>'+high+'</td>'+
					'<td>'+low+'</td>'+
					'<td>'+close+'</td>'+
				'</tr>')
	}
}


