var authToken;

// Cookies Functions

function setCookie(key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value +';path=/'+ ';expires=' + expires.toUTCString();
}

function getCookie(key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

function deleteCookie(key) {
	document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// When the login form is submitted

$('#login-form').on('submit', function(evt){

	evt.preventDefault();

    formData = $(this).serialize() + "&action=login";

    $("#do-login").button('loading');

    $.post("/", formData, function(response) {

    	if (response.jsonCode == 200)
    	{
    		// success!

    		$("#login-error").hide();
    		$("#login-error").text("Success!").removeClass("alert-danger").addClass("alert-success");
    		$("#login-error").fadeIn('fast');

    		authToken = response.authToken;

    		setCookie('authToken', authToken);

    		initialize();
    		
    	}
    	else if (response.jsonCode == 405)
    	{
    		// email not verified

    		$("#login-error").text("Your email address has not been verified yet.");
    		$("#login-error").fadeIn('fast');
    		$("#do-login").button('reset');
    	}
    	else
    	{
    		// wrong email/password or doesnt exist

    		$("#login-error").text("Your email or password is incorrect. Please try again.");
    		$("#login-error").fadeIn('fast');
    		$("#do-login").button('reset');
    	}

    }, 'json');

});

// new transaction form is submmited
$('#new-transaction-form').on('submit', function(evt){

	evt.preventDefault();

	formData = $(this).serialize() + "&action=addTransaction&authToken=" + authToken;

	$("#save-transaction").button('loading');

	$.post("/", formData, function(response) {

		if (response.jsonCode == 200)
		{
			// it worked, hide modal and add transaction to the table

			$("#transaction-form-modal").modal('hide');

			add_transaction(response.transactionList[0]);
		}
		else
		{
			// authToken is invalid, go home

			go_home();
		}

	}, 'json');
});

// the new transaction form was closed, lets reset stuff 
$("#transaction-form-modal").on('hidden.bs.modal', function () {

	$("form", this)[0].reset();

	$("#transaction-date").val(new Date().toString('yyyy-MM-dd'));

	$("#save-transaction").button('reset');
})

// To format and add a transaction to the table
var add_transaction = function(transaction) {

	if (transaction.modified)
	{
		date = transaction.modifiedCreated;
		amount = transaction.modifiedAmount;
		merchant = transaction.modifiedMerchant;
	}
	else
	{
		date = transaction.created;
		amount = transaction.amount;
		merchant = transaction.merchant;
	}

	console.log(transaction);

	amount = Math.abs(amount.toFixed(2) / 100);

	date = new Date(date).toString('MMM d');

	$("<tr data-transaction-id='"+transaction.transactionID+"'><td>"+date+"</td><td>"+merchant+"</td><td>$"+amount+"</td></tr>").appendTo("#transactions-table");
};

// authToken invalid? go home
var go_home = function() {

	deleteCookie("authToken"); // "disable" the cookie

	window.location.replace("/");
}

// initialize: authToken is there and we'll try to load all the transactions
var initialize = function() {

	$('body').removeClass('login');

	document.title = 'Your Transactions List';

	// hide login form and display table

	$('#login-container').hide();

	$("#transactions-list-container").fadeIn("fast");

	// call the api to get all the transactions

	$.post("/", {action : 'getTransactions', authToken: authToken}, function(response) {

		if (response.jsonCode == 200)
		{
			// lets initialize some elements in the new transaction form and enable the button

			$("#transaction-date").val(new Date().toString('yyyy-MM-dd'));

			var picker = $('.datepicker').datepicker({
				format: 'yyyy-mm-dd'
			}).on('changeDate', function(evt) {
				picker.hide();
			}).data('datepicker');

			$('#add-transaction').attr("disabled", false);

			// add all the transactions to the table

			for (key in response.transactionList)
			{
				add_transaction(response.transactionList[key]);
			}

			// show the table!

			$("#loading-transactions").fadeOut("fast");
			$("#transactions-table").fadeIn();
		}
		else
		{
			// authToken is invalid, go home

			go_home();
		}

	}, 'json');
};

$(document).ready(function() {

	console.log('starting : )');

	// first page load, lets check the authToken cookie

	authToken = getCookie('authToken');

	// hide the loading icon "splash"

	$("#main-loading").hide();
	$("html").removeClass("loading");

	$("#main-container").fadeIn();

	// authToken is there, lets initialize

	if (authToken != null)
	{
		initialize();
	}


});
