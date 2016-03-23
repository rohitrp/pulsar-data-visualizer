'use strict';

var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/public/index.html');
});

app.listen(port, function() {
  console.log('Listening at port ' + port + '...');
});