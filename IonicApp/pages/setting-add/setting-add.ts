import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { LoginPage } from '../login/login';
import { INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic/src/platform_providers';

@IonicPage()
@Component({
  selector: 'page-setting-add',
  templateUrl: 'setting-add.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingAddPage {

  action; room_info; mac_gpio; custom_device_name; event;
  group_list: Array<{ group: String }> = [];
  group: String;
  dimming_list: Array<{ value: String }> = [];
  dimming: String;
  device: String;
  room_type_list: Array<{ type: String }> = [];
  room_type: String;
  custom_room_name: String;
  mood_name: String;

  constructor(private alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, private FirebaseProvider: FirebaseProvider, private cd: ChangeDetectorRef) {
    this.action = navParams.get('action');

    if (this.action == "Appliance") {
      this.group_list.push({ group: "LIGHTING" });
      this.group_list.push({ group: "AC" });
      this.group_list.push({ group: "FAN" });
      this.group_list.push({ group: "SHADING" });
      this.group_list.push({ group: "ENTERTAINMENT" });

      this.dimming_list.push({ value: "TRUE" });
      this.dimming_list.push({ value: "FALSE" });
    }

    if (this.action == "Room") {
      this.room_type_list.push({ type: "Hall" });
      this.room_type_list.push({ type: "Kitchen" });
      this.room_type_list.push({ type: "Bedroom" });
      this.room_type_list.push({ type: "Master Bedroom" });
    }

    if (this.action == "RoomSetting") {
      this.room_info = JSON.parse(JSON.stringify(navParams.get('info')));
      this.room_type = this.room_info.room_type;
      this.custom_room_name = this.room_info.custom_name;
    }

    if (this.action == "RoomSettingScan") {
      this.room_info = JSON.parse(JSON.stringify(navParams.get('info')));
      this.room_type = this.room_info.room_type;
      this.custom_room_name = this.room_info.custom_name;

      this.dimming_list.push({ value: "TRUE" });
      this.dimming_list.push({ value: "FALSE" });
    }

    if (this.action == "MoodRoomDeviceSetting") {
      this.room_type = navParams.get('room_type');
      this.custom_room_name = navParams.get('custom_name');
      this.mood_name = navParams.get('mood');
    }
  }

  ionViewWillEnter() {
    this.event = this.FirebaseProvider.getRefresh().subscribe((val: string) => {
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

  addDevice() {
    if (this.group == null || this.group.length == 0) {
      this.alert("Error", "Please select group");
    } else if (this.dimming == null || this.dimming.length == 0) {
      this.alert("Error", "Please specify dimming");
    } else if (this.device == null || this.device.length == 0) {
      this.alert("Error", "Please specify device");
    } if (this.FirebaseProvider.addDevice(this.group, this.dimming, this.device)) {
      this.navCtrl.pop({ animate: false });
    }
  }

  addRoom() {
    if (this.room_type == null || this.room_type.length == 0) {
      this.alert("Error", "Please specify room type");
    } else if (this.custom_room_name == null || this.custom_room_name.length == 0) {
      this.alert("Error", "Please specify custom room name");
    } else if (this.FirebaseProvider.addRoom(this.room_type, this.custom_room_name)) {
      this.navCtrl.pop({ animate: false });
    }
  }

  scanGPIOs() {
    this.navCtrl.push(SettingAddPage, { action: "RoomSettingScan", info: this.room_info });
  }

  addRegisterDevice() {

    console.log(this.custom_room_name + "  " + this.room_info.id + "  " + this.mac_gpio + "  " + this.dimming + "  " + this.device + "  " + this.custom_device_name);

    if (this.mac_gpio == null || this.mac_gpio.length == 0) {
      this.alert("Error", "Please select switch");
    } else if (this.dimming == null || this.dimming.length == 0) {
      this.alert("Error", "Please specify dimming specification");
    } else if (this.device == null || this.device.length == 0) {
      this.alert("Error", "Please specify device type");
    } else if (this.custom_device_name == null || this.custom_device_name.length == 0) {
      this.alert("Error", "Please specify custom device name");
    } else if (this.FirebaseProvider.addRegisterDevice(this.custom_room_name, this.room_info.id, this.mac_gpio, this.dimming, this.device, this.custom_device_name)) {
      this.navCtrl.pop({ animate: false });
    }
  }

  unRegisterDevice(info) {
    if (this.FirebaseProvider.unRegisterDevice(info)) {
      this.cd.detectChanges();
    }
  }

  addMood() {
    if (this.mood_name == null || this.mood_name.length == 0) {
      this.alert("Error", "Please specify mood name");
    } else if (this.FirebaseProvider.addMood(this.mood_name)) {
      this.navCtrl.pop({ animate: false });
    }
  }

  toggleSwitchMood(event, info) {
    var state = "LOW";
    var pwm = "0";

    if (event.checked == true) {
      state = "HIGH";
      pwm = "100";
    }

    if (this.FirebaseProvider.toggleSwitchMood(this.mood_name, info, info.id, info.mac_gpio, state, pwm, info.room_id, info.group)) {
      this.cd.detectChanges();
    }
  }

  toggleLock(info) {
    var freeze = false;

    if (info.freeze == false) {
      freeze = true;
    }

    if (this.FirebaseProvider.toggleLock(info, freeze)) {
      this.cd.detectChanges();
    }
  }

  alert(title, subTitle) {
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: subTitle,
      buttons: ['OK']
    });
    alert.present();
  }
}
