var pomelo = require('pomelo');
var bearcat = require('bearcat');

// route definition for chat server
var chatRoute = function(session, msg, app, cb) {
  var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}
	dispatcher = bearcat.getBean('dispatcher');
	var res = dispatcher.dispatch(session.get('rid'), chatServers);

	cb(null, res.id);
};


/**
 * Init app for client.
 */
var app = pomelo.createApp();

var doConfigure = function(){
	app.set('name', 'chatofpomelo-websocket');

	// app configuration
	app.configure('production|development', 'connector', function(){
		app.set('connectorConfig',
			{
				connector : pomelo.connectors.hybridconnector,
				heartbeat : 3,
				// enable useDict will make route to be compressed 
				useDict: true,
				// enable useProto
				useProtobuf: true 
			});
	});

	app.configure('production|development', 'gate', function(){
		app.set('connectorConfig',
			{
				connector : pomelo.connectors.hybridconnector,
				useDict: true,
				// enable useProto
				useProtobuf: true
			});
	});

	// app configure
	app.configure('production|development', function() {
		// route configures
		app.route('chat', chatRoute);
		app.filter(pomelo.timeout());
	});

	app.configure('production|development', 'chat', function() {
		var filterBean = bearcat.getBean('filterBean');
		app.filter(filterBean);
	});
}

var contextPath = require.resolve('./context.json');
bearcat.createApp([contextPath]);

bearcat.start(function() {
  doConfigure();
  app.set('bearcat', bearcat);
  // start app
  app.start();
});

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});
