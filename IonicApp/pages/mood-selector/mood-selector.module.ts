import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoodSelectorPage } from './mood-selector';

@NgModule({
  declarations: [
    MoodSelectorPage,
  ],
  imports: [
    IonicPageModule.forChild(MoodSelectorPage),
  ],
})
export class MoodSelectorPageModule {}
