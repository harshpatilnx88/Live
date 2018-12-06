import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SettingPage } from '../setting/setting';
import { GenericPage } from '../generic_room/generic_room';
import { HomedevicePage } from '../homedevice/homedevice';
import { LoginPage } from '../login/login';
import { FirebaseProvider } from '../../providers/firebase/firebase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {
  event; moodinfo = [];

  constructor(public navCtrl: NavController, private cd: ChangeDetectorRef, public FirebaseProvider: FirebaseProvider) {
    this.initializer();
  }

  initializer() {
    this.moodinfo = [];
    var x, y;
    var moodArr = [];
    for (x in this.FirebaseProvider.setting_mood_list) {
      moodArr.push(this.FirebaseProvider.setting_mood_list[x].mood + "#" + this.FirebaseProvider.setting_mood_list[x].mood_checked);
    }

    var filteredArray = moodArr.filter(function (item, pos) {
      return moodArr.indexOf(item) == pos;
    });

    for (x in filteredArray) {
      var data = filteredArray[x].split("#");
      var checked = "Off";
      if (data[1] == "true") {
        checked = "On";
      }
      this.moodinfo.push({ mood: data[0], checked: checked });
    }
  }

  toggleWholeHouseMoodSelector(checked, info) {
    if (checked == "On") {
      checked = "false";
    } else {
      checked = "true";
    }

    if (this.FirebaseProvider.toggleWholeHouseMoodSelector(checked, info.mood)) {
      this.initializer();
      this.cd.detectChanges();
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

  openSettingPage() {
    this.navCtrl.push(SettingPage);
  }

  openHomeGenericPage(type) {
    this.navCtrl.push(HomedevicePage, { data: type }, { animate: false });
  }
}

