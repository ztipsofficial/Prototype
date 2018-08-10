var url_parts = url.parse(req.url, true);
var query1 = url_parts.query;

  // Build the post string from an object
var query=querystring.stringify(query1);
  

var post_options = {
	  host: 'steamcommunity.com',
	  port: '443',
	  path: '/openid/login?',
	  method: 'POST',
	  headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  'Content-Length': Buffer.byteLength(query)
	  }
  };

var post_req = http.request(post_options, function(res) {
  res.setEncoding('utf-8');
  var fullBody = '';
 res.on('data', function (chunk) {
 		  fullBody += chunk.toString();
 	  });
res.on('end', function() {
	  
var pattern=/is_valid:true/g;
var result = pattern.test(fullBody);
// i need the result of this to be 
	})
});

post_req.write(query);

post_req.end();
//HERE
res.end();
