var http = require('http');
var masterRoot = "masterHUB";
var deviceRoot = "/deviceList/";
var userRoot = "/userList/";
var roomRoot = "/roomList/";
var moodRoot = "/moodList/";
var dumpGPIOsRoot = "/dumpGPIOList/";

function masterStarted() {
	console.log("masterStarted......");
	var db_name = "build";
	var url = "mongodb://localhost:27017/" + db_name;

	MongoClient.connect(url, function(err, db) {
		if (err)
			throw err;
		var dbo = db.db(db_name);
		console.log("connected...");

		dbo.collection("slave").distinct("ip", function(err, docs) {

			for (var i = 0; i < docs.length; i++) {
				console.log("docs : " + docs[i]);
				var options = {
					host : docs[i],
					port : 80,
					path : '/masterStart',
					method : 'GET'
				};

				http.request(options, function(res) {
					res.on('timeout', function(err) {
						console.error(err);
					});

					res.on('data', function(chunk) {
						console.log(chunk);
					});
				}).end();
			}
		});

		dbo.close();
	});
}

SlaveProvider = function() {
	// masterStarted();
}

// check gpio is registered in room or in dump list area
SlaveProvider.prototype.getGPIOStatus = function(firebase, dumpGPIOsRootObj,
		dumpGPIOsRootRef, roomRootObj, roomRootRef, data) {
	
	var isRegistered = true;
	var obj = JSON.parse(JSON.stringify(roomRootObj));
	var x, y;
	for (x in obj) {
		for (y in obj[x].devices) {
			for (d in obj[x].devices[y]) {
				var deviceObj = JSON
						.parse(JSON.stringify(obj[x].devices[y][d]));
				var ip = deviceObj.ip;
				var state = deviceObj.state;
				var pwm = deviceObj.pwm;
				
				if (data.mac_gpio == deviceObj.mac_gpio) {
					firebase.database().ref(masterRoot + roomRoot + "/" + x + "/devices/" + y + "/" + d + "/").update({
					      ip: data.ip,
					    });
					isRegistered = false;
					break;
				} 
			}
		}
	}
	
	if (isRegistered) {
		var obj = JSON.parse(JSON.stringify(dumpGPIOsRootObj));
		for (x in obj) {
			if (data.mac_gpio == obj[x].mac_gpio) {
				if (data.ip != obj[x].ip) {
					firebase.database().ref(
							masterRoot + dumpGPIOsRoot + "/" + x).update({
						ip : data.ip,
					});
				}
				isRegistered = false;
				break;
			}
		}
	}

	if (isRegistered) {
		var newPostRef = dumpGPIOsRootRef.push();
		var postId = newPostRef.key;
		var updates = {};
		updates[postId] = data;
		dumpGPIOsRootRef.update(updates);
	}
	
};

exports.SlaveProvider = SlaveProvider;