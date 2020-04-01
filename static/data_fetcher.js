

$.ajax({
	url : '/user_info',
	method : 'get',
	success:function(data){
		if (data['status'] != "404") {
			var name = data['information'][0]['username'];
			var money = data['information'][0]['money'];
			$('#username_info').html(name);
			$('#current_money_info').html(money);

			$('#log-out-in').html('Log out');
			$('#log-out-in').attr('hreh' , '/user/logout');
			user_money = money;

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



$.ajax({
	url : '/get_bet',
	method : 'post',
	success:function(data){
		if (data[0]) {

			user_sell_bet = 0;
			user_buy_bet = 0;
			$('#bet_buy_number').html(data[0]['buy']);
			$('#bet_sell_number').html(data[0]['sell']);
		}

	}
})


$(document).ready(function(){
	$('.buy_button').click(function(){
		var bet = parseInt($(this).val());
		var add_bet = parseInt($('#bet_buy_number').html());
		var max = 3000000;
		var total_bet = add_bet += bet;

		

		if (user_money >= bet) {
			user_buy_bet += bet;
			
			if (user_buy_bet <= max) {
				user_money -= bet;
				$('#bet_buy_number').html(total_bet);
				$('#bet_buy_number').css('opacity' , '0.1')
				$('#current_money_info').html(user_money);
			} else {
				var remainder = max - total_bet;
				$('#bet_buy_number').html(total_bet += remainder);
				$('#bet_buy_number').css('opacity' , '0.1')
				$('#current_money_info').html(0);
			}
		} else {
			alert('NOT ENOGHT MONEY')
		}

	})

	$('.sell_button').click(function(){
		var bet = parseInt($(this).val());
		var add_bet = parseInt($('#bet_sell_number').html());
		var max = 3000000;
		var total_bet = add_bet += bet;
		
		if (user_money >= bet) {
			user_sell_bet += bet;
			if (user_sell_bet <= max) {
				user_money -= bet;
				$('#bet_sell_number').html(total_bet);
				$('#bet_sell_number').css('opacity' , '0.1')
				$('#current_money_info').html(user_money);
			} else {
				var remainder = max - total_bet;
				$('#bet_sell_number').css('opacity' , '0.1')
				$('#bet_sell_number').html(total_bet += remainder);
				$('#current_money_info').html(0);
			}

		} else {
			alert('NOT ENOGHT MONEY')
		}
	})

})

$('#confirmbet').click(function(){
	var confirmation_bet = user_buy_bet + user_sell_bet;
	if (confirmation_bet > 0) {
		$('#buy_confirm_money').html(user_buy_bet);
		$('#sell_confirm_money').html(user_sell_bet);
		$('#open_modal').click();
	}
})


$('#place_bet').click(function(){
	var confirmation_bet = user_buy_bet + user_sell_bet;
	$.ajax({
		url : '/user_info',
		method : 'get',
		success:function(data){

			if (data['information'][0]['money'] >= confirmation_bet) {
				$.ajax({
					url : '/place_bet',
					method : 'post',
					data : {'sell' : user_sell_bet , 'buy' : user_buy_bet , email : data['email']},
					success:function(data){
						// console.log(data)
						if (data['status'] == 'ok') {
							var updated_money = user_buy_bet + user_sell_bet;
							$('#current_money_info').html(user_money);
							user_sell_bet = 0;
							user_buy_bet = 0;
							$('#bet_buy_number').css('opacity' , '1')
							$('#bet_sell_number').css('opacity' , '1')
							$('#exampleModal').modal('hide');
						}
					}
				})
			}
		}
	})
	
})


$('#reset_all_bet').click(function(){

	$.ajax({
		url : '/user_info',
		method : 'get',
		success:function(data){
			user_money = data['information'][0]['money'];
			$('#current_money_info').html(data['information'][0]['money']);
			$.ajax({
				url : '/get_bet',
				method : 'post',
				success:function(data){
					
					if (data[0]) {
						user_buy_bet = data[0]['buy'];
						user_sell_bet = data[0]['sell'];
						$('#bet_buy_number').html(data[0]['buy'])
						$('#bet_sell_number').html(data[0]['sell']);
						$('#bet_buy_number').css('opacity' , '1');
						$('#bet_sell_number').css('opacity' , '1');
					} else {
						user_buy_bet = 0;
						user_sell_bet = 0;
						$('#bet_buy_number').html(0)
						$('#bet_sell_number').html(0);
						$('#bet_buy_number').css('opacity' , '1');
						$('#bet_sell_number').css('opacity' , '1');
					}
				}
			})
		}
	})

});

