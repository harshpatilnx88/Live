import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoomDeviceInterfacePage } from './room-device-interface';

@NgModule({
  declarations: [
    RoomDeviceInterfacePage,
  ],
  imports: [
    IonicPageModule.forChild(RoomDeviceInterfacePage),
  ],
})
export class RoomDeviceInterfacePageModule {}
