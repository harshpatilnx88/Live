import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SettingPage } from '../setting/setting';
import { RemotePage } from '../remote/remote';
import { AcremotePage } from '../Acremote/Acremote';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-function',
  templateUrl: 'function.html'
})
export class AppliancePage {

  constructor(public navCtrl: NavController) {

  }

  openSettingPage() {
    this.navCtrl.push(SettingPage, { animate: false });
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage, { animate: false });
  }

  openRemotePage(type) {
    this.navCtrl.push(RemotePage, { data: type }, { animate: false });
  }

  openAcremotePage(type) {
    this.navCtrl.push(AcremotePage, { data: type }, { animate: false });
  }
}





