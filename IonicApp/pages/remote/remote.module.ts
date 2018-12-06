import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RemotePage } from './remote';

@NgModule({
  declarations: [
    RemotePage,
  ],
  imports: [
    IonicPageModule.forChild(RemotePage),
  ],
})
export class RemotePageModule {}
