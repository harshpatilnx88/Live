import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AcremotePage } from './acremote';

@NgModule({
  declarations: [
    AcremotePage,
  ],
  imports: [
    IonicPageModule.forChild(AcremotePage),
  ],
})
export class AcremotePageModule {}
