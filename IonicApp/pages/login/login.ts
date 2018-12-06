import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { TabsPage } from '../tabs/tabs';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  user: string = '';
  pwd: string = '';
  localIP: string = '192.168.0.50:3000';
  remoteIP: string = '';
  setting: Observable<any>;
  tabBarElement;

  constructor(public navCtrl: NavController, public navParams: NavParams, public http: Http) {
  }

  connect() {
    var user = this.user;
    var pwd = this.pwd;
    var localIP = this.localIP;
    var remoteIP = this.remoteIP;
    var apiUrl = "http://" + this.localIP;
    console.log(user + "  " + pwd + "   " + localIP + "   " + remoteIP);

    var postParams = '{ "user":' + user + ' , "pwd": ' + pwd + ' , "localIP" : ' + localIP + ' , "remoteIP" : ' + remoteIP + '}';


    this.http.post(apiUrl + '/app/connect', postParams).subscribe(
      data => {
        localStorage.setItem('user', user);
        localStorage.setItem('pwd', pwd);
        localStorage.setItem('localIP', "http://192.168.0.50:3000");
        localStorage.setItem('remoteIP', remoteIP);
      }, error => {

      });

    console.log(localStorage.getItem('localIP'));
    this.navCtrl.push(TabsPage);
  }
}
