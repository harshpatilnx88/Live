import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { MoodgenericdataPage } from '../moodgenericdata/moodgenericdata';
import { LoginPage } from '../login/login';
/**
 * Generated class for the RoomDeviceGenericPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-room-device-generic',
  templateUrl: 'room-device-generic.html',
})
export class RoomDeviceGenericPage {
  room: String;


  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.room = navParams.get('data');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomDeviceGenericPage');
  }

  moodGenericData() {
    this.navCtrl.push(MoodgenericdataPage, { animate: false });
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage, { animate: false });
  }
}
