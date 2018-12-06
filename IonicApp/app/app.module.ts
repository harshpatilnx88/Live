import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AppliancePage } from '../pages/function/function';
import { RoomPage } from '../pages/room/room';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { SettingPage } from '../pages/setting/setting';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpModule } from '@angular/http';
import { IonicStorageModule } from '@ionic/storage';
import { GenericPage } from '../pages/generic_room/generic_room';
import { RoomInterfaceSettingsPage } from '../pages/room-interface-settings/room-interface-settings';
import { RoomDeviceInterfacePage } from '../pages/room-device-interface/room-device-interface';
import { RoomDeviceGenericPage } from '../pages/room-device-generic/room-device-generic';
import { SocketIoModule, SocketIoConfig } from 'ng-socket-io';
import { HomedevicePage } from '../pages/homedevice/homedevice';
import { RemotePage } from '../pages/remote/remote';
import { AcremotePage } from '../pages/Acremote/Acremote';
import { RoomDeviceGenericDataPage } from '../pages/room-device-generic-data/room-device-generic-data';
import { MoodgenericdataPage } from '../pages/moodgenericdata/moodgenericdata';
import { LoginPage } from '../pages/login/login';
import { SettingAddPage } from '../pages/setting-add/setting-add';
import { SettingViewPage } from '../pages/setting-view/setting-view';
import { MoodSelectorPage } from '../pages/mood-selector/mood-selector';

// Import the AF2 Module
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { GlobalProvider } from '../providers/global/global';

// AF2 Settings
export const firebaseConfig = {
  apiKey: "AIzaSyDTd-rMoPQ6ZpbOvQF-PYQWYnAerQQqy4k",
  authDomain: "mylive-4a5c9.firebaseapp.com",
  databaseURL: "https://mylive-4a5c9.firebaseio.com",
  projectId: "mylive-4a5c9",
  storageBucket: "mylive-4a5c9.appspot.com",
  messagingSenderId: "1098106683155"
};

var temp = "temp";
const config: SocketIoConfig = { url: 'http://localhost:3001', options: {} };

@NgModule({
  declarations: [
    MyApp,
    AppliancePage,
    HomePage,
    RoomPage,
    TabsPage,
    SettingPage,
    GenericPage,
    RoomInterfaceSettingsPage,
    RoomDeviceInterfacePage,
    RoomDeviceGenericPage,
    HomedevicePage,
    RemotePage,
    AcremotePage,
    RoomDeviceGenericDataPage,
    MoodgenericdataPage,
    LoginPage,
    SettingAddPage,
    SettingViewPage,
    MoodSelectorPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(MyApp, { tabsHideOnSubPages: false, backButtonText: '' }),
    SocketIoModule.forRoot(config),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AppliancePage,
    HomePage,
    RoomPage,
    TabsPage,
    SettingPage,
    GenericPage,
    RoomInterfaceSettingsPage,
    RoomDeviceInterfacePage,
    RoomDeviceGenericPage,
    HomedevicePage,
    RemotePage,
    AcremotePage,
    RoomDeviceGenericDataPage,
    MoodgenericdataPage,
    LoginPage,
    SettingAddPage,
    SettingViewPage,
    MoodSelectorPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    FirebaseProvider,
    GlobalProvider
  ]
})
export class AppModule {


}
