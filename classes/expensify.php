<?php

Class Expensify {

	protected $partnerName = 'applicant';
	protected $partnerPassword = 'd7c3119c6cdab02d68d9';
	protected $partnerUserID;
	protected $partnerUserSecret;
	protected $authToken = '';
	protected $url = 'https://api.expensify.com';
	protected $cookies;

	public function __construct($params){
		
		if (isset($params['authToken']))
		{
			$this->authToken = $params['authToken'];
		}
		else
		{
			$this->partnerUserID = $params['user'];
			$this->partnerUserSecret = $params['pass'];

			if (isset($_SESSION['cookies_file']))
			{
				$this->cookies = $_SESSION['cookies_file'];
			}
			else
			{
				$this->cookies = tempnam ("tmp", "CURLCOOKIE");
				$_SESSION['cookies_file'] = $this->cookies;
			}
		}
		
	}	

	public function get($data)
	{
		if ($this->authToken != '')
		{
			$data['authToken'] = $this->authToken;
		}
		else
		{
			$data['partnerUserID'] = $this->partnerUserID;
			$data['partnerUserSecret'] = $this->partnerUserSecret;
		}

		$data['partnerName'] = $this->partnerName;
		$data['partnerPassword'] = $this->partnerPassword;

		$query = http_build_query($data);

	    $json_resp = utf8_encode(file_get_contents($this->url . '?' .$query));

	    //decode to an associative array
	    //$array_resp = json_decode($json_resp, true);

	    return $json_resp;
	}

}
