import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Platform, ActionSheetController } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { RoomDeviceInterfacePage} from '../room-device-interface/room-device-interface';

/**
 * Generated class for the HomedevicePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-homedevice',
  templateUrl: 'homedevice.html',
})
export class HomedevicePage {

  type : String;
  devices : String;

  constructor(public navCtrl: NavController, public navParams: NavParams,public platform: Platform) {
    this.type = navParams.get('data');
    console.log("In HomeGeneric room : " + this.type);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomedevicePage');
  }

}





 

