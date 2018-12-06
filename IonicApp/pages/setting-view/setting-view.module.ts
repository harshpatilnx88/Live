import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingViewPage } from './setting-view';

@NgModule({
  declarations: [
    SettingViewPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingViewPage),
  ],
})
export class SettingViewPageModule {}
