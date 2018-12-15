var masterRoot = "masterHUB";
var deviceRoot = "/deviceList/";
var userRoot = "/userList/";
var roomRoot = "/roomList/";
var moodRoot = "/moodList/";
var dumpGPIOsRoot = "/dumpGPIOList/";
var RGBRoot = "/RGBRootList/";
var taskPerformRoot = "/TaskPerformList/";
var PIRRoot = "/PIRList/";

var firebase = require('firebase-admin');

var serviceAccount = require('C:\\work\\Workspace\\Live\\mylive-4a5c9-firebase-adminsdk-oppmv-024b6207f0.json');

firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: 'https://mylive-4a5c9.firebaseio.com'
});

var ref = firebase.database().ref(masterRoot);
var deviceRootRef = firebase.database().ref(masterRoot + deviceRoot);
var roomRootRef = firebase.database().ref(masterRoot + roomRoot);
var dumpGPIOsRootRef = firebase.database().ref(masterRoot + dumpGPIOsRoot);
var moodRootRef = firebase.database().ref(masterRoot + moodRoot);
var RGBRootRef = firebase.database().ref(masterRoot + RGBRoot);
var TaskPerformRootRef = firebase.database().ref(masterRoot + taskPerformRoot);
var PIRRootRef = firebase.database().ref(masterRoot + PIRRoot);

var express = require('express'),
	routes = require('./routes'),
	user = require('./routes/user'),
	http = require('http'),
	path = require('path'),
	SlaveProvider = require('./slaveprovider').SlaveProvider,
	//    cron = require("node-cron"),
	schedule = require('node-schedule'),
	Map = require("collections/map"),
	_ = require('lodash');

require('events').EventEmitter.prototype._maxListeners = 100;
var SlaveProvider = new SlaveProvider();
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

var roomRootObj = null;
var deviceRootObj = null;
var dumpGPIOsRootObj = null;
var moodRootObj = null;
var RGBRootObj = null;
var PIRRootObj = null;
var daysIndexArr = [""];
var map = new Map();
var isInitailLoad = true;

http.createServer(app).listen(app.get('port'), function () {
	console.log('Express server listening on port ' + app.get('port'));
	
	PIRRootRef.on('value', function (data) {
		PIRRootObj = JSON.parse(JSON.stringify(data));
	});

	TaskPerformRootRef.on('value', function (data) {
		var obj = JSON.parse(JSON.stringify(data));

		for (x in obj) {

			if (obj[x].freeze != true) {

				var action = "/receiveRequest?";
				if (obj[x].pwm_support == 'TRUE') {
					action = "/receivePWMRequest?";
				}

				var reqpath = action + 'gpio=' + obj[x].mac_gpio.split("-")[1] + '&state=' + obj[x].state + '&pwm=' + obj[x].pwm;
				SlaveProvider.callSlave(obj[x].ip, reqpath);
			}

			TaskPerformRootRef.child(x).remove();
		}
	});

	roomRootRef.on('value', function (data) {
		roomRootObj = JSON.parse(JSON.stringify(data)); 
		schedularScanner(JSON.parse(JSON.stringify(data)));
		
		var x, y, s;
		for (x in roomRootObj) {
			for (y in roomRootObj[x].devices) {
				for (d in roomRootObj[x].devices[y]) {
					var deviceObj = JSON.parse(JSON.stringify(roomRootObj[x].devices[y][d]));
					var data = roomRootObj[x].devices[y][d];
					data.room_id = x;
					data.device_id = d;
					map.set(deviceObj.mac_gpio, data);
				}
			}
		}
		
		if(isInitailLoad){
			SlaveProvider.callSlaveMasterStarted(roomRootObj);	
			isInitailLoad = false;
		}
		
 	});
	
	RGBRootRef.on('value', function (data) {
		RGBRootObj = JSON.parse(JSON.stringify(data));

		for (var x in RGBRootObj) {
			var receiveMusicalModeRequestStr = RGBRootObj[x].receiveMusicalModeRequest;
			var receiveSingleColorRequestStr = RGBRootObj[x].receiveSingleColorRequest;
			var receiveAutoColorRequestStr = RGBRootObj[x].receiveAutoColorModeRequest;
			var R = RGBRootObj[x].R;
			var G = RGBRootObj[x].G;
			var B = RGBRootObj[x].B;
			var state = RGBRootObj[x].state;
			var ip = RGBRootObj[x].ip;

			var reqpath = "/receiveRequest?state=" + state + "&R=" + R + "&G=" + G + "&B=" + B + "&receiveSingleColorRequest=" + receiveSingleColorRequestStr + "&receiveAutoColorModeRequest=" + receiveAutoColorRequestStr + "&receiveMusicalModeRequest=" + receiveMusicalModeRequestStr;
			SlaveProvider.callSlave(ip, reqpath);
		}

	});

	dumpGPIOsRootRef.on('value', function (data) {
		dumpGPIOsRootObj = data;
	});

	moodRootRef.on('value', function (data) {
		moodRootObj = JSON.parse(JSON.stringify(data));

		const jobNames = _.keys(schedule.scheduledJobs);
		for (var name of jobNames) {
			if (name.search('mood-schedular-') != -1) {
				schedule.cancelJob(name);
			}
		}

		for (x in moodRootObj) {
			if (moodRootObj[x].mood_checked == "true") {
				//to call mood settings....
				RoomConfiguration(JSON.parse(JSON.stringify(moodRootObj[x])));
			} else {
				//to call room settings....
				RoomConfiguration(JSON.parse(JSON.stringify(roomRootObj)));
			}

			for (y in moodRootObj[x].schedular) {
				var dayVal = moodRootObj[x].schedular[y].dayVal;

				if (moodRootObj[x].schedular[y].checked == true) {
					var days = [];

					for (var i in dayVal) {
						days[i] = parseInt(dayVal[i]); 
					}

					var rule = new schedule.RecurrenceRule();
					rule.dayOfWeek = days;
					rule.hour = parseInt(moodRootObj[x].schedular[y].hourVal);
					rule.minute = parseInt(moodRootObj[x].schedular[y].minuteVal);

					schedule.scheduleJob('mood-schedular-' + y, rule, function () {
						moodRootRef.child(x).update({
							mood_checked: true
						});
						RoomConfiguration(JSON.parse(JSON.stringify(moodRootObj[x])));
					});
				}
			}
		}
	});

	deviceRootRef.on('value', function (data) {
		deviceRootObj = data;
	});

});

function RoomConfiguration(obj) {
	var x, y, s;
	for (x in obj) {
		for (y in obj[x].devices) {
			for (d in obj[x].devices[y]) {
				var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));

				if (typeof deviceObj.mac_gpio != 'undefined') {
					if (deviceObj.freeze != true) {
						var reqpath = '/receiveRequest?gpio=' + deviceObj.mac_gpio.split("-")[1] + '&state=' + deviceObj.state + '&pwm=' + deviceObj.pwm;
						SlaveProvider.callSlave(deviceObj.ip, reqpath);
					}
				}
			}
		}
	}
}

function schedularScanner(obj) {
	const jobNames = _.keys(schedule.scheduledJobs);
	for (var name of jobNames) {
		if (name.search('device-schedular-') != -1) {
			schedule.cancelJob(name);
		}
	}

	var x, y, s;
	for (x in obj) {
		for (y in obj[x].devices) {
			for (d in obj[x].devices[y]) {
				var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));
				if (typeof deviceObj.mac_gpio != 'undefined' && typeof deviceObj.schedular != 'undefined' && deviceObj.freeze != true ) {
					for (s in deviceObj.schedular) {
						if ( deviceObj.schedular[s].checked == true) {
							var days = [];

							for (var i in dayVal) {
								days[i] = parseInt(dayVal[i]);
							}

							var onrule = new schedule.RecurrenceRule();
							onrule.dayOfWeek = days;
							onrule.hour = parseInt(deviceObj.schedular[s].onTimeHourVal);
							onrule.minute = parseInt(deviceObj.schedular[s].onTimeMinuteVal);

							schedule.scheduleJob('device-schedular-on-' + s, onrule, function () {
								roomRootRef.child(x).child("devices").child(y).child(d).update({
									pwm: "100",
									state: "HIGH"
								});
								
								var action = "/receiveRequest?";
								if (deviceObj.pwm_support == 'TRUE') {
									action = "/receivePWMRequest?";
								}

								var reqpath = action + 'gpio=' + deviceObj.mac_gpio.split("-")[1] + '&state=HIGH&pwm=100';
								SlaveProvider.callSlave(deviceObj.ip, reqpath);
							});

							var offrule = new schedule.RecurrenceRule();
							offrule.dayOfWeek = days;
							offrule.hour = parseInt(deviceObj.schedular[s].offTimeHourVal);
							offrule.minute = parseInt(deviceObj.schedular[s].offTimeMinuteVal);

							schedule.scheduleJob('device-schedular-off-' + s, offrule, function () {
								roomRootRef.child(x).child("devices").child(y).child(d).update({
									pwm: "0",
									state: "LOW"
								});
								
								var action = "/receiveRequest?";
								if (deviceObj.pwm_support == 'TRUE') {
									action = "/receivePWMRequest?";
								}

								var reqpath = action + 'gpio=' + deviceObj.mac_gpio.split("-")[1] + '&state=LOW&pwm=0';
								SlaveProvider.callSlave(deviceObj.ip, reqpath);
							});
						}
					}
				}
			}
		}
	}
}

//MOBILE APP REQUEST
app.get('/app/request', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	var id = req.param('id');
	var room_id = req.param('room_id');
	var mac_gpio = req.param('mac_gpio');
	var state = req.param('state');
	var pwm = req.param('pwm');
	var gpio = mac_gpio.split('-')[1];
	var group = req.param('group');

	roomRootRef.child(req.param('room_id')).child("devices").child(group).child(req.param('id')).once("value", function (data) {
		var obj = JSON.parse(JSON.stringify(data));
		console.log("obj : " + JSON.stringify(data));
		var ip = obj.ip;
		var data = {
			mac_gpio: obj.mac_gpio,
			state: state,
			pwm: pwm,
			ip: obj.ip,
			current_sensor: obj.current_sensor,
			device: obj.device,
			device_serial: obj.device_serial,
			pwm_support: obj.pwm_support,
			group: obj.group,
			cust_device: obj.cust_device
		};

		var updates = {};
		updates[room_id + "/devices/" + obj.group + "/" + id] = data;
		roomRootRef.update(updates);

		var reqpath = '/receiveRequest?gpio=' + gpio + '&state=' + state + '&pwm=' + pwm;
		SlaveProvider.callSlave(ip, reqpath);

	});
	res.end("TRUE");

});

//slave new
app.get('/slave/new', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	if (req.param('mac_gpio').search("RGB-") != -1 || req.param('mac_gpio').search("PIR-") != -1) {
		var data = {
			mac_gpio: req.param('mac_gpio'),
			ip: req.param('ip'),
		};

		SlaveProvider.getGPIOStatus(firebase, dumpGPIOsRootObj, dumpGPIOsRootRef, roomRootObj, roomRootRef, data, RGBRootObj, moodRootObj);

	} else {
		var data = {
			mac_gpio: req.param('mac_gpio'),
			ip: req.param('ip'),
			state: req.param('state'),
			pwm: req.param('pwm'),
			current_sensor: req.param('current_sensor'),
		};

		SlaveProvider.getGPIOStatus(firebase, dumpGPIOsRootObj, dumpGPIOsRootRef, roomRootObj, roomRootRef, data, RGBRootObj, moodRootObj);
	}

	res.end("TRUE");
});

//slave request for switch pressing
app.get('/slave/request', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	if (req.param('mac_gpio').search('PIR') != -1) {
		for (var p in PIRRootObj) {
			if (PIRRootObj[p].mac_gpio == req.param('mac_gpio')) {
				if (PIRRootObj[p].state == true) {
					for (var pd in PIRRootObj[p].devices) {
						var pir_trigger_mac_gpio = PIRRootObj[p].devices[pd].mac_gpio;
						var obj = roomRootObj;
						var x, y;
						for (x in obj) {
							for (y in obj[x].devices) {
								for (d in obj[x].devices[y]) {
									var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));
									var ip = deviceObj.ip;
									var gpio = deviceObj.mac_gpio;
									var freeze = deviceObj.freeze;
									if (gpio == pir_trigger_mac_gpio) {
										if (freeze != true) {
											var data = {
												mac_gpio: deviceObj.mac_gpio,
												state: 'HIGH',
												pwm: '100',
												ip: deviceObj.ip,
												current_sensor: deviceObj.current_sensor,
												device: deviceObj.device,
												//                            device_serial: deviceObj.device_serial,
												pwm_support: deviceObj.pwm_support,
												group: deviceObj.group,
												cust_device: deviceObj.cust_device
											};

											var updates = {};
											updates[x + "/devices/" + deviceObj.group + "/" + d] = data;
											roomRootRef.update(updates);

											var action = "/receiveRequest?";
											if (deviceObj.pwm_support == 'TRUE') {
												action = "/receivePWMRequest?";
											}

											var reqpath = action + 'gpio=' + deviceObj.mac_gpio.split("-")[1] + '&state=HIGH&pwm=100';
											
											SlaveProvider.callSlave(deviceObj.ip, reqpath);

											const jobNames = _.keys(schedule.scheduledJobs);
											for (var name of jobNames) {
												if (name.search('motion-detector-' + PIRRootObj[p].cust_device) != -1) {
													console.log("cancelling schedular...");
													schedule.cancelJob(name);
												}
											}

											schedule.scheduleJob('motion-detector-' + PIRRootObj[p].cust_device, '1 * * * * *', function () {
												var newreqpath = action + 'gpio=' + deviceObj.mac_gpio.split("-")[1] + '&state=LOW&pwm=0';
												SlaveProvider.callSlave(deviceObj.ip, newreqpath);
												
												var data = {
													mac_gpio: deviceObj.mac_gpio,
													state: 'LOW',
													pwm: '0',
													ip: deviceObj.ip,
													current_sensor: deviceObj.current_sensor,
													device: deviceObj.device,
													pwm_support: deviceObj.pwm_support,
													group: deviceObj.group,
													cust_device: deviceObj.cust_device
												};

												var updates = {};
												updates[x + "/devices/" + deviceObj.group + "/" + d] = data;
												roomRootRef.update(updates);
											});
										}
									}
								}
							}
						}
					}
				}
			}
		}

		res.end('true');
	} else {
 
		var deviceObj = JSON.parse(JSON.stringify(map.get(req.param('mac_gpio'))));

		if (deviceObj.freeze == true) {
			res.end('false');
		} else {
			res.end('true');

			var data = {
				mac_gpio: req.param('mac_gpio'),
				state: req.param('state'),
				pwm: req.param('pwm'),
				ip: deviceObj.ip,
				current_sensor: deviceObj.current_sensor,
				device: deviceObj.device,
				pwm_support: deviceObj.pwm_support,
				group: deviceObj.group,
				cust_device: deviceObj.cust_device
			};

			var updates = {};
			updates[deviceObj.room_id + "/devices/" + deviceObj.group + "/" + deviceObj.device_id] = data;
			roomRootRef.update(updates);
		}
	}
});

app.get('/app/getUnRegisteredGPIO', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	var response = "";

	dumpGPIOsRootRef.once("value", function (data) {
		// do some stuff once
		response = response + JSON.stringify(data) + "\n";
		res.end(response);
	});
});

//ROOM WEB SERVICE START ---------------------------------------------------
app.get('/setting/room/setRegisterRoom', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	console.log("room_type : " + req.param('room_type'));
	console.log("custom_name : " + req.param('custom_name'));

	var data = {
		room_type: req.param('room_type'),
		custom_name: req.param('custom_name')
	};

	var newPostRef = roomRootRef.push();
	var postId = newPostRef.key;

	var updates = {};
	updates[postId] = data;
	roomRootRef.update(updates);
	res.end("TRUE");
});

app.get('/setting/room/getRegisterRoom', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	var response = "";

	roomRootRef.once("value", function (data) {
		// do some stuff once
		response = response + JSON.stringify(data) + "\n";
		res.end(response);
	});
});

app.get('/app/getRegisteredDevicesByRoomType', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	var id = req.param('id');
	var group = req.param('group');
	var response = "";

	if (group === "ALL") {
		roomRootRef.child(id).child("devices").once("value", function (data) {
			res.end(JSON.stringify(data));
		});
	} else {
		roomRootRef.child(id).child("devices").child(group).once("value", function (data) {
			res.end(JSON.stringify(data));
		});
	}

});

app.get('/app/getRunningDevicesByRoomType', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	var id = req.param('id');
	var state = req.param('state');

	roomRootRef.child(id).child("devices").child().orderByChild("state").equalTo(state).once("value", function (data) {
		var obj = JSON.parse(JSON.stringify(data));
		res.end(obj);
	});

});

app.get('/setting/room/removeRegisterRoom', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	roomRootRef.child('/' + req.param('id')).remove();
	res.end("TRUE");
});

app.get('/app/deleteRegisteredDevicesByRoomType', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	roomRootRef.child(req.param('room_id')).child("devices").child(req.param('group')).child(req.param('id')).once("value", function (data) {
		var obj = JSON.parse(JSON.stringify(data));

		var data = {
			mac_gpio: obj.mac_gpio,
			ip: obj.ip,
			state: obj.state,
			pwm: obj.pwm,
			current_sensor: obj.current_sensor
		};

		var newPostRef = dumpGPIOsRootRef.push();
		var postId = newPostRef.key;

		var updates = {};
		updates[postId] = data;
		dumpGPIOsRootRef.update(updates);

		roomRootRef.child(req.param('room_id')).child("devices").child(req.param('group')).child(req.param('id')).remove();
	});

	res.end("TRUE");
});

app.get('/app/setRequestedRegisterGPIO', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	var room_id = req.param('room_id');
	var id = req.param('id');
	var mac_gpio = req.param('mac_gpio');
	var device = req.param('device');
	var device_serial = req.param('device_serial');
	var pwm_support = req.param('pwm_support');
	var group = req.param('group');
	var cust_device = req.param('cust_device');

	dumpGPIOsRootRef.child(id).once("value", function (dumpData) {
		// do some stuff once
		var response = JSON.stringify(dumpData) + "\n";

		var obj = JSON.parse(JSON.stringify(dumpData));
		var data = {
			mac_gpio: obj.mac_gpio,
			state: obj.state,
			pwm: obj.pwm,
			ip: obj.ip,
			current_sensor: obj.current_sensor,
			device: device,
			device_serial: device_serial,
			pwm_support: pwm_support,
			group: group,
			cust_device: cust_device
		};

		var newPostRef = roomRootRef.push();
		var postId = newPostRef.key;

		var updates = {};
		updates[room_id + "/devices/" + group + "/" + postId] = data;
		roomRootRef.update(updates);

		dumpGPIOsRootRef.child(id).remove();
		res.end(response);
	});

	res.end("{'isAllowed' : 'true'}");
});

//ROOM WEB SERVICE END ---------------------------------------------------

// APPLIACE WEB SERVICES START --------------------------------------------------------------------
app.get('/setting/application/addDevice', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	var data = {
		device: req.param('device'),
		pwm_status: req.param('pwm_status'),
		device_serial: req.param('device_serial'),
		group: req.param('group')
	};

	var newPostRef = ref.push();
	var postId = newPostRef.key;

	var updates = {};
	updates[deviceRoot + postId] = data;
	ref.update(updates);

	res.end("TRUE");
});

app.get('/app/getDevices', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	var response = "";

	deviceRootRef.once("value", function (data) {
		response = response + JSON.stringify(data) + "\n";
		res.end(response);
	});
});

app.get('/setting/application/deleteDevice', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	deviceRootRef.child('/' + req.param('id')).remove();
	res.end("TRUE");
});

//APPLIACE WEB SERVICES END -----------------------------------------------------------------------------

//MOODS WEB SERVICES START
app.get('/setting/mood/addMood', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	roomRootRef.once("value", function (data) {
		var obj = JSON.parse(JSON.stringify(data));

		Object.keys(obj).forEach(function (key) {
			var value = JSON.stringify(obj[key]);
			var updates = {};
			updates[req.param('mood') + "/" + key] = obj[key];
			moodRootRef.update(updates);
		})
	});

	res.end("TRUE");

});

app.get('/setting/mood/getMoods', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	var response = "";
	moodRootRef.once("value", function (data) {
		res.end(JSON.stringify(data));
	});
});

app.get('/setting/mood/getSelectedRoomMood', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	SlaveProvider.getSelectedRoomMood(req.param('mood'), function (error, result) {
		res.end(JSON.stringify(result));
	});
});


app.get('/setting/mood/updateMood', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	SlaveProvider.getSelectedRoomMood(req.param('mood'), function (error, result) {
		var gpios = new Array();
		var config = result.config;

		for (var i = 0; i < config.length; i++) {
			var record = config[i];

			if (req.param('mac_gpio') == record.mac_gpio) {
				gpios[i] = {
					mac_gpio: req.param('mac_gpio'),
					pwm_support: req.param('pwm_support'),
					device: req.param('device'),
					state: req.param('state'),
					room_type: req.param('room_type')
				};
			} else {
				gpios[i] = {
					mac_gpio: record.mac_gpio,
					pwm_support: record.pwm_support,
					device: record.device,
					state: record.state,
					room_type: record.room_type
				};
			}

		}

		SlaveProvider.updateMood({
			_id: result._id
		}, {
			mood: result.mood,
			state: result.state,
			config: gpios
		}, function (error, docs) {});

	});

	res.end("TRUE");
});

app.get('/setting/mood/toggleMood', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');

	SlaveProvider.getSelectedRoomMood(req.param('mood'), function (error, result) {
		var gpios = new Array();

		var config = result.config;

		SlaveProvider.findAll(function (error, findAllResult) {
			var response = "";
			var gpios = new Array();
			for (var i = 0; i < findAllResult.length; i++) {
				if ("true" == req.param('state')) {
					for (var j = 0; j < config.length; j++) {
						var record = config[j];
						if (record.mac_gpio == findAllResult[i].mac_gpio) {
							var reqpath = '/receiveRequest?gpio=' + record.mac_gpio.split('-')[1] + '&state=' + record.state + '&pwm=' + record.pwm;
							SlaveProvider.callSlave(findAllResult[i].ip, reqpath);
						}
					}
				} else {
					var reqpath = '/receiveRequest?gpio=' + findAllResult[i].mac_gpio.split('-')[1] + '&state=' + findAllResult[i].state + '&pwm=' + findAllResult[i].pwm;
					SlaveProvider.callSlave(findAllResult[i].ip, reqpath);
				}
			}
		});

		SlaveProvider.updateMood({
			_id: result._id
		}, {
			mood: result.mood,
			state: req.param('state'),
			config: result.config
		}, function (error, docs) {});

	});

	res.end("TRUE");
});

app.get('/setting/mood/deleteMood', function (req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	SlaveProvider.deleteMood({
		_id: ObjectID(req.param('id'))
	}, function (error, docs) {
		res.end("TRUE");
	});
});
//MOODS WEB SERVICES END