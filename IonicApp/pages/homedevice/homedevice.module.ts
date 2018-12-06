import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomedevicePage } from './homedevice';

@NgModule({
  declarations: [
    HomedevicePage,
  ],
  imports: [
    IonicPageModule.forChild(HomedevicePage),
  ],
})
export class HomedevicePageModule {}

