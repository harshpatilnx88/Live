import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { Http } from '@angular/http';
/**
 * Generated class for the RoomInterfaceSettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-room-interface-settings',
  templateUrl: 'room-interface-settings.html',
})
export class RoomInterfaceSettingsPage {
  room : String;
  mac_gpio : String;
  mac_gpioList: Array<{ mac_gpio: String}> = [];
  device: String;
  device_serial: String;
  devicesList: Array<{ value: String, text: string}> = [];
  pwm: String;
  pwmsList: Array<{ value: String, text: string}> = [];
  registeredDeviceList: Array<{ device: String, device_serial: string, pwm_support: string, mac_gpio : string}> = [];
  apiUrl = localStorage.getItem('localIP');
  devices : String;
  public isDeviceSelect: boolean = false;
  public isPWMSelect: boolean = false;
  public isRegisterDevice: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,public loadingCtrl: LoadingController, public http: Http) {
    this.room = navParams.get('data');
    this.pwm = "";
    this.fillRegisteredDevices();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomInterfaceSettingsPage');
  }
  
  
  scan(){
    this.pwmsList = [];
    this.devicesList = [];
    this.mac_gpioList = [];
    this.devices = "";
      const loader = this.loadingCtrl.create({
        content: "Please wait...",
        duration: 1000
      });
      loader.present();

      this.http.get(this.apiUrl+'/app/getUnRegisteredGPIO', {}).subscribe(
          data=>{
            if(data.text().length != 0){ 
              var split = data.text().split("\n");

              for(var i = 0; i< split.length; i++){
                if(split[i].length > 0){
                var obj = JSON.parse(split[i]);
                this.mac_gpioList.push({ mac_gpio: obj.mac_gpio });
                }
              }
           
              this.fillDevices();
              this.isDeviceSelect = true;
              this.isRegisterDevice = true; 
              loader.dismiss(); 
            }
         },error=>{
            console.log(error);
         });

  }

   registerDevice(){ 
    console.log("this.pwmsList :" + this.pwmsList);
    console.log("this.pwm :" + this.pwm  + "         " + this.pwm.length );

      if(this.mac_gpio == null){
        alert("MAC GPIO is not selected");
      }else if(this.device_serial == null){
        alert("Device is not selected");
      }else{ 
        var device_serial = this.device_serial.split('#')[0];
        var device = this.device_serial.split('#')[1];
        console.log("this.mac_gpio : " +this.mac_gpio + "  device_serial : " + device_serial + "   device : " + device + "   " + this.pwm);
        this.http.get(this.apiUrl+'/app/setRequestedRegisterGPIO?mac_gpio='+this.mac_gpio+'&device='+device+'&device_serial='+device_serial+'&pwm_support='+this.pwm+'&room_type='+this.room+'', {}).subscribe(
          data=>{
            this.pwmsList = [];
            this.devicesList = [];
            this.mac_gpioList = [];
            this.isRegisterDevice = false;
            this.fillRegisteredDevices();
            this.mac_gpio = null;
            this.pwm = null; 
            this.device_serial = null; 
        },error=>{
            console.log(error);
        });
        this.sendTestOff(this.mac_gpio);
      }
  }

  fillDevices(){
    this.http.get(this.apiUrl+'/app/getDevices', {}).subscribe(
      data=>{
        this.devices = data.text();
        var split = this.devices.split("\n"); 
        for(var i = 0; i< split.length; i++){
          if(split[i].length > 0){
            var obj = JSON.parse(split[i]);
            this.devicesList.push({ value: obj.device_serial, text: obj.device });
          }
        }

     },error=>{
        console.log(error);
     });
  }

  onDeviceSelect(serial){
  
    if(serial != ""){

      var split = this.devices.split("\n");
        this.pwmsList = [];
        var isChanges = true;
        for(var i = 0; i< split.length; i++){

          if(split[i].length > 0){
            var obj = JSON.parse(split[i]);
            if(serial.search('#') != -1 && obj.device_serial == serial.split('#')[0] && obj.pwm_status == 'true'){
            this.pwmsList.push({ value: "YES", text: 'YES' });
            this.pwmsList.push({ value: "NO", text: 'NO' });
            isChanges = false;
            this.isPWMSelect = true;
          }
        }
      }

      if(isChanges){
        this.pwmsList = [];
        this.isPWMSelect = false;
      }
    }
  }

  fillRegisteredDevices(){
    this.registeredDeviceList = [];
    this.pwmsList = [];
    this.http.get(this.apiUrl+'/app/getRegisteredDevicesByRoomType?room_type=' + this.room, {}).subscribe(
      data=>{
        this.devices = data.text();
        var split = this.devices.split("\n");

        for(var i = 0; i< split.length; i++){
          if(split[i].length > 0){
            var obj = JSON.parse(split[i]);
            this.registeredDeviceList.push({ device: obj.device, device_serial: obj.device_serial, pwm_support: obj.pwm_support , mac_gpio : obj.mac_gpio });
          }
        }

     },error=>{
        console.log(error);
     }); 
   }

   deleteRegisteredDevices(item){
      console.log("deleteRegisteredDevices : " + item.mac_gpio);
    this.http.get(this.apiUrl+'/app/deleteRegisteredDevicesByRoomType?mac_gpio=' + item.mac_gpio, {}).subscribe(
      data=>{        
        console.log("gpio deleteRegisteredDevices.....");
        this.fillRegisteredDevices();
     },error=>{
        console.log(error);
     }); 
   }

   testMACGPIO(item){
    console.log("testMACGPIO : " + item.mac_gpio);
    for(var i = 0 ; i < this.mac_gpioList.length; i++){
        console.log(this.mac_gpioList[i].mac_gpio); 
        if(item.mac_gpio == this.mac_gpioList[i].mac_gpio){
          this.sendTestOn(item.mac_gpio); 
          this.mac_gpio = item.mac_gpio;
        }else{
          this.sendTestOff(this.mac_gpioList[i].mac_gpio);
        }
    } 
   }

   sendTestOn(mac_gpio){
    var state = "HIGH";
    var pwm = "5";
    
    this.http.get(this.apiUrl+'/app/testMACGPIO?mac_gpio='+mac_gpio+'&state='+state+'&pwm='+ pwm, {}).subscribe(
      data=>{
       console.log("done.."); 
    },error=>{
        console.log(error);
    }); 
   }

   sendTestOff(mac_gpio){
    var state = "LOW";
    var pwm = "128";
    
    this.http.get(this.apiUrl+'/app/testMACGPIO?mac_gpio='+mac_gpio+'&state='+state+'&pwm='+ pwm, {}).subscribe(
      data=>{
       console.log("done.."); 
    },error=>{
        console.log(error);
    }); 
  }

}
