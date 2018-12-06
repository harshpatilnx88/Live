import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingAddPage } from './setting-add';

@NgModule({
  declarations: [
    SettingAddPage,
  ],
  imports: [
    IonicPageModule.forChild(SettingAddPage),
  ],
})
export class SettingAddPageModule {}
