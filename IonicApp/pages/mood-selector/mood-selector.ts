import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
/**
 * Generated class for the MoodSelectorPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mood-selector',
  templateUrl: 'mood-selector.html',
})
export class MoodSelectorPage {
  room; moodinfo = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public FirebaseProvider: FirebaseProvider) {
    this.room = JSON.parse(JSON.stringify(navParams.get('room')));
    var x, y;
    var moodArr = [];
    for (x in FirebaseProvider.setting_mood_list) {
      if (FirebaseProvider.setting_mood_list[x].custom_name == this.room.custom_name) {
        if (FirebaseProvider.setting_mood_list[x].checked != undefined) {
          moodArr.push(FirebaseProvider.setting_mood_list[x].mood + "#" + FirebaseProvider.setting_mood_list[x].checked);
        } else {
          moodArr.push(FirebaseProvider.setting_mood_list[x].mood + "#false");
        }
      }
    }

    var filteredArray = moodArr.filter(function (item, pos) {
      return moodArr.indexOf(item) == pos;
    });

    console.log("filteredArray : " + JSON.stringify(filteredArray));
    for (x in filteredArray) {
      var mood = filteredArray[x].split("#")[0];
      var checked: boolean = false;

      if (filteredArray[x].split("#")[1] == 'true') {
        checked = true;
      }

      this.moodinfo.push({ mood: mood, checked: checked });
    }
  }

  toggleSwitchMoodSelector(event, info) {
    var checked = event.checked;
    console.log("room_id : " + this.room.id);
    this.FirebaseProvider.toggleSwitchMoodSelector(checked, info.mood, this.room.id);
  }

}
