import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { SettingViewPage } from '../../pages/setting-view/setting-view';
import { LoginPage } from '../login/login';
/**
 * Generated class for the SettingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  user: string = '';
  pwd: string = '';
  localIP: string = '192.168.0.50:3000';
  remoteIP: string = '';
  setting: Observable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {
  }

  openSettingPage() {
    this.navCtrl.push(SettingPage, { animate: false });
  }
  openSettingView(action) {
    this.navCtrl.push(SettingViewPage, { action: action }, { animate: false });
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage, { animate: false });
  }

}
