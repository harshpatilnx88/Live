import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SettingAddPage } from '../../pages/setting-add/setting-add';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { LoginPage } from '../login/login';

@IonicPage()
@Component({
  selector: 'page-setting-view',
  templateUrl: 'setting-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingViewPage {
  action; event; moodinfo: Array<{ mood: String }> = []; mood;
  days: Array<{ day: String }> = [];
  minutes: Array<{ minute: String }> = [];
  hours: Array<{ hour: String }> = [];
  hourVal; minuteVal; dayVal; schedularName; schedularData = [];
  daysIndex = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

  constructor(public navCtrl: NavController, public navParams: NavParams, private FirebaseProvider: FirebaseProvider, private cd: ChangeDetectorRef) {
    this.action = navParams.get('action');
    // this.initializer();
  }

  initializer() {
    this.moodinfo = [];
    this.days = [];
    this.minutes = [];
    this.hours = [];
    this.schedularData = [];

    if (this.action == "MoodRoomSetting") {
      this.moodinfo.push({ mood: this.navParams.get('mood') });
      this.mood = this.navParams.get('mood');
      var i = 0;
      for (x in this.FirebaseProvider.setting_mood_list) {
        if (this.moodinfo[0].mood == this.FirebaseProvider.setting_mood_list[x].mood && i == 0) {
          this.schedularData = this.FirebaseProvider.setting_mood_list[x].schedularData;
          i++;
        }
      }
    }

    if (this.action == "MoodRoomSettingSchedular") {
      this.mood = JSON.stringify(this.navParams.get('mood'));
      this.days.push({ day: "All" }, { day: "SU" }, { day: "MO" }, { day: "TU" }, { day: "WE" }, { day: "TH" }, { day: "FR" }, { day: "SA" });

      for (var i = 0; i <= 60; i++) {
        this.minutes.push({ minute: "" + i });
      }

      for (var i = 1; i <= 24; i++) {
        this.hours.push({ hour: "" + i });
      }
    }

    if (this.action == "Mood") {
      var x, y;
      var moodArr = [];
      for (x in this.FirebaseProvider.setting_mood_list) {
        moodArr.push(this.FirebaseProvider.setting_mood_list[x].mood);
      }

      var filteredArray = moodArr.filter(function (item, pos) {
        return moodArr.indexOf(item) == pos;
      });

      for (x in filteredArray) {
        this.moodinfo.push({ mood: filteredArray[x] });
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

  addView() {
    this.navCtrl.push(SettingAddPage, { action: this.action }, { animate: false });
  }

  deleteDevice(info) {
    if (this.FirebaseProvider.deleteDevice(info)) {
      this.cd.detectChanges();
    }
  }

  deleteRoom(info) {
    if (this.FirebaseProvider.deleteRoom(info)) {
      this.cd.detectChanges();
    }
  }

  openRoomSetting(info) {
    this.navCtrl.push(SettingAddPage, { info: info, action: "RoomSetting" }, { animate: false });
  }

  openMoodRoomSetting(info) {
    this.navCtrl.push(SettingViewPage, { mood: info.mood, action: "MoodRoomSetting" }, { animate: false });
  }

  openMoodRoomDeviceSetting(info, custom_name, room_type) {
    this.navCtrl.push(SettingAddPage, { room_id: info.room_id, mood: info.mood, room_type: room_type, custom_name: custom_name, action: "MoodRoomDeviceSetting" }, { animate: false });
  }

  deleteMood(info) {
    if (this.FirebaseProvider.deleteMood(info.mood)) {
      this.initializer();
      this.cd.detectChanges();
    }
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage, { animate: false });
  }

  addSchedule(mood) {
    this.navCtrl.push(SettingViewPage, { mood: mood, action: "MoodRoomSettingSchedular" }, { animate: false });
  }

  saveMoodRoomSettingSchedular() {
    var x, y;
    var days = [];

    for (x in this.dayVal) {
      if (this.dayVal[x] == "All") {
        days.push(0, 1, 2, 3, 4, 5, 6);
      } else {
        for (y in this.daysIndex) {
          if (this.daysIndex[y] == this.dayVal[x] && this.uniqueArr(days, y)) {
            days.push({y});
          }
        }
      }
    }

    if (this.FirebaseProvider.saveMoodRoomSettingSchedular(this.mood.replace(/\"/g, ""), this.schedularName, this.hourVal, this.minuteVal, days)) {
      this.navCtrl.pop({ animate: false });
    }
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


  deleteSchedularData(info) {
    if (this.FirebaseProvider.deleteSchedularData(this.mood, info.schedularName)) {
      this.initializer();
      this.cd.detectChanges();
    }
  }

  toggleSwitchSchedular(event, info) {
    if (this.FirebaseProvider.toggleSwitchSchedular(this.mood, event.checked, info.schedularName)) {
      this.initializer();
      this.cd.detectChanges();
    }
  }
}
