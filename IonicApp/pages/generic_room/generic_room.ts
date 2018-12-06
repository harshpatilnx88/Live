import { Platform, ActionSheetController } from 'ionic-angular';
import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Response } from '@angular/http';
import { RoomInterfaceSettingsPage } from '../room-interface-settings/room-interface-settings';
import { RoomDeviceInterfacePage } from '../room-device-interface/room-device-interface';
import { RoomDeviceGenericPage } from '../room-device-generic/room-device-generic';
import { HomedevicePage } from '../homedevice/homedevice';
import { RoomDeviceGenericDataPage } from '../room-device-generic-data/room-device-generic-data';
import firebase from 'firebase';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { ReplaySubject, Observable } from "rxjs/Rx";
import { MoodSelectorPage } from '../mood-selector/mood-selector';
import { LoginPage } from '../login/login';

@Component({
  selector: 'page-generic_room',
  templateUrl: 'generic_room.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericPage {
  room;
  public event;
  favourite_color_flag: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public actionsheetCtrl: ActionSheetController, private cd: ChangeDetectorRef, public FirebaseProvider: FirebaseProvider) {
    this.room = navParams.get('data');

    if (this.room.favourite == 'true') {
      this.favourite_color_flag = true;
    }
  }

  ionViewWillEnter() {
    this.event = this.FirebaseProvider.getRefresh().subscribe((val: string) => {
      this.cd.detectChanges();
    });
  }

  ionViewWillLeave() {
    console.log("in ngOnDestroy");
    this.cd.detach();
    this.event.unsubscribe();
  }

  openMenu() {
    let actionSheet = this.actionsheetCtrl.create({
      title: this.room + '',
      cssClass: 'page-generic-room',
      buttons: [
        {
          text: 'Interface Settings',
          role: 'interface settings',
          handler: () => {
            this.navCtrl.push(RoomInterfaceSettingsPage, { data: this.room }, { animate: false });
          }
        }
      ]
    });
    actionSheet.present();
  }

  openDevice(item) {
    this.navCtrl.push(RoomDeviceInterfacePage, { data: item }, { animate: false });
  }

  makeFavourite(item) {
    if (this.room.id != 'undefined') {
      if (this.FirebaseProvider.makeFavourite(item, this.room.id) == true) {
        this.favourite_color_flag = true;
      } else {
        this.favourite_color_flag = false;
      }
    }

    for (var i = 0; i < this.FirebaseProvider.room_infos.length; i++) {
      var obj = this.FirebaseProvider.room_infos[i];
      if (this.room.custom_name == obj.custom_name) {
        this.room = obj;
        break;
      }
    }
    this.cd.detectChanges();
  }

  openGenericRoom(room) {
    console.log(room);
    this.navCtrl.push(GenericPage, { data: room }, { animate: false });
  }

  openMoodSelector() {
    this.navCtrl.push(MoodSelectorPage, { room: this.room }, { animate: false });
  }

  openRoomDeviceGenericData(group) {
    this.navCtrl.push(RoomDeviceGenericDataPage, { group: group, room: this.room.custom_name, room_id: this.room.id }, { animate: false });
  }

  openRoomRGBDeviceGenericData(group, info) {
    this.navCtrl.push(RoomDeviceGenericDataPage, { group: group, room: this.room.custom_name, room_id: this.room.id, RGBData: info }, { animate: false });
  }

  openLoginPage() {
    this.navCtrl.push(LoginPage, { animate: false });
  }
}
