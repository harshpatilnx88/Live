
import { Http } from '@angular/http';
import { Injectable, ApplicationRef } from '@angular/core';
import firebase from 'firebase';
import { Observable, ReplaySubject } from "rxjs/Rx";

@Injectable()
export class FirebaseProvider {
  public refresh: ReplaySubject<string> = new ReplaySubject<string>(0);
  public masterRoot = "masterHUB";
  public roomRoot = "/roomList/";
  public deviceRoot = "/deviceList/";
  public userRoot = "/userList/";
  public moodRoot = "/moodList/";
  public dumpGPIOsRoot = "/dumpGPIOList/";
  public RGBRoot = "/RGBRootList/";
  public taskPerformRoot = "/TaskPerformList/";
  public room_infos = [];
  public room_fav_even_infos = [];
  public room_fav_odd_infos = [];

  public tv_device_infos = [];
  public ac_device_infos = [];
  public fan_device_infos = [];
  public light_device_infos = [];
  public shading_device_infos = [];
  public entertainment_device_infos = [];

  public mood_tv_device_infos = [];
  public mood_ac_device_infos = [];
  public mood_fan_device_infos = [];
  public mood_light_device_infos = [];
  public mood_shading_device_infos = [];
  public mood_entertainment_device_infos = [];

  public true_boolean: boolean = true;
  public false_boolean: boolean = false;

  public device_fav_even_infos = [];
  public device_fav_odd_infos = [];

  public setting_device_list = [];
  public setting_dumpGPIO_list = [];
  public setting_mood_list = [];
  public setting_RGB_list = [];

  public roomRootRef = firebase.database().ref(this.masterRoot + this.roomRoot);
  public deviceRootRef = firebase.database().ref(this.masterRoot + this.deviceRoot);
  public dumpGPIOsRootRef = firebase.database().ref(this.masterRoot + this.dumpGPIOsRoot);
  public moodRootRef = firebase.database().ref(this.masterRoot + this.moodRoot);
  public RGBRootRef = firebase.database().ref(this.masterRoot + this.RGBRoot);
  public TaskPerformRootRef = firebase.database().ref(this.masterRoot + this.taskPerformRoot);
  
  public room_list_obj = null;

  constructor(public http: Http) {

    this.deviceRootRef.on('value', resp => {
      this.setting_device_list = [];
      this.getDeviceList(resp);
      this.refresh.next("");
      // console.log("setting_device_list : " + JSON.stringify(this.setting_device_list));
    });

    this.moodRootRef.on('value', resp => {
      this.setting_mood_list = [];
      this.getMoodList(resp);
      this.refresh.next("");
      // console.log("setting_mood_list : " + JSON.stringify(this.setting_mood_list));
    });

    this.RGBRootRef.on('value', resp => {
      this.setting_RGB_list = [];
      this.getRGBList(resp);
      this.refresh.next("");
      // console.log("setting_RGB_list : " + JSON.stringify(this.setting_RGB_list));
    });

    this.dumpGPIOsRootRef.on('value', resp => {
      this.setting_dumpGPIO_list = [];
      this.getDumpGPIOList(resp);
      this.refresh.next("");
      // console.log("dumpGPIOsRootRef : " + JSON.stringify(this.setting_dumpGPIO_list));
    });

    this.roomRootRef.on('value', resp => {
      this.room_infos = [];
      this.room_fav_even_infos = [];
      this.room_fav_odd_infos = [];
      this.ac_device_infos = [];
      this.fan_device_infos = [];
      this.light_device_infos = [];
      this.shading_device_infos = [];
      this.entertainment_device_infos = [];

      this.room_list_obj = resp;
      this.getRoomList(resp);
      this.refresh.next("");

      // console.log("ac_device_infos : " + JSON.stringify(this.ac_device_infos));

      // console.log("room_infos : " + JSON.stringify(this.room_infos));
      // console.log("room_fav_even_infos : " + JSON.stringify(this.room_fav_even_infos));
      // console.log("room_fav_odd_infos : " + JSON.stringify(this.room_fav_odd_infos));

      // console.log("light_device_infos --> " + JSON.stringify(this.light_device_infos));

      // console.log("data is ready.");
    });
  }

  public getRGBList = snapshot => {
    snapshot.forEach(childSnapshot => {
      var obj = JSON.parse(JSON.stringify(childSnapshot));
      this.setting_RGB_list.push({
        id: childSnapshot.key,
        ip: obj.ip,
        mac_gpio: obj.mac_gpio,
        pwm: parseInt(obj.pwm),
        state: obj.state,
        device: obj.device,
        group: obj.group,
        R: obj.R,
        G: obj.G,
        B: obj.B,
        freeze: obj.freeze,
        room_id: obj.room_id,
        custom_room_name: obj.custom_room_name,
        cust_device: obj.cust_device,
        receiveSingleColorRequest: obj.receiveSingleColorRequest,
        receiveAutoColorModeRequest: obj.receiveAutoColorModeRequest,
        receiveMusicalModeRequest: obj.receiveMusicalModeRequest
      });
    });
  }

  public getDumpGPIOList = snapshot => {
    snapshot.forEach(childSnapshot => {
      var obj = JSON.parse(JSON.stringify(childSnapshot));
      this.setting_dumpGPIO_list.push({
        id: childSnapshot.key,
        current_sensor: obj.current_sensor,
        ip: obj.ip,
        mac_gpio: obj.mac_gpio,
        pwm: parseInt(obj.pwm),
        state: obj.state
      });
    });
  }

  public getMoodList = snapshot => {
    snapshot.forEach(childofSnapshot => {
      var childOfSnapShotObj = JSON.parse(JSON.stringify(childofSnapshot));

      var schedularData = [];

      if (typeof JSON.stringify(childOfSnapShotObj.schedular) != 'undefined') {
        var schedular = JSON.parse((JSON.stringify(childOfSnapShotObj.schedular)));

        var x, y;
        for (x in schedular) {
          if (JSON.stringify(schedular[x].checked) == 'true') {
            schedularData.push({ schedularName: x, checked: true });
          } else {
            schedularData.push({ schedularName: x, checked: false });
          }
        }
      }

      childofSnapshot.forEach(childSnapshot => {
        var obj = JSON.parse(this.findAndReplace(JSON.stringify(childSnapshot), "__", " "));
        var custom_nameVal;
        var room_typeVal;
        this.mood_tv_device_infos = [];
        this.mood_ac_device_infos = [];
        this.mood_fan_device_infos = [];
        this.mood_light_device_infos = [];
        this.mood_shading_device_infos = [];
        this.mood_entertainment_device_infos = [];
        var devicesVal;

        custom_nameVal = obj.custom_name;
        room_typeVal = obj.room_type;
        // console.log("custom_nameVal : " + custom_nameVal);
        // console.log("room_typeVal : " + room_typeVal);

        if (typeof JSON.stringify(obj.devices) != 'undefined') {
          devicesVal = JSON.parse((JSON.stringify(obj.devices)));
          var x, y;
          for (x in devicesVal) {
            for (y in devicesVal[x]) {
              if (x == "AC") {
                this.mood_ac_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              } else if (x == "FAN") {
                this.mood_fan_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              } else if (x == "LIGHTING") {
                this.mood_light_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              } else if (x == "SHADING") {
                this.mood_shading_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              } else if (x == "ENTERTAINMENT") {
                this.mood_entertainment_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              }
            }
          }
        }

        this.setting_mood_list.push({
          mood: childofSnapshot.key,
          mood_checked: childOfSnapShotObj.mood_checked,
          custom_name: custom_nameVal,
          room_type: room_typeVal,
          devices: devicesVal,
          checked: obj.checked,
          ac_device_infos: this.mood_ac_device_infos,
          fan_device_infos: this.mood_fan_device_infos,
          light_device_infos: this.mood_light_device_infos,
          shading_device_infos: this.mood_shading_device_infos,
          entertainment_device_infos: this.mood_entertainment_device_infos,
          schedularData: schedularData
        });
      });
    });
  }

  public getDeviceList = snapshot => {
    snapshot.forEach(childSnapshot => {
      var obj = JSON.parse(JSON.stringify(childSnapshot));
      this.setting_device_list.push({
        id: childSnapshot.key,
        device: obj.device,
        device_serial: obj.device_serial,
        group: obj.group,
        pwm_status: obj.pwm_status
      });
    });
  }

  public getRoomList = snapshot => {
    var index = 0;
    snapshot.forEach(childSnapshot => {
      var obj = JSON.parse(this.findAndReplace(JSON.stringify(childSnapshot), "__", " "));
      var custom_nameVal = obj.custom_name;
      var room_typeVal = obj.room_type;
      var active = 0;
      var isFav = obj.favourite;

      var tv_device_active = 0;
      var ac_device_active = 0;
      var fan_device_active = 0;
      var light_device_active = 0;
      var shading_device_active = 0;
      var entertainment_device_active = 0;

      if (typeof JSON.stringify(obj.devices) != 'undefined') {
        active = (JSON.stringify(obj.devices).match(/"state":"HIGH"/g) || []).length;

        var devicesVal = JSON.parse((JSON.stringify(obj.devices)));
        var x, y;
        for (x in devicesVal) {
          for (y in devicesVal[x]) {
            if (x == "AC") {
              this.ac_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              if (devicesVal[x][y].state == "HIGH") {
                ac_device_active++;
              }
            } else if (x == "FAN") {
              this.fan_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              if (devicesVal[x][y].state == "HIGH") {
                fan_device_active++;
              }
            } else if (x == "LIGHTING") {
              this.light_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              if (devicesVal[x][y].state == "HIGH") {
                light_device_active++;
              }
            } else if (x == "SHADING") {
              this.shading_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              if (devicesVal[x][y].state == "HIGH") {
                shading_device_active++;
              }
            } else if (x == "ENTERTAINMENT") {
              this.entertainment_device_infos.push(this.readDeviceObj(childSnapshot.key, custom_nameVal, y, devicesVal[x][y]));
              if (devicesVal[x][y].state == "HIGH") {
                entertainment_device_active++;
              }
            }
          }
        }
      }

      var str1 = "\"room\":\"";
      var str2 = custom_nameVal + "\"";
      var res = str1.concat(str2);
      var rgxp = new RegExp("\"room\":\"" + custom_nameVal + "\"", "g");

      var tv_flag_val = (JSON.stringify(this.tv_device_infos).match(rgxp) || []).length;
      var ac_flag_val = (JSON.stringify(this.ac_device_infos).match(rgxp) || []).length;
      var fan_flage_val = (JSON.stringify(this.fan_device_infos).match(rgxp) || []).length;
      var light_flag_val = (JSON.stringify(this.light_device_infos).match(rgxp) || []).length;
      var shading_flag_val = (JSON.stringify(this.shading_device_infos).match(rgxp) || []).length;
      var entertainment_flag_val = (JSON.stringify(this.entertainment_device_infos).match(rgxp) || []).length;

      if (isFav != 'undefined' && isFav == "true") {
        this.room_fav_even_infos.push({ id: childSnapshot.key, favourite: obj.favourite, custom_name: custom_nameVal, room_type: room_typeVal, devices: devicesVal, activeDevice: "" + active });
      }

      this.room_infos.push({
        id: childSnapshot.key,
        favourite: obj.favourite,
        custom_name: custom_nameVal,
        room_type: room_typeVal,
        devices: devicesVal,
        activeDevice: "" + active,
        acActive: ac_device_active,
        fanActive: fan_device_active,
        lightActive: light_device_active,
        tvActive: tv_device_active,
        shadingActive: shading_device_active,
        entActive: entertainment_device_active,
        tv_flag: tv_flag_val,
        ac_flag: ac_flag_val,
        fan_flag: fan_flage_val,
        light_flag: light_flag_val,
        shading_flag: shading_flag_val,
        ent_flag: entertainment_flag_val
      });

      // console.log("room_infos : "+ JSON.stringify(this.room_infos));
      // console.log("ac_device_infos : "+ JSON.stringify(this.ac_device_infos));
      // console.log("fan_device_infos : "+JSON.stringify(this.fan_device_infos));
      // console.log("light_device_infos : "+JSON.stringify(this.light_device_infos));
    });

    if (this.room_fav_even_infos.length % 2 != 0) {
      this.room_fav_odd_infos.push(this.room_fav_even_infos[this.room_fav_even_infos.length - 1]);
      this.room_fav_even_infos.pop();
    }

  };

  setActiveFlag(flagVar, state) {
    if (state == "HIGH") {
      flagVar++;
    }
  }

  readDeviceObj(room_id, room, key, obj) {
    var data = JSON.parse(JSON.stringify(obj));
    data.id = key;
    data.room = room;
    data.room_id = room_id;
    data.lockColor = "black";
    data.toogledisplay = "block";
    data.toogledlockdisplay = false;
    var schedularData = [];

    if (typeof JSON.stringify(data.schedular) != 'undefined') {
      var schObj = JSON.parse(JSON.stringify(data.schedular));
      for (var i in schObj) {
        schedularData.push({ schedularName: i, checked: schObj[i].checked });
      }
    }

    data.schedularData = schedularData;

    if (data.freeze == true) {
      data.lockColor = "red";
      data.toogledisplay = "none";
    }

    if (data.state == "HIGH") {
      data.checked = this.true_boolean;
    } else {
      data.checked = this.false_boolean;
    }
    return data;
  }

  findAndReplace(string, target, replacement) {
    var i = 0, length = string.length;
    for (i; i < length; i++) {
      string = string.replace(target, replacement);
    }
    return string;
  }

  public getRefresh(): Observable<string> {
    return this.refresh;
  }

  taskPerform(info){
    var newPostRef = this.TaskPerformRootRef.push();
    var postId = newPostRef.key;

    var updates = {};
    updates[postId] = info;
    this.TaskPerformRootRef.update(updates);
  }

  //On or Off operation of device
  public toggleSwitch(info, device_id, mac_gpio, state, pwm, room_id, group) {
    firebase.database().ref(this.masterRoot + this.roomRoot + "/" + room_id + "/devices/" + group + "/" + device_id + "/").update({
      pwm: parseInt(pwm),
      state: state
    });

    info.state = state;
    info.pwm = parseInt(pwm);
    this.taskPerform(info);
    return true;
  }

  //Make favourite room
  makeFavourite(item, room_id) {
    if (room_id != 'undefined') {
      if (item.favourite == "true") {
        firebase.database().ref(this.masterRoot + this.roomRoot + "/" + room_id + "/favourite/").set("false");
        return false;
      } else {
        firebase.database().ref(this.masterRoot + this.roomRoot + "/" + room_id + "/favourite/").set("true");
        return true;
      }
    }
  }

  //Start setitng tab method
  //delete device
  addDevice(group, dimming, device) {
    var data = {
      device: device,
      pwm_status: dimming,
      group: group
    };

    var newPostRef = this.deviceRootRef.push();
    var postId = newPostRef.key;

    var updates = {};
    updates[postId] = data;
    this.deviceRootRef.update(updates);
    return true;
  }

  deleteDevice(info) {
    this.deviceRootRef.child('/' + info.id).remove();
    return true;
  }

  addRoom(room_type, custom_room_name) {
    var data = {
      room_type: room_type,
      custom_name: custom_room_name
    };

    var newPostRef = this.roomRootRef.push();
    var postId = newPostRef.key;

    var updates = {};
    updates[postId] = data;
    this.roomRootRef.update(updates);
    return true;
  }

  deleteRoom(info) {
    this.roomRootRef.child('/' + info.id).remove();
    return true;
  }

  addRegisterDevice(custom_room_name, room_id, mac_gpio, pwm_support, device, custom_device_name) {
    var group;
    for (var i = 0; i < this.setting_device_list.length; i++) {
      if (this.setting_device_list[i].device == device) {
        group = this.setting_device_list[i].group;
      }
    }

    for (var i = 0; i < this.setting_dumpGPIO_list.length; i++) {
      var obj = this.setting_dumpGPIO_list[i];
      if (obj.mac_gpio == mac_gpio) {
        if (device == "RGB") {

          var dataRGB = {
            mac_gpio: obj.mac_gpio,
            state: false,
            ip: obj.ip,
            device: device,
            group: group,
            R: 0,
            G: 0,
            B: 0,
            freeze: false,
            room_id: room_id,
            custom_room_name: custom_room_name,
            cust_device: custom_device_name,
            receiveSingleColorRequest: false,
            receiveAutoColorModeRequest: false,
            receiveMusicalModeRequest: false
          };

          var newPostRef = this.RGBRootRef.push();
          var postId = newPostRef.key;

          var updates = {};
          updates[postId] = dataRGB;
          this.RGBRootRef.update(updates);
          this.dumpGPIOsRootRef.child(obj.id).remove();

        } else {

          var data = {
            mac_gpio: obj.mac_gpio,
            state: obj.state,
            pwm: parseInt(obj.pwm),
            ip: obj.ip,
            current_sensor: obj.current_sensor,
            device: device,
            pwm_support: pwm_support,
            group: group,
            cust_device: custom_device_name,
            freeze: false
          };

          var newPostRef = this.roomRootRef.push();
          var postId = newPostRef.key;

          var updates = {};
          updates[room_id + "/devices/" + group + "/" + postId] = data;
          this.roomRootRef.update(updates);

          this.dumpGPIOsRootRef.child(obj.id).remove();
        }
      }
    }
    return true;
  }

  unRegisterDevice(info) {
    var data = {
      mac_gpio: info.mac_gpio,
      ip: info.ip,
      state: info.state,
      pwm: parseInt(info.pwm),
      current_sensor: info.current_sensor
    };

    var newPostRef = this.dumpGPIOsRootRef.push();
    var postId = newPostRef.key;

    var updates = {};
    updates[postId] = data;
    this.dumpGPIOsRootRef.update(updates);

    this.roomRootRef.child(info.room_id).child("devices").child(info.group).child(info.id).remove();

    return true;
  }

  toggleLock(info, freeze) {
    this.roomRootRef.child(info.room_id).child("devices").child(info.group).child(info.id).update({ freeze: freeze });
    return true;
  }

  addMood(mood_name) {
    this.roomRootRef.once("value", function (data) {
      var obj = JSON.parse(JSON.stringify(data));
      var moodRootRef = firebase.database().ref("masterHUB/moodList/");

      Object.keys(obj).forEach(function (key) {
        var updates = {};
        var roomObj = obj[key];
        roomObj.checked = false;
        updates[mood_name + "/" + key] = roomObj;
        moodRootRef.update(updates);
      })
    });

    firebase.database().ref(this.masterRoot + this.moodRoot + mood_name).update({
      mood_checked: false
    });

    return true;
  }

  deleteMood(mood_name) {
    this.moodRootRef.child(mood_name).remove();
    return true;
  }

  toggleSwitchMood(mood, info, id, mac_gpio, state, pwm, room_id, group) {
    firebase.database().ref(this.masterRoot + this.moodRoot + mood + "/" + room_id + "/devices/" + group + "/" + id + "/").update({
      pwm: parseInt(pwm),
      state: state
    });
    return true;
  }

  toggleSwitchMoodSelector(checked, mood, room_id) {
    firebase.database().ref(this.masterRoot + this.moodRoot + mood + "/" + room_id).update({
      checked: checked
    });
    return true;
  }

  toggleWholeHouseMoodSelector(checked, mood) {
    console.log("calling toggleWholeHouseMoodSelector.......");
    firebase.database().ref(this.masterRoot + this.moodRoot + mood).update({
      mood_checked: checked
    });
    return true;
  }

  saveMoodRoomSettingSchedular(mood, schedularName, hourVal, minuteVal, dayVal) {
    console.log("in firebase : " + mood + "   " + schedularName + "   " + hourVal + "  " + minuteVal + "   " + dayVal);

    var data = {
      hourVal: hourVal,
      minuteVal: minuteVal,
      dayVal: dayVal,
      checked: false
    };

    var newPostRef = this.moodRootRef.push();
    var postId = newPostRef.key;

    var updates = {};
    updates[mood + "/schedular/" + schedularName] = data;
    this.moodRootRef.update(updates);

    return true;
  }

  deleteSchedularData(mood, schedularName) {
    this.moodRootRef.child(mood).child("schedular").child(schedularName).remove();
    return true;
  }

  toggleSwitchSchedular(mood, checked, schedularName) {
    this.moodRootRef.child(mood).child("schedular").child(schedularName).update({
      checked: checked
    });
    return true;
  }

  //set schedular to device
  public saveAddSchedular(info, data) {
    firebase.database().ref(this.masterRoot + this.roomRoot + "/" + info.room_id + "/devices/" + info.group + "/" + info.id + "/schedular/" + data.schedularName).update(data);
    return true;
  }

  deleteDeviceSchedularData(room_id, info, data) {
    firebase.database().ref(this.masterRoot + this.roomRoot + "/" + room_id + "/devices/" + info.group + "/" + info.id + "/schedular/" + data.schedularName).remove();
    return true;
  }

  toggleSwitchDeviceSchedular(room_id, info, data) {
    firebase.database().ref(this.masterRoot + this.roomRoot + "/" + info.room_id + "/devices/" + info.group + "/" + info.id + "/schedular/" + data.schedularName).update({
      checked: data.checked
    });
    return true;
  }

  singleColorToggleSwitch(state, RGBData, R, G, B) {
    firebase.database().ref(this.masterRoot + this.RGBRoot + "/" + RGBData.id).update({
      state: state,
      receiveSingleColorRequest: state,
      receiveAutoColorModeRequest: false,
      receiveMusicalModeRequest: false,
      R: R,
      G: G,
      B: B
    });
    return true;
  }

  musicalModeToggleSwitch(state, RGBData, R, G, B) {
    firebase.database().ref(this.masterRoot + this.RGBRoot + "/" + RGBData.id).update({
      state: state,
      receiveSingleColorRequest: false,
      receiveAutoColorModeRequest: false,
      receiveMusicalModeRequest: state,
      R: R,
      G: G,
      B: B
    });
    return true;
  }

}