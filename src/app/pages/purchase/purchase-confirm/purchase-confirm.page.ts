import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, Platform, NavController } from '@ionic/angular';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
declare var OpenPay;

@Component({
  selector: 'app-purchase-confirm',
  templateUrl: './purchase-confirm.page.html',
  styleUrls: ['./purchase-confirm.page.scss'],
})
export class PurchaseConfirmPage implements OnInit {

  //params route
  params:any;

  loading:any;
  loading_window:any;
  deviceIdHiddenFieldName:any;
  card_saved_select:any;


  autoRenew: boolean = false;
  showAlert: boolean = false;

  constructor(public loadingCtrl: LoadingController,private route: ActivatedRoute, private router: Router, private navCtrl: NavController) { 
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.params = this.router.getCurrentNavigation().extras.state;
      }
    });
  }

  ngOnInit(){
  }

  goBack(){
    this.navCtrl.back()
  }

  payment(type_payment){
    console.log(type_payment)
    let ionic_this = this
    this.loading = true
    if(type_payment != 'cash' && type_payment != 'spei'){
      // OpenPay.setId('mtpac6zng162oah2h67h');
      // ​OpenPay.setApiKey('pk_42af74150db6413692eb47624a1e903a');
      // OpenPay.setSandboxMode(false);}
      this.card_saved_select = type_payment.card_remote_id
        OpenPay.setId('mdt4m9gkdvu9xzgjtjrk');
    ​    OpenPay.setApiKey('pk_3670bc7e899241ad87ceffb49757979c');
        OpenPay.setSandboxMode(true);
       this.deviceIdHiddenFieldName = OpenPay.deviceData.setup();
       this.openpayCardPaySaved()
    } else if( type_payment == 'spei'){
      this.payWithSpei()
    } else if( type_payment == 'efectivo'){
      this.payWithOxxo()
    }
  }

  openpayCardPaySaved(){
    
  }

  payWithSpei(){

  }

  payWithOxxo(){

  }

  onAutoRenew() {
    this.autoRenew = !this.autoRenew;
  }

  onPaymentFailed() {
    this.showAlert = true;
  }

  onCloseAlert() {
    this.showAlert = false;
  }

}
