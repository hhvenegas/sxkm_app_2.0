import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TrackingComponent } from '../sos/tracking/tracking.component';
import { ModalController, Events } from '@ionic/angular';
import { Router, NavigationExtras } from '@angular/router';
import { GlobalService } from '../../providers/global.service';
import { CarService } from 'src/app/providers/car.service';
import { Platform } from '@ionic/angular';
import { TweenMax, Power2, TimelineLite, TweenLite } from "gsap/TweenMax";


@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
})

export class WelcomePage implements OnInit {

  kms_status:any;
  kms_porcent:any;
  dueDate:any
  actual_date:any;
  disabled:boolean;
  car_select:any;
  car:any;
  cars:any=[];
  @ViewChild('canvas') canvasEl: ElementRef;
  App: any = {};
  private _CONTEXT: any;
  private _CANVAS: any;
  dtc: any = {};
  //Status : success , warning, danger
  state: any = "success";
  list_notifications = [];

  constructor(private modalCtlr: ModalController, private router: Router, private globlaService: GlobalService,
    public platform: Platform, private carService: CarService, public events: Events) {
    events.subscribe('car:selected', (car_selected) => {
      this.car_select = car_selected
      this.getCars();
      this.getKmStatus()
      this.getNextDueDate()
    });
    events.subscribe('new:notification', (dataNotification) => {
      this.list_notifications.push(dataNotification)
      console.log('status: ' + dataNotification['status']);
      this.state = dataNotification['status']
      this.initDtc();
      this.animate();
    });
    /* Valores de contro PIA */
    //  platform.ready().then(() => {
    this.App.width = platform.width()
    this.App.height = platform.height()
    this.dtc.sides = 20;
    this.dtc.twists = 6;
    this.dtc.lineWidth = 0;
    //  this.dtc.maxRadius = Math.min(200 * 0.35, 250);
    //  this.dtc.radius = Math.min(200 * 0.35, 250);
    this.dtc.maxRadius = Math.min(this.App.width * 0.5, 35);
    this.dtc.radius = Math.min(this.App.width * 0.5, 35);
    this.dtc.diameter = 0;
    this.dtc.dps = null;
    this.dtc.center = null;
    this.dtc.alpha = 0;
    this.dtc.alphaClear = 0.1;
    this.dtc.separation = 1.5;
    this.dtc.defaceFactor = 2;
    // Sensors
    this.dtc.electronic = 0;
    this.dtc.fuel_air = 0;
    this.dtc.injectors = 0;
    this.dtc.ignition = 0;
    this.dtc.emissions = 0;
    this.dtc.speed = 0;
    this.dtc.ECU = 0;
    this.dtc.transmission = 0;
    this.dtc.rotation = 0;
    this.dtc.vibration = 0;
    this.dtc.color = {
      r: 0,
      g: 0,
      b: 0
    };
    //  });
  }

  ngOnInit() {
    this._CANVAS = this.canvasEl.nativeElement;
    this._CANVAS.width = 200;
    this._CANVAS.height = 200;
    //this.init_dtc();
    //this.initialiseCanvas();
    this.initDtc();
    this.animate();
  }
  
  ionViewWillEnter() {
    this.getCars()
    this.getKmStatus()
    this.getNextDueDate()
  }

  /* async getNextDueDate() {
    this.dueDate = await this.globlaService.getNextDueDate();
  }
 */
  async getCars() {
    this.car = await this.carService.getCars()
    if (this.car.length != 0) {
      for (let cars of this.car) {
        this.cars.push(cars)
      }
      if (this.car_select) {
        for (let element of this.cars) {
          if (element.car.details.id == this.car_select.car.details.id) {
            this.car_select = element
            /* this.setStorage('car', JSON.stringify(this.car_select))
            this.setStorage('car_id', JSON.stringify(this.car_select.car.details.id)) */
            break;
          }
        }
      } else {
        this.car_select = this.cars[0]
        console.log(this.car_select)
        /* this.setStorage('car', JSON.stringify(this.car_select))
        this.setStorage('car_id', JSON.stringify(this.car_select.car.details.id)) */
      }
    } else {
    }
    this.getKmStatus()
    this.getNextDueDate()
  }

  async getNextDueDate(){
    let date = new Date();
    var day = date.getDate()
    var month = (date.getMonth()+1)
    var year = date.getFullYear()
    if (day < 10) {
      var dayString = '0' + Number(day);
    } else {
      var dayString = String(day);
    }
    if (month < 10) {
      var monthString = '0' + Number(month);
    } else {
      var monthString = String(month);
    }
    this.actual_date =  `${year}-${monthString}-${dayString}`
    this.dueDate = await this.globlaService.getNextDueDate();
    if(this.actual_date > this.dueDate){
      this.disabled = true
    }else{
      this.disabled = false
    }
  }

  async getKmStatus() {
    this.kms_status = await this.globlaService.getKmStatus();
    this.kms_porcent = (this.kms_status.used_km * 100)/this.kms_status.total_km + '%' 
  }

  paySubscription() {
    let navigationExtras: NavigationExtras = {
      state: {
        type_payment: 'membership'
      }
    };
    this.router.navigate(['purchase-options'], navigationExtras);
  }

  Recharge() {
    /* this.router.navigate(['recharge']); */
    let navigationExtras: NavigationExtras = {
      state: {
        type_payment: 'acquisition'
      }
    };
    this.router.navigate(['recharge'], navigationExtras);
  }

  onClickHelpWidget() {
    this.modalCtlr.create({ component: TrackingComponent }).then(modal => { modal.present(); });
  }

  initDtc() {
    this.dtc.dps = 360 / this.dtc.sides;
    this.set_vertices();
  }

  set_vertices() {
    let radius = this.dtc.radius;
    this.dtc.points = [];
    for (let i = 0; i < this.dtc.twists; i++) {
      radius += this.dtc.separation;
      this.dtc.diameter = radius * 2;
      this.dtc.center = {
        x: (200 - this.dtc.diameter) / 2 + radius,
        y: (200 - this.dtc.diameter) / 2 + radius
      };
      for (let j = 0; j < this.dtc.sides; j++) {
        let angle = this.dtc.dps * j,
          radians = angle * Math.PI / 180;
        let deface = Math.random() * this.dtc.defaceFactor - (this.dtc.defaceFactor / 2);
        let x = this.dtc.diameter * Math.cos(radians) + deface;
        let y = this.dtc.diameter * Math.sin(radians) + deface;
        let coords = {
          rand: Math.random() * (this.dtc.vibration) - (this.dtc.vibration / 2),
          deface: deface,
          x: x,
          y: y
        };
        this.dtc.points.push(coords);
      };
    };
    this.dtc.points.push(this.dtc.points[0]);
    this.dtc.points.push(this.dtc.points[1]);
    // this.points.push(this.points[2]);
  }

  animate() {
    var angular_this = this
    requestAnimationFrame(function () { angular_this.animate(); });
    this.drawCircle();
  }

  drawCircle() {
    //this.clearCanvas();
    this.update_dtc()
    this._CONTEXT = this._CANVAS.getContext("2d");
    this._CONTEXT.fillStyle = "rgb(255,255,255" + ")";
    this._CONTEXT.fillRect(0, 0, this.App.width, this.App.height);
    this._CONTEXT.save();
    this._CONTEXT.translate(this._CANVAS.width / 2, this._CANVAS.height / 2);
    this._CONTEXT.rotate(this.dtc.rotation);
    var zero = this.dtc.points[0];
    this._CONTEXT.lineCap = "round";
    this._CONTEXT.beginPath();
    this._CONTEXT.moveTo(zero.x, zero.y);
    for (var i = 0; i < this.dtc.points.length - 1; i++) {
      var point = this.dtc.points[i];
      var next_point = this.dtc.points[i + 1];
      var curve = this.getCurve(point, next_point);
      this._CONTEXT.quadraticCurveTo(point.x, point.y, curve.x, curve.y);
    };
    var curve = this.getCurve(next_point, zero);
    this._CONTEXT.quadraticCurveTo(zero.x, zero.y, curve.x, curve.y);
    // ctx.strokeStyle = "rgba(0, 206, 255, 0.35)";
    this._CONTEXT.strokeStyle = "rgb(" + this.dtc.color.r + "," + this.dtc.color.g + "," + this.dtc.color.b + ")";
    this._CONTEXT.lineWidth = this.dtc.lineWidth;
    this._CONTEXT.stroke();
    this._CONTEXT.restore();
    this.dtc.rotation += 0.01;
    this.setStatus(this.state);
    // x, y, radius, startAngle, endAngle
    // this._CONTEXT.arc(this._CANVAS.width/2, this._CANVAS.height/2, 80, 0, 2 * Math.PI);
    // this._CONTEXT.lineWidth   = 1;
    // this._CONTEXT.strokeStyle = '#ffffff';
    // this._CONTEXT.stroke();
  }

  update_dtc() {
    var time = new Date().getTime() * 0.006;
    for (var i = 0; i < this.dtc.points.length; i++) {
      var point = this.dtc.points[i];
      point.x += Math.cos(time) * point.rand;
      point.y -= Math.sin(time) * point.rand;
    };
  }

  getCurve(a, b) {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2
    }
  }

  setStatus(state) {
    var scope = this.dtc;
    switch (state) {
      case "danger":
        var color = {
          r: 255,
          g: 0,
          b: 0
        };
        break;
      case "success":
        var color = {
          r: 13,
          g: 191,
          b: 13
        };
        break;
      case "warning":
        var color = {
          r: 255,
          g: 191,
          b: 13
        };
        break;
      default:
        var color = {
          r: 0,
          g: 0,
          b: 0
        };
    }
    TweenMax.to(scope.color, 3, {
      ease: Power2.easeOut,
      scaleX: "2",
      scaleY: "2",
      display: "none",
      opacity: "0",
      r: color.r,
      g: color.g,
      b: color.b
    });
  }

}
