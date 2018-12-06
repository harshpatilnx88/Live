import { Component } from '@angular/core'; 
import { Http, Response } from '@angular/http';
import { NavController, IonicPage, NavParams, ToastController } from 'ionic-angular';
import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { LoginPage } from '../login/login';
/**
 * Generated class for the RoomDeviceInterfacePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-room-device-interface',
  templateUrl: 'room-device-interface.html',
})
export class RoomDeviceInterfacePage {
  device : string;
  mac_gpio : string;
  pwm_support : string;
  pwm : string;
  state : string;
  toggle : boolean = true;
  apiUrl = localStorage.getItem('localIP');
  isPWMSelect: boolean = false;
  messages = [];
  
 

  constructor(public navCtrl: NavController, public navParams: NavParams,public http: Http, private socket: Socket, private toastCtrl: ToastController) {
    var data = JSON.parse(JSON.stringify(navParams.get('data')));    
    this.mac_gpio = data.mac_gpio;
    this.getRegisterDeviceStatus();

    //SOCKET CODE
    this.socket.connect();
     
    this.getTrigger().subscribe(data => {
      let dataStr = data['data'];
      this.getRegisterDeviceStatus();
    });
  }
 
  openLoginPage() {
    this.navCtrl.push(LoginPage, { animate: false });
  }

  getTrigger() {
    let observable = new Observable(observer => {
      this.socket.on('trigger', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }
  

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomDeviceInterfacePage  ');
  }

   toggleSwitch(event){
      var state = "LOW";
      var pwm = "128";
     
      if(event.checked == true){
        state = "HIGH";
        pwm = "0";
      } 
       
      this.http.get(this.apiUrl+'/app/request?mac_gpio='+this.mac_gpio+'&state='+state+'&pwm='+ pwm, {}).subscribe(
        data=>{
         console.log("done..");

      },error=>{
          console.log(error);
      }); 
   }

   getRegisterDeviceStatus(){
    this.http.get(this.apiUrl+'/app/getRegisteredDevicesStatus?mac_gpio='+this.mac_gpio, {}).subscribe(
      data=>{
       console.log("done..");
    var obj = JSON.parse(data.text());    
    this.device = obj.device;
    this.mac_gpio = obj.mac_gpio;
    this.pwm_support = obj.pwm_support;
    this.pwm = obj.pwm;
    this.state = obj.state;
 
    console.log("this.pwm_support : " +this.pwm_support);

    if(this.pwm_support != null && this.pwm_support == "YES"){
      this.isPWMSelect = true;
    }else{
      this.isPWMSelect = false;
    }

    if(this.state == "LOW"){
      this.toggle = false;
    }else{
      this.toggle = true;
    }
    },error=>{
        console.log(error);
    });
   }
    
}
