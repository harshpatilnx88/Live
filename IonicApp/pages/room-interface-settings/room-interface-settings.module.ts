import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoomInterfaceSettingsPage } from './room-interface-settings';





@NgModule({
  declarations: [
    RoomInterfaceSettingsPage,
  ],
  imports: [
    IonicPageModule.forChild(RoomInterfaceSettingsPage),
  ],
})
export class RoomInterfaceSettingsPageModule {}
