var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var util = require('util');
var restclient = require('restler');

var fxml_url = 'http://flightxml.flightaware.com/json/FlightXML2/';
var username = 'aarati';
var apiKey = 'e7cde68230f47eb31dc1baf382c2c949449389b8';



// restclient.get(fxml_url + 'MetarEx', {
//     username: username,
//     password: apiKey,
//     query: {airport: 'KAUS', howMany: 1}
// }).on('success', function(result, response) {
//     // util.puts(util.inspect(result, true, null));
//     var entry = result.MetarExResult.metar[0];
//     util.puts('The temperature at ' + entry.airport + ' is ' + entry.temp_air + 'C');
// });



users = [];
connections = [];

server.listen(process.env.PORT || 3000);

console.log('server running')

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
})


io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('connected: %s sockets connected', connections.length)

	//Disconnect
	socket.on('disconnect', function(data){
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	})

	//Send Message
	socket.on('get flight', function(data){
		var name = data;
		restclient.get(fxml_url + 'FlightInfoEx', {
		    username: username,
		    password: apiKey,
		    query: {ident: "0x" + data, howMany: 10, filter: '', offset: 0}
		}).on('success', function(result, response) {

		    //util.puts(util.inspect(result, true, null));
		    if (result['FlightInfoExResult']) {
				    var flights = result['FlightInfoExResult']['flights'];
		   //  SearchResult:
		   // { next_offset: 10,
		   //   aircraft
		   // console.log(flights[0]['originCity'],flights[0]['destinationCity'])
		   //  console.log(flights)
		   io.sockets.emit('flight origin', {origin: flights[0]['originCity'], destination: flights[0]['destinationCity'], flightname: name});

		    }
 //io.sockets.emit('flight origin', {origin: data, destination: connections.indexOf(socket), flightname: });
		    // for (i in flights) {
		    //   var flight = flights[i];
		    //   //util.puts(util.inspect(flight));
		    //    io.sockets.emit('new flight', {msg: flight, flightname: flight['faFlightID']});
		    // }
		});


	});
// 40.692716, lng: -73.946213

});