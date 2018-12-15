var http = require('http');
var masterRoot = "masterHUB";
var deviceRoot = "/deviceList/";
var userRoot = "/userList/";
var roomRoot = "/roomList/";
var moodRoot = "/moodList/";
var dumpGPIOsRoot = "/dumpGPIOList/";
var RGBRoot = "/RGBRootList/";
var taskPerformRoot = "/TaskPerformList/";
var PIRRoot = "/PIRList/";

SlaveProvider = function() {
//	 masterStarted();
}

SlaveProvider.prototype.callSlave = function(ip,reqpath) {
//		console.log("In callSlave reqpath : " + reqpath);
		
		var options = {
				host: ip,
				port: 80,
				path: reqpath,
				method: 'GET'
			};

		var req = http.get(options, function (res) {
			var data = '';

			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end', function () {
				if (res.statusCode === 200) {} else {}
			});
		});
		req.on('error', function (err) {});

		// TIMEOUT PART
		req.setTimeout(1000, function () {
			//console.log("Server connection timeout (after 10 second)");
			req.abort();
		});
};

// check gpio is registered in room or in dump list area
SlaveProvider.prototype.getGPIOStatus = function(firebase, dumpGPIOsRootObj,
		dumpGPIOsRootRef, roomRootObj, roomRootRef, data, RGBRootObj, moodRootObj) {
	
	var isRegistered = true;
	var obj = JSON.parse(JSON.stringify(roomRootObj));
	var x, y;
	for (x in obj) {
		for (y in obj[x].devices) {
			for (d in obj[x].devices[y]) {
				var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));
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
	
	for (m in moodRootObj) {
		var mx, my;
		var obj = moodRootObj[m];
		for (mx in obj) {
			for (my in obj[mx].devices) {
				for (md in obj[mx].devices[my]) {
					var deviceObj = JSON.parse(JSON.stringify(obj[mx].devices[my][md]));
					var ip = deviceObj.ip;
					var state = deviceObj.state;
					var pwm = deviceObj.pwm;
					if (data.mac_gpio == deviceObj.mac_gpio) {
						firebase.database().ref(masterRoot + moodRoot + "/" + m + "/" + mx +"/devices/" + my + "/" + md + "/").update({
						      ip: data.ip,
						    });
						break;
					} 
				}
			}
		}
	}
	
	for (var x in RGBRootObj) {
		if (data.mac_gpio == RGBRootObj[x].mac_gpio) {
			if (data.ip != RGBRootObj[x].ip) {
				firebase.database().ref(
						masterRoot + RGBRoot + "/" + x).update({
					ip : data.ip,
				});
			}
			isRegistered = false;
			break;
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

SlaveProvider.prototype.callSlaveMasterStarted = function(obj) {
	var ip = '192.168.0.0';
	for(var i = 0; i <= 255; i++){
		this.callSlave(ip.substring(0,ip.lastIndexOf(".")+1) + i, '/masterStart');
	}
	
	var x, y;
	for (x in obj) {
		for (y in obj[x].devices) {
			for (d in obj[x].devices[y]) {
				var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));
				this.callSlave(deviceObj.ip, '/masterStart');
			}
		}
	}
	
}
exports.SlaveProvider = SlaveProvider;