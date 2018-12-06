import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LoginPage } from '../login/login';
import { GenericPage } from '../generic_room/generic_room';
import { NavController, ToastController, ViewController, App } from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import firebase from 'firebase';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import 'rxjs/add/observable/of';


@Component({
  selector: 'page-room',
  templateUrl: 'room.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RoomPage {
  public event;
  public rainbowVal;
  constructor(public appCtrl: App, private viewCtrl: ViewController, private navCtrl: NavController, database: AngularFireDatabase, private cd: ChangeDetectorRef, public FirebaseProvider: FirebaseProvider) {
  }

  ionViewWillEnter() {
    this.event = this.FirebaseProvider.getRefresh().subscribe((val: string) => {
      this.cd.detectChanges();
    });
  }

  ionViewWillLeave() {
    this.cd.detach();
    this.event.unsubscribe();
  }

  openLoginPage() {
    this.appCtrl.getRootNav().setRoot(LoginPage);
  }

  openGenericRoom(room) {
    this.navCtrl.push(GenericPage, { data: room }, { animate: false });
  }

}
