import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoomDeviceGenericDataPage } from './room-device-generic-data';

@NgModule({
  declarations: [
    RoomDeviceGenericDataPage,
  ],
  imports: [
    IonicPageModule.forChild(RoomDeviceGenericDataPage),
  ],
})
export class RoomDeviceGenericDataPageModule {}
