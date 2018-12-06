import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { LoginPage } from '../login/login';
import { Jsonp } from '@angular/http';
import * as $ from 'jquery';

@IonicPage()
@Component({
  selector: 'page-room-device-generic-data',
  templateUrl: 'room-device-generic-data.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomDeviceGenericDataPage {
  room_id; room; group; info;
  public event;
  days: Array<{ day: String }> = [];
  minutes: Array<{ minute: String }> = [];
  hours: Array<{ hour: String }> = [];
  onTimeHourVal; onTimeMinuteVal; offTimeHourVal; offTimeMinuteVal; dayVal; schedularName; schedularData = [];
  daysIndex = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  rainbowVal; RGBData; R = 255; G = 0; B = 0; receiveSingleColorRequest = false; receiveMusicalModeRequest = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private cd: ChangeDetectorRef, public FirebaseProvider: FirebaseProvider) {
    this.initializer();
  }

  initializer() {

    this.room = this.navParams.get('room');
    this.group = this.navParams.get('group');
    this.room_id = this.navParams.get('room_id');

    console.log("Initializer group  : " + this.group);
    // this.days; this.minutes; this.hours; this.onTimeHourVal; this.onTimeMinuteVal; this.offTimeHourVal; this.offTimeMinuteVal; this.dayVal; this.schedularName; this.schedularData = [];

    if (this.group == "RGB") {
      this.RGBData = this.navParams.get('RGBData');
      this.receiveSingleColorRequest = this.RGBData.receiveSingleColorRequest;
      this.receiveMusicalModeRequest = this.RGBData.receiveMusicalModeRequest;

      console.log("RGB receiveSingleColorRequest : " + this.receiveSingleColorRequest);
      console.log("RGB receiveMusicalModeRequest : " + this.receiveMusicalModeRequest);

    }

    if (this.group == "addSchedular") {
      this.info = this.navParams.get('info');
      this.days.push({ day: "All" }, { day: "SU" }, { day: "MO" }, { day: "TU" }, { day: "WE" }, { day: "TH" }, { day: "FR" }, { day: "SA" });

      for (var i = 0; i <= 60; i++) {
        this.minutes.push({ minute: "" + i });
      }

      for (var i = 1; i <= 24; i++) {
        this.hours.push({ hour: "" + i });
      }
    }

    if (this.group == "viewSchedular") {
      this.info = JSON.parse(JSON.stringify(this.navParams.get('info')));
      this.schedularData = [];

      console.log("this.group : " + this.group + "    this.info.group :   " + this.info.group);

      if (this.info.group == "LIGHTING") {
        for (var l in this.FirebaseProvider.light_device_infos) {
          console.log(this.FirebaseProvider.light_device_infos[l].group);
          if (typeof JSON.stringify(this.FirebaseProvider.light_device_infos[l].group) != 'undefined' && this.FirebaseProvider.light_device_infos[l].room_id == this.room_id) {
            var schObj = JSON.parse(JSON.stringify(this.FirebaseProvider.light_device_infos[l].schedularData));
            for (var x in schObj) {
              this.schedularData.push({ schedularName: schObj[x].schedularName, checked: schObj[x].checked });
            }
          }
        }
      }

      if (this.info.group == "FAN") {
        for (var l in this.FirebaseProvider.fan_device_infos) {
          console.log(this.FirebaseProvider.fan_device_infos[l].group);
          if (typeof JSON.stringify(this.FirebaseProvider.fan_device_infos[l].group) != 'undefined' && this.FirebaseProvider.fan_device_infos[l].room_id == this.room_id) {
            var schObj = JSON.parse(JSON.stringify(this.FirebaseProvider.fan_device_infos[l].schedularData));
            for (var x in schObj) {
              this.schedularData.push({ schedularName: schObj[x].schedularName, checked: schObj[x].checked });
            }
          }
        }
      }

      if (this.info.group == "AC") {
        for (var l in this.FirebaseProvider.ac_device_infos) {
          console.log(this.FirebaseProvider.ac_device_infos[l].group);
          if (typeof JSON.stringify(this.FirebaseProvider.ac_device_infos[l].group) != 'undefined' && this.FirebaseProvider.ac_device_infos[l].room_id == this.room_id) {
            var schObj = JSON.parse(JSON.stringify(this.FirebaseProvider.ac_device_infos[l].schedularData));
            for (var x in schObj) {
              this.schedularData.push({ schedularName: schObj[x].schedularName, checked: schObj[x].checked });
            }
          }
        }
      }
    }
  }

  ionViewWillEnter() {
    this.event = this.FirebaseProvider.getRefresh().subscribe((val: string) => {
      this.initializer();
      this.cd.detectChanges();
    });
  }

  ionViewWillLeave() {
    this.cd.detach();
    this.event.unsubscribe();
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage, { animate: false });
  }

  toggleSwitch(event, info) {
    var state = "LOW";
    var pwm = "0";

    if (event.checked == true) {
      state = "HIGH";
      pwm = "100";
    }

    if (this.FirebaseProvider.toggleSwitch(info, info.id, info.mac_gpio, state, pwm, this.room_id, this.group)) {
      this.initializer();
      this.cd.detectChanges();
    }
  }

  addSchedular(info) {
    this.navCtrl.push(RoomDeviceGenericDataPage, { info: info, room: this.room, room_id: this.room_id, group: "addSchedular" }, { animate: false });
    this.cd.detectChanges();
  }

  uniqueArr(days, val) {
    var x;
    var result = true;
    for (x in days) {
      if (val == days[x]) {
        result = false;
      }
    }
    return result;
  }

  saveAddSchedular() {
    var x, y;
    var days = [];

    for (x in this.dayVal) {
      if (this.dayVal[x] == "All") {
        days.push(0, 1, 2, 3, 4, 5, 6);
      } else {
        for (y in this.daysIndex) {
          if (this.daysIndex[y] == this.dayVal[x] && this.uniqueArr(days, y)) {
            days.push({ y });
          }
        }
      }
    }

    var data = {
      schedularName: this.schedularName,
      onTimeHourVal: this.onTimeHourVal,
      onTimeMinuteVal: this.onTimeMinuteVal,
      offTimeHourVal: this.offTimeHourVal,
      offTimeMinuteVal: this.offTimeMinuteVal,
      days: days,
      checked: false
    };

    if (this.FirebaseProvider.saveAddSchedular(this.info, data)) {
      this.navCtrl.pop({ animate: false });
      this.initializer();
      this.cd.detectChanges();
    }
  }

  viewSchedular(info) {
    this.navCtrl.push(RoomDeviceGenericDataPage, { info: info, room: this.room, room_id: this.room_id, group: "viewSchedular" }, { animate: false });
  }

  toggleSwitchDeviceSchedular(event, schedularData) {
    schedularData.checked = event.checked;
    if (this.FirebaseProvider.toggleSwitchDeviceSchedular(this.room_id, this.info, schedularData)) {
      // this.initializer();
      this.cd.detectChanges();
    }
  }

  deleteDeviceSchedularData(schedularData) {
    if (this.FirebaseProvider.deleteDeviceSchedularData(this.room_id, this.info, schedularData)) {
      this.initializer();
      this.cd.detectChanges();
    }
  }

  rainbow(event) {
    // var css = document.createElement('style');
    // document.body.appendChild(css);
    // var hslcolor = "hsl(" + this.rainbowVal + ", 100%, 50%)";
    // css.textContent = ".rainbow::-webkit-slider-thumb { background: " + hslcolor + "; }";
    // var tc = new tinycolor(hslcolor);
    // var rgb = tc.toRgb();
    // this.R = rgb.r;
    // this.G = rgb.g;
    // this.B = rgb.b;
    // console.log("tc.toHex() : " + JSON.stringify(tc.toRgb()));

    // console.log("receiveSingleColorRequest : " +this.receiveSingleColorRequest);
    // console.log("receiveMusicalModeRequest : " +this.receiveMusicalModeRequest);

    // if (this.receiveSingleColorRequest) {
    //   if (this.FirebaseProvider.singleColorToggleSwitch(true, this.RGBData, this.R, this.G, this.B)) {
    //     this.initializer();
    //     this.cd.detectChanges();
    //   }
    // }

    // (this.receiveMusicalModeRequest)
    // {
    //   if (this.FirebaseProvider.musicalModeToggleSwitch(true, this.RGBData, this.R, this.G, this.B)) {
    //     this.initializer();
    //     this.cd.detectChanges();
    //   }
    // }
  }

  singleColorToggleSwitch(event) {
    this.receiveSingleColorRequest = event.checked;
    if (this.FirebaseProvider.singleColorToggleSwitch(event.checked, this.RGBData, this.R, this.G, this.B)) {
      this.initializer();
      this.cd.detectChanges();
    }
  }

  musicalModeToggleSwitch(event) {
    this.receiveMusicalModeRequest = event.checked;
    if (this.FirebaseProvider.musicalModeToggleSwitch(event.checked, this.RGBData, this.R, this.G, this.B)) {
      this.initializer();
      this.cd.detectChanges();
    }
  }

  rangeSlider(event, info) {
    console.log("Event val : " + event.value + "\n" + JSON.stringify(info));

    var state = "LOW";
    var pwm = "0";

    if (event.value > 0) {
      state = "HIGH";
      pwm = "" + event.value;
    }

    console.log(info.id + "   " + info.mac_gpio + "   " + state + "   " + pwm + "   " + this.room_id + "   " + this.group);
    if (this.FirebaseProvider.toggleSwitch(info, info.id, info.mac_gpio, state, pwm, this.room_id, this.group)) {
    }
  }

}
