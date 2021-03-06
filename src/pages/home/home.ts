import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { RegisterPage } from '../register/register';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../../models/user';
import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';

import * as firebase from 'firebase/app';
import { TabsPage } from '../tabs/tabs';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  user = {} as User;
  loader: any;

  constructor(private afauth: AngularFireAuth, private fb: Facebook, private platform: Platform, public navCtrl: NavController, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
  
  }
  
  async login(user: User) {
    try {
      this.presentLoading();
      const result = await this.afauth.auth.signInWithEmailAndPassword(user.email,user.password);//user.email, user.password);
      if (result){
        this.navCtrl.setRoot(TabsPage);
        this.loader.dismiss();
      }
    } catch (e) {
      console.error(e);
      let alert = this.alertCtrl.create({
        title: 'Login Failed',
        subTitle: 'Login information provided was incorrect. Please try again.',
        buttons: ['Okay']
      });
      this.loader.dismiss();
      alert.present();
    }
  }

  signInWithFacebook() {
    this.presentLoading();
    if (this.platform.is('cordova')) {
      return this.fb.login(['email', 'public_profile']).then(res => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        firebase.auth().signInWithCredential(facebookCredential).then(success=>{
          if (success){
            this.loader.dismiss();
            this.navCtrl.setRoot(TabsPage);
          }
        }).catch((error) => { 
          console.log(error.code);
          let alert = this.alertCtrl.create({
            title: 'Login Failed',
            subTitle: 'Sorry, we could not log you in with Facebook. Please try again.',
            buttons: ['Okay']
          });
          this.loader.dismiss();
          alert.present();
        });
      }).catch((error) => { 
        this.loader.dismiss();
      });
    }else {
      this.afauth.auth
        .signInWithPopup(new firebase.auth.FacebookAuthProvider())
        .then((res) => {
          this.navCtrl.setRoot(TabsPage);
          this.loader.dismiss();
        });
    }
  }

  register() {
    this.navCtrl.push(RegisterPage);
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Logging In...",
    });
    this.loader.present();
  }
}
