var crc = require('crc');

var Dispather = function(){
}

// select an item from list based on key
Dispather.prototype.dispatch = function(key, list) {
	var index = Math.abs(crc.crc32(key)) % list.length;
	return list[index];
};

module.exports = {
	id: "dispatcher",
	func: Dispather 
}