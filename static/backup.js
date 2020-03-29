var socket = io();
var vol_stat = 0;
var container = document.getElementById('chart');
socket.emit('new_user');

var c_width = $('#chart').width();
var c_height = $('#chart').height();


var chart = LightweightCharts.createChart(document.getElementById('chart'), {
	width: c_width,
  	height: c_height,
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



window.onresize = function(event) {
   chart.resize(c_width, c_height);

};


var areaSeries = chart.addAreaSeries({
	topColor: 'rgba(38,198,218, 0.56)',
	bottomColor: 'rgba(38,198,218, 0.04)',
	lineColor: 'rgba(38,198,218, 1)',
	lineWidth: 2,
});

var volumeSeries = chart.addHistogramSeries({
	color: '#26a69a',
	lineWidth: 2,
	priceFormat: {
		type: 'volume ',
	},
	overlay: true,
	scaleMargins: {
		top: 0.9,
		bottom: 0,
	},
});


chart.applyOptions({
    timeScale: {
        rightOffset: 2,
        barSpacing: 60,
        fixLeftEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: false,
        borderVisible: false,
        borderColor: '#fff000',
        visible: true,
        timeVisible: true,
        secondsVisible: true,
    },
});

var toolTipWidth = 96;
var toolTipHeight = 80;
var toolTipMargin = 15;
var priceScaleWidth = 50;

var toolTip = document.createElement('div');
toolTip.className = 'floating-tooltip-2';
container.appendChild(toolTip);

// update tooltip
chart.subscribeCrosshairMove(function(param) {
	if (!param.time || param.point.x < 0 || param.point.x > c_width || param.point.y < 0 || param.point.y > c_height) {
		toolTip.style.display = 'none';
		return;
	}

	var dateStr = LightweightCharts.isBusinessDay(param.time)
		? businessDayToString(param.time)
		: new Date(param.time * 1000).toLocaleDateString();


	toolTip.style.display = 'block';
	var price = param.seriesPrices.get(areaSeries);
	toolTip.innerHTML = '<div style="color: rgba(0, 120, 255, 0.9)">⬤ USD/KRW</div>' +
		'<div style="font-size: 24px; margin: 4px 0px; color: rgb(45, 175, 169);">' + (Math.round(price * 100) / 100).toFixed(2) + '</div>' +
		'<div>' + dateStr + '</div>';

	var left = param.point.x / 1.3;

  
 	if (left > c_width - toolTipWidth - toolTipMargin) {
		left = c_width - toolTipWidth;
	} else if (left < toolTipWidth / 2) {
  	left = priceScaleWidth;
  }

	toolTip.style.left = left + 'px';
	toolTip.style.top = 0 + 'px';
});




socket.on('chart_data',function(data){
	console.log(data[0])
	var data_len = data.length;
	var data_holder = [];
	var data_vol = [];
	for(i = 0; i < data_len; i++)
	{

		var pass_time = data[i]['time_stamp'];
		var value_obj = data[i]['data'][0]['data_val']['lp'];
		var vol_obj = data[i]['data'][0]['data_val']['volume'];
		var arr_obj =  { time :  Date.parse(pass_time) / 1000  , value: value_obj }


		
		
		data_holder.push(arr_obj);
		
		var num = vol_obj;
		num = num.replace(/\,/g,''); // 1125, but a string, so convert it to number
		vol_obj =parseInt(num,10);

		console.log(vol_stat)
		if (vol_stat < value_obj) {
			data_vol.push({ time: Date.parse(pass_time) / 1000, value: value_obj, color: 'rgba(0, 150, 136, 0.8)' })
		} else {
		
			data_vol.push({ time: Date.parse(pass_time) / 1000, value: value_obj, color: 'rgba(255,82,82, 0.8)' })
		}

		vol_stat = value_obj;

	}
	areaSeries.setData(data_holder);
	// volumeSeries.setData(data_vol);
})





socket.on('data',function(data){
	var pass_time = data['currency_obj']['time_stamp'];
	var value = data['currency_obj']['data'][0]['data_val']['lp'];
	areaSeries.update({
	    time: Date.parse(pass_time)/1000,
	    value: value,
	});
})
