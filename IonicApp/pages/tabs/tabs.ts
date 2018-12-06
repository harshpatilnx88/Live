import { Component } from '@angular/core';

import { AppliancePage } from '../function/function';
import { RoomPage } from '../room/room';
import { HomePage } from '../home/home';
import { SettingPage } from '../setting/setting';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = RoomPage;
  tab3Root = AppliancePage;
  tab4Root = SettingPage;

  constructor() {

  }
}
