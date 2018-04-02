var bearcat = require('bearcat');

var Handler = function(app) {
	this.app = app;
	tihs.dispatcher = null;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next step callback
 *
 */
handler.queryEntry = function(msg, session, next) {
	var uid = msg.uid;
	if(!uid) {
		next(null, {
			code: 500
		});
		return;
	}
	// get all connectors
	var connectors = this.app.getServersByType('connector');
	if(!connectors || connectors.length === 0) {
		next(null, {
			code: 500
		});
		return;
	}
	// select connector, because more than one connector existed.
	var res = this.dispatcher.dispatch(uid, connectors);
	next(null, {
		code: 200,
		host: res.host,
		port: res.clientPort
	});
};

module.exports = function(app) {
	return bearcat.getBean({
		id: "gateHandler",
		func: Handler,
		args: [{
			name: "app",
			value: app
		}],
		props: [{
			name: "dispatcher",
			ref: "dispatcher"
		}]
	});
};

