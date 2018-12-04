var masterRoot = "masterHUB";
var deviceRoot = "/deviceList/";
var userRoot = "/userList/";
var roomRoot = "/roomList/";
var moodRoot = "/moodList/";
var dumpGPIOsRoot = "/dumpGPIOList/";
var RGBRoot = "/RGBRootList/";
var taskPerformRoot = "/TaskPerformList/";

var firebase = require('firebase-admin');

var serviceAccount = require('D:\\Workspace\\Live\\mylive-4a5c9-firebase-adminsdk-oppmv-024b6207f0.json');

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

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    SlaveProvider = require('./slaveprovider').SlaveProvider,
    cron = require("node-cron"),
    schedule = require('node-schedule'),
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
var daysIndexArr = [""];

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
    masterStarted(roomRootObj);
    
    roomRootRef.on('value', function(data) {
    	var start = new Date().getTime();
    	roomRootObj = JSON.parse(JSON.stringify(data));
        RoomConfiguration(roomRootObj);
        var end = new Date().getTime();
        var time = end - start;
        console.log('roomRootRef Execution time: ' + time);
        console.log('-------------------------');
    });
    
    TaskPerformRootRef.on('value', function(data) {
    	var start = new Date().getTime();
    	var obj = JSON.parse(JSON.stringify(data));
    	
    	 for (x in obj) {
                   	  
                     if (obj[x].freeze != true){
                    	 
                	  var action = "/receiveRequest?";
                	  if(obj[x].pwm_support == 'TRUE'){
                		  action = "/receivePWMRequest?";
                	  } 
                	  
                	  console.log("action : " +action);
                	  
   	                  var options = {
   	                      host: obj[x].ip,
   	                      port: 80,
   	                      path: action + 'gpio=' + obj[x].mac_gpio.split("-")[1] + '&state=' + obj[x].state + '&pwm=' + obj[x].pwm,
   	                      method: 'GET'
   	                  };
   	
   	                  var req = http.get(options, function(res) {
   	                      var data = '';
   	
   	                      res.on('data', function(chunk) {
   	                          data += chunk;
   	                      });
   	                      res.on('end', function() {
   	                          if (res.statusCode === 200) {} else {}
   	                      });
   	                  });
   	                  req.on('error', function(err) {});
   	
   	                  // TIMEOUT PART
   	                  req.setTimeout(1000, function() {
   	                	  //console.log("Server connection timeout (after 10 second)");
   	                      req.abort();
   	                  });
                     }
                     
                     TaskPerformRootRef.child(x).remove();  
    	 }
             
        var end = new Date().getTime();
        var time = end - start;
        console.log('TaskPerformRootRef Execution time: ' + time);
        console.log('-------------------------');
    });

    roomRootRef.on('value', function(data) {
    	schedularScanner(JSON.parse(JSON.stringify(data)));
    });
    
    RGBRootRef.on('value', function(data) {
    	RGBRootObj = JSON.parse(JSON.stringify(data));
    	
    	for(var x in RGBRootObj){
		    		 var receiveMusicalModeRequestStr = "LOW";
		    		 var receiveSingleColorRequestStr = "LOW";
		    		 var R = RGBRootObj[x].R;
		    		 var G = RGBRootObj[x].G;
		    		 var B = RGBRootObj[x].B;
		    		 
		    		 if(RGBRootObj[x].receiveSingleColorRequest == true){
		    			 receiveSingleColorRequestStr = "HIGH";
		    		 }
		    		 
		    		 if(RGBRootObj[x].receiveMusicalModeRequest == true){
		    			 receiveMusicalModeRequestStr = "HIGH";
		    		 }
		    		 
//		    		 console.log("R : " + R + "   G : " + G + "   B : " + B + "   ip " + RGBRootObj[x].ip );
//		    		 console.log("receiveSingleColorRequestStr : " + receiveSingleColorRequestStr );
//		    		 console.log("receiveMusicalModeRequestStr : " + receiveMusicalModeRequestStr );
    		
    				var options = {
  	                      host: RGBRootObj[x].ip,
  	                      port: 80,
  	                      path: '/receiveSingleColorRequest?R='+RGBRootObj[x].R+'&G='+RGBRootObj[x].G+'&B='+RGBRootObj[x].B+'&state='+receiveSingleColorRequestStr,
  	                      method: 'GET'
  	                  };
  	
  	                  var req = http.get(options, function(res) {
  	                      var data = '';
  	
  	                      res.on('data', function(chunk) {
  	                          data += chunk;
  	                      });
  	                      res.on('end', function() {
  	                          if (res.statusCode === 200) {} else {}
  	                      });
  	                  });
  	                  req.on('error', function(err) {});
  	
  	                  // TIMEOUT PART
  	                  req.setTimeout(1000, function() {
  	                	  // console.log("Server connection timeout (after 10 second)");
  	                      req.abort();
  	                  });
    				
    				
					 var options1 = {
	                      host: RGBRootObj[x].ip,
	                      port: 80,
	                      path: '/receiveMusicalModeRequest?R='+RGBRootObj[x].R+'&G='+RGBRootObj[x].G+'&B='+RGBRootObj[x].B+'&state='+receiveMusicalModeRequestStr,
	                      method: 'GET'
	                  };
	
	                  var req1 = http.get(options1, function(res) {
	                      var data = '';
	
	                      res.on('data', function(chunk) {
	                          data += chunk;
	                      });
	                      res.on('end', function() {
	                          if (res.statusCode === 200) {} else {}
	                      });
	                  });
	                  req1.on('error', function(err) {});
	
	                  // TIMEOUT PART
	                  req1.setTimeout(1000, function() {
	                	  // console.log("Server connection timeout (after 10 second)");
	                      req1.abort();
	                  });
    				
    		}
    	
    });
    
    dumpGPIOsRootRef.on('value', function(data) {
        dumpGPIOsRootObj = data;
    });

    moodRootRef.on('value', function(data) {
        moodRootObj = JSON.parse(JSON.stringify(data));
        
        const jobNames = _.keys(schedule.scheduledJobs);
        for(var name of jobNames){
        	if(name.search('mood-schedular-') != -1){
        		schedule.cancelJob(name);
        	}
        }
        
        for (x in moodRootObj) {
        	if(moodRootObj[x].mood_checked == "true"){
        		//to call mood settings....
        		RoomConfiguration(JSON.parse(JSON.stringify(moodRootObj[x])));
        	}else{
        		//to call room settings....
        		RoomConfiguration(JSON.parse(JSON.stringify(roomRootObj)));
        	}
        	
            for (y in moodRootObj[x].schedular) {
            	var hourVal = moodRootObj[x].schedular[y].hourVal;
            	var minuteVal = moodRootObj[x].schedular[y].minuteVal;
            	var typeVal = moodRootObj[x].schedular[y].typeVal;
            	var dayVal = moodRootObj[x].schedular[y].dayVal;
            	var checked =  moodRootObj[x].schedular[y].checked;
            	
            	if(checked == true){
            		var days = [];
            		
            		for(var i in dayVal){
                		days[i] = dayVal[i];
                	}
            		
            		var rule = new schedule.RecurrenceRule();
					rule.dayOfWeek = days;
					rule.hour = hourVal;
					rule.minute = minuteVal;
					
//					console.log("rule : " + JSON.stringify(rule));
					
					schedule.scheduleJob('mood-schedular-'+y, rule, function(){
						console.log('Mood schedular is running mood-schedular-'+y);
						moodRootRef.child(x).update({ mood_checked: true });
		        		RoomConfiguration(JSON.parse(JSON.stringify(moodRootObj[x])));
					});
            	} 
            }
        }
    });

    deviceRootRef.on('value', function(data) {
        deviceRootObj = data;
    });
    
});

function RoomConfiguration(obj){
	  var x, y, s;
      for (x in obj) {
          for (y in obj[x].devices) {
              for (d in obj[x].devices[y]) {
                  var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));

                  if(typeof deviceObj.mac_gpio != 'undefined'){ 
                	  
                  var ip = deviceObj.ip;
//                  console.log("deviceObj.mac_gpio :: " + deviceObj.mac_gpio);
                  var gpio = deviceObj.mac_gpio.split("-")[1];
                  var state = deviceObj.state;
                  var pwm = deviceObj.pwm;
                  var freeze = deviceObj.freeze;
                  
                  if (freeze != true ){
//                	  console.log(ip + " " + gpio + " " + state + " " + pwm + " " + freeze);
	                  var options = {
	                      host: ip,
	                      port: 80,
	                      path: '/receiveRequest?gpio=' + gpio + '&state=' + state + '&pwm=' + pwm,
	                      method: 'GET'
	                  };
	
	                  var req = http.get(options, function(res) {
	                      var data = '';
	
	                      res.on('data', function(chunk) {
	                          data += chunk;
	                      });
	                      res.on('end', function() {
	                          if (res.statusCode === 200) {} else {}
	                      });
	                  });
	                  req.on('error', function(err) {});
	
	                  // TIMEOUT PART
	                  req.setTimeout(1000, function() {
	//                      console.log("Server connection timeout (after 10 second)");
	                      req.abort();
	                  });
                  }
              }
              }
          }
      }
}

function schedularScanner(obj){
	const jobNames = _.keys(schedule.scheduledJobs);
    for(var name of jobNames){
    	if(name.search('device-schedular-') != -1){
    		schedule.cancelJob(name);
    	}
    }

  var x, y, s;
  for (x in obj) {
      for (y in obj[x].devices) {
          for (d in obj[x].devices[y]) {
              var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));

              if(typeof deviceObj.mac_gpio != 'undefined'){ 
            	  
              var ip = deviceObj.ip;
              var gpio = deviceObj.mac_gpio.split("-")[1];
              var state = deviceObj.state;
              var pwm = deviceObj.pwm;
              var freeze = deviceObj.freeze;
              
              for(s in deviceObj.schedular){
                  	var dayVal = deviceObj.schedular[s].days;
                  	var checked =   deviceObj.schedular[s].checked;
                  	var onTimeHourVal = deviceObj.schedular[s].onTimeHourVal;
                  	var onTimeMinuteVal = deviceObj.schedular[s].onTimeMinuteVal;
                  	var offTimeHourVal = deviceObj.schedular[s].offTimeHourVal;
                  	var offTimeMinuteVal = deviceObj.schedular[s].offTimeMinuteVal;
                  	
                  	if(checked == true){
                  		var days = [];
                		
                		for(var i in dayVal){
                    		days[i] = parseInt(dayVal[i]);
                    	}
                		
                  		var onrule = new schedule.RecurrenceRule();
                  		onrule.dayOfWeek = days;
                  		onrule.hour = parseInt(onTimeHourVal);
                  		onrule.minute = parseInt(onTimeMinuteVal);
    					
                  		console.log("onrule : " + JSON.stringify(onrule));
                  		
                  		schedule.scheduleJob('device-schedular-on-'+s, onrule, function(){
                  		    roomRootRef.child(x).child("devices").child(y).child(d).update({
	                  		      pwm: "100",
	                  		      state: "HIGH"
	                  		    });
						});
                  		
                  		var offrule = new schedule.RecurrenceRule();
                  		offrule.dayOfWeek = days;
                  		offrule.hour = parseInt(offTimeHourVal);
                  		offrule.minute = parseInt(offTimeMinuteVal);
    					
                  		console.log("offrule : " + JSON.stringify(offrule));
                  		
                  		schedule.scheduleJob('device-schedular-off-'+s, offTimeMinuteVal, function(){
                  		  roomRootRef.child(x).child("devices").child(y).child(d).update({
                  		      pwm: "0",
                  		      state: "LOW"
                  		    });
						});
                  	}
                  	
              }
             
          }
          }
      }
  }
}
function masterStarted(obj) {
	console.log("masterStarted......");
	 var x, y;
     for (x in obj) {
         for (y in obj[x].devices) {
             for (d in obj[x].devices[y]) {
                 var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));
                 
                 var ip = deviceObj.ip;
                 console.log("waking up IP : " + ip);

                 var options = {
	                      host: ip,
	                      port: 80,
	                      path: '/masterStart',
	                      method: 'GET'
	                  };
	
	                  var req = http.get(options, function(res) {
	                      var data = '';
	
	                      res.on('data', function(chunk) {
	                          data += chunk;
	                          console.log("resp : " + data);
	                      });
	                      res.on('end', function() {
	                          if (res.statusCode === 200) {} else {}
	                      });
	                  });
	                  req.on('error', function(err) {});
	
	                  // TIMEOUT PART
	                  req.setTimeout(1000, function() {
	//                      console.log("Server connection timeout (after 10 second)");
	                      req.abort();
	                  });

             }
         }
     }
	 
}

//MOBILE APP REQUEST
app.get('/app/request', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var id = req.param('id');
    var room_id = req.param('room_id');
    var mac_gpio = req.param('mac_gpio');
    var state = req.param('state');
    var pwm = req.param('pwm');
    var gpio = mac_gpio.split('-')[1];
    var group = req.param('group');

    console.log("id : " + id);
    console.log("room_id : " + room_id);
    console.log("mac_gpio : " + mac_gpio);
    console.log("state : " + state);
    console.log("pwm : " + pwm);
    console.log("gpio : " + gpio);

    roomRootRef.child(req.param('room_id')).child("devices").child(group).child(req.param('id')).once("value", function(data) {
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

        var options = {
            host: ip,
            port: 80,
            path: '/receiveRequest?gpio=' + gpio + '&state=' + state + '&pwm=' + pwm,
            method: 'GET'
        };

        var req = http.get(options, function(res) {
            var data = '';

            res.on('data', function(chunk) {
                data += chunk;
            });
            res.on('end', function() {
                if (res.statusCode === 200) {} else {}
            });
        });
        req.on('error', function(err) {});

        // TIMEOUT PART
        req.setTimeout(10000, function() {
            console.log("Server connection timeout (after 10 second)");
            req.abort();
        });

    });
    res.end("TRUE");

});

//slave new
app.get('/slave/new', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    if(req.param('mac_gpio').search("RGB-") != -1){
    	 var data = {
    		        mac_gpio: req.param('mac_gpio'),
    		        ip: req.param('ip'),
    		    };
    		    
	    SlaveProvider.getGPIOStatus(firebase, dumpGPIOsRootObj,dumpGPIOsRootRef, roomRootObj, roomRootRef, data);

    }else{
    	 var data = {
    		        mac_gpio: req.param('mac_gpio'),
    		        ip: req.param('ip'),
    		        state: req.param('state'),
    		        pwm: req.param('pwm'),
    		        current_sensor: req.param('current_sensor'),
    		    };
    		    
	    SlaveProvider.getGPIOStatus(firebase, dumpGPIOsRootObj,dumpGPIOsRootRef, roomRootObj, roomRootRef, data);
    }
   
    res.end("TRUE");
});

//slave request for switch pressing
app.get('/slave/request', function(req, res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	var obj = roomRootObj;
	var x, y;
    for (x in obj) {
         for (y in obj[x].devices) {
             for (d in obj[x].devices[y]) {
                 var deviceObj = JSON.parse(JSON.stringify(obj[x].devices[y][d]));
                 
                 var ip = deviceObj.ip;
                 var gpio = deviceObj.mac_gpio;
                 var freeze = deviceObj.freeze;
                 
                 if(gpio == req.param('mac_gpio')){
                	 if(freeze == true){
                		res.end('false');
                	 }else{
                		res.end('true');
                		
                        var data = {
                            mac_gpio: req.param('mac_gpio'),
                            state: req.param('state'),
                            pwm: req.param('pwm'),
                            ip: ip,
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
                        
                	 }
                 }
             }
         }
     }
});

app.get('/app/getUnRegisteredGPIO', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var response = "";

    dumpGPIOsRootRef.once("value", function(data) {
        // do some stuff once
        response = response + JSON.stringify(data) + "\n";
        res.end(response);
    });
});

//ROOM WEB SERVICE START ---------------------------------------------------
app.get('/setting/room/setRegisterRoom', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("room_type : " + req.param('room_type'));
    console.log("custom_name : " + req.param('custom_name'));

    var data = {
        room_type: req.param('room_type'),
        custom_name: req.param('custom_name')
    };

    var newPostRef = roomRootRef.push();
    var postId = newPostRef.key;

    console.log("postId : " + postId);

    var updates = {};
    updates[postId] = data;
    roomRootRef.update(updates);
    res.end("TRUE");
});

app.get('/setting/room/getRegisterRoom', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var response = "";

    roomRootRef.once("value", function(data) {
        // do some stuff once
        response = response + JSON.stringify(data) + "\n";
        res.end(response);
    });
});

app.get('/app/getRegisteredDevicesByRoomType', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var id = req.param('id');
    var group = req.param('group');
    console.log("id : " + id);

    var response = "";

    if (group === "ALL") {
        roomRootRef.child(id).child("devices").once("value", function(data) {
            response = response + JSON.stringify(data) + "\n";
            res.end(response);
        });
    } else {
        roomRootRef.child(id).child("devices").child(group).once("value", function(data) {
            response = response + JSON.stringify(data) + "\n";
            res.end(response);
        });
    }

});

app.get('/app/getRunningDevicesByRoomType', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var id = req.param('id');
    var state = req.param('state');
    console.log("id : " + id);

    var response = "";

    roomRootRef.child(id).child("devices").child().orderByChild("state").equalTo(state).once("value", function(data) {
        var obj = JSON.parse(JSON.stringify(data));
        console.log("obj : " + obj);
        res.end(obj);
    });

});


app.get('/setting/room/removeRegisterRoom', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("id : " + req.param('id'));
    roomRootRef.child('/' + req.param('id')).remove();
    res.end("TRUE");
});

app.get('/app/deleteRegisteredDevicesByRoomType', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("room_id : " + req.param('room_id'));
    console.log("id : " + req.param('id'));
    console.log("group : " + req.param('group'));

    roomRootRef.child(req.param('room_id')).child("devices").child(req.param('group')).child(req.param('id')).once("value", function(data) {
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

app.get('/app/setRequestedRegisterGPIO', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var room_id = req.param('room_id');
    var id = req.param('id');
    var mac_gpio = req.param('mac_gpio');
    var device = req.param('device');
    var device_serial = req.param('device_serial');
    var pwm_support = req.param('pwm_support');
    var group = req.param('group');
    var cust_device = req.param('cust_device');

    console.log("room_id : " + req.param('room_id'));
    console.log("id : " + req.param('id'));
    console.log("mac_gpio : " + req.param('mac_gpio'));
    console.log("device : " + device);
    console.log("device_serial : " + device_serial);
    console.log("pwm_support : " + pwm_support);
    console.log("group : " + group);
    console.log("cust_device : " + cust_device);

    dumpGPIOsRootRef.child(id).once("value", function(dumpData) {
        // do some stuff once
        var response = JSON.stringify(dumpData) + "\n";
        console.log("response : " + response);

        var obj = JSON.parse(JSON.stringify(dumpData));
        console.log("dumpData : " + dumpData['mac_gpio'] + "         " + obj.mac_gpio);
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

        console.log("postId : " + postId);

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
app.get('/setting/application/addDevice', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("device : " + req.param('device'));
    console.log("pwm_status : " + req.param('pwm_status'));
    console.log("device_serial : " + req.param('device_serial'));
    console.log("group : " + req.param('group'));
    console.log("cust_device : " + req.param('cust_device'));

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

app.get('/app/getDevices', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    var response = "";

    deviceRootRef.once("value", function(data) {
        // do some stuff once
        response = response + JSON.stringify(data) + "\n";
        res.end(response);
    });
});

app.get('/setting/application/deleteDevice', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("id : " + req.param('id'));

    deviceRootRef.child('/' + req.param('id')).remove();

    res.end("TRUE");
});

//APPLIACE WEB SERVICES END -----------------------------------------------------------------------------

app.get('/insertData', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("name : " + req.param('name'));
    console.log("city : " + req.param('city'));

    var data = {
        name: req.param('name'),
        city: req.param('city')
    };

    var updates = {};
    updates['/' + req.param('name')] = data;
    ref.update(updates);

    res.end("TRUE");
});

app.get('/updateData', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("name : " + req.param('name'));
    console.log("city : " + req.param('city'));

    var data = {
        name: req.param('name'),
        city: req.param('city')
    };

    var updates = {};
    updates['/' + req.param('name')] = data;
    ref.update(updates);

    res.end("TRUE");
});

app.get('/deleteData', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("name : " + req.param('name'));
    console.log("city : " + req.param('city'));

    ref.child('/' + req.param('name')).remove();

    res.end("TRUE");
});

app.get('/getAllData', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("Calling all records.");

    res.end("TRUE");
});
//------------------------------------------------------------------

//MOODS WEB SERVICES START
app.get('/setting/mood/addMood', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    roomRootRef.once("value", function(data) {
        var obj = JSON.parse(JSON.stringify(data));

        Object.keys(obj).forEach(function(key) {
            var value = JSON.stringify(obj[key]);
            var updates = {};
            updates[req.param('mood') + "/" + key] = obj[key];
            moodRootRef.update(updates);
        })
    });

    res.end("TRUE");

});

app.get('/setting/mood/getMoods', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    var response = "";
    moodRootRef.once("value", function(data) {
        response = response + JSON.stringify(data) + "\n";
        res.end(response);
    });
});

app.get('/setting/mood/getSelectedRoomMood', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("mood : " + req.param('mood'));

    SlaveProvider.getSelectedRoomMood(req.param('mood'), function(error, result) {
        res.end("" + JSON.stringify(result));
    });
});


app.get('/setting/mood/updateMood', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    SlaveProvider.getSelectedRoomMood(req.param('mood'), function(error, result) {
        var gpios = new Array();

        var config = result.config;

        console.log("state : " + config.length);

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

        console.log("gpios : " + JSON.stringify(gpios));
        console.log("result._id : " + result._id);

        SlaveProvider.updateMood({
            _id: result._id
        }, {
            mood: result.mood,
            state: result.state,
            config: gpios
        }, function(error, docs) {});

    });

    res.end("TRUE");
});

app.get('/setting/mood/toggleMood', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    console.log("mood : " + req.param('mood'));
    console.log("state : " + req.param('state'));

    SlaveProvider.getSelectedRoomMood(req.param('mood'), function(error, result) {
        var gpios = new Array();

        var config = result.config;

        console.log("state : " + config.length);

        SlaveProvider.findAll(function(error, findAllResult) {
            var response = "";
            var gpios = new Array();
            for (var i = 0; i < findAllResult.length; i++) {
                if ("true" == req.param('state')) {
                    for (var j = 0; j < config.length; j++) {
                        var record = config[j];
                        if (record.mac_gpio == findAllResult[i].mac_gpio) {

                            console.log("ip : " + findAllResult[i].ip + "    state : " + record.state + "   record.mac_gpio =  " + record.mac_gpio.split('-')[1]);

                            var options = {
                                host: findAllResult[i].ip,
                                port: 80,
                                path: '/receiveRequest?gpio=' + record.mac_gpio.split('-')[1] + '&state=' + record.state + '&pwm=' + record.pwm,
                                method: 'GET'
                            };

                            http.request(options, function(res) {
                                res.on('timeout',
                                    function(err) {
                                        console.error(err);
                                    });

                                res.on('data', function(chunk) {
                                    console.log(chunk);
                                });
                            }).end();
                        }
                    }
                } else {
                    var options = {
                        host: findAllResult[i].ip,
                        port: 80,
                        path: '/receiveRequest?gpio=' + findAllResult[i].mac_gpio.split('-')[1] + '&state=' + findAllResult[i].state + '&pwm=' + findAllResult[i].pwm,
                        method: 'GET'
                    };

                    var req = http.get(options, function(res) {
                        var data = '';

                        res.on('data', function(chunk) {
                            data += chunk;
                        });
                        res.on('end', function() {
                            if (res.statusCode === 200) { /* do stuff with your data */ } else { /* Do other codes */ }
                        });
                    });
                    req.on('error', function(err) { /* More serious connection problems. */ });

                    // TIMEOUT PART
                    req.setTimeout(10000, function() {
                        console.log("Server connection timeout (after 10 second)");
                        req.abort();
                    });

                }
            }
            console.log("gpios : " + gpios);
        });

        SlaveProvider.updateMood({
            _id: result._id
        }, {
            mood: result.mood,
            state: req.param('state'),
            config: result.config
        }, function(error, docs) {});

    });

    res.end("TRUE");
});

app.get('/setting/mood/deleteMood', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log("id : " + req.param('id'));
    SlaveProvider.deleteMood({
        _id: ObjectID(req.param('id'))
    }, function(error, docs) {
        res.end("TRUE");
    });
});
//MOODS WEB SERVICES END