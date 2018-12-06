import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoomDeviceGenericPage } from './room-device-generic';
import { Platform, ActionSheetController } from 'ionic-angular';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, Response } from '@angular/http';
@NgModule({
  declarations: [
    RoomDeviceGenericPage,
  ],
  imports: [
    IonicPageModule.forChild(RoomDeviceGenericPage),
  ],
})
export class RoomDeviceGenericPageModule {

 device :String;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.device = navParams.get('data');
   
    console.log("In Generic room : " + this.device);
  }

}
