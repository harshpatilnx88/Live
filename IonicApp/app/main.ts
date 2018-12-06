import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NavController } from 'ionic-angular';
import { AppModule } from './app.module';
import { SettingPage} from '../pages/setting/setting';
platformBrowserDynamic().bootstrapModule(AppModule);

function openSettingPage() {
    alert("hi..");
        this.navCtrl.push(SettingPage);
}