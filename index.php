<?php
session_start();

define('EXPENSIFY', dirname(__FILE__) );

require_once(EXPENSIFY.'/classes/expensify.php');

if (isset($_POST['action']))
{
	switch ($_POST['action']) {

		case 'login':

			// user wants to log in
			
			$login_data = array('user' => $_POST['partnerUserID'], 'pass' => $_POST['partnerUserSecret']);

			$expensify = new Expensify($login_data);

			echo $expensify->get(array('command' => 'Authenticate', 'useExpensifyLogin' => 'true'));

			break;

		case 'getTransactions':

			// get all transactions

			$expensify = new Expensify(array('authToken' => $_POST['authToken']));

			echo $expensify->get(array('command' => 'Get', 'returnValueList' => 'transactionList'));

			break;

		case 'addTransaction':

			// add a transaction

			$expensify = new Expensify(array('authToken' => $_POST['authToken']));

			echo $expensify->get(array(
				'command' => 'CreateTransaction', 
				'created' => $_POST['created'],
				'amount' => $_POST['amount'] * 100,
				'merchant' => $_POST['merchant']
			));

			break;
		
		default:
			
			break;
	}

	exit();
}

include('main.html');
