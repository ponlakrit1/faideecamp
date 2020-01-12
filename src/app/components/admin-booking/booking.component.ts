import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BookingList } from './../../data-model/booking.model';

declare var require: any
@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  @ViewChild('modalBooking', {static: true}) modalContent: TemplateRef<any>;

  page = 1;
  pageSize = 10;
  moment = require('moment');

  dataItem: BookingList;

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  dataDisplay: BookingList[];
  dataSize: number = 0;

  course: string;
  dateModel: NgbDateStruct;
  description: string;
  dupStatus: boolean;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal) {
    // Set firebase
    this.itemsRefDisplay = this.db.list(`booking-list`, ref => ref.orderByChild('year').equalTo(this.moment().format("YYYY")));
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.course = "1";
    this.dupStatus = false;
  }

  ngOnInit() {
    this.itemsDisplay.subscribe(
      (data: BookingList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  addBooking(){
    // Set firebase
    this.itemsRef = this.db.list(`booking-list`, ref => ref.orderByChild('year_month_day').equalTo(String(this.dateModel.year)+"_"+String(this.dateModel.month)+"_"+String(this.dateModel.day)));
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.items.subscribe(
      (data: BookingList[]) => {
        if(data.length > 0){
          setTimeout(() => this.dupStatus = true, 1000);
        } else {
          this.dataItem = {
            year: String(this.dateModel.year),
            month: this.paddingLeftNumber(this.dateModel.month),
            day: String(this.dateModel.day),
            year_month: String(this.dateModel.year)+"_"+(this.paddingLeftNumber(this.dateModel.month)),
            year_month_day: String(this.dateModel.year)+"_"+(this.paddingLeftNumber(this.dateModel.month))+"_"+String(this.dateModel.day),
            amount: 60,
            course: this.course,
            description: this.description
          };

          // Set firebase
          this.itemsRef = this.db.list(`booking-list`);
          this.itemsRef.push(this.dataItem).then((value) => {
            this.onResetUserForm();
            this.modalService.dismissAll();
          });
        }
    });

    // Hind alert
    this.hindAlertStatus();
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  onResetUserForm(){
    this.course = null;
    this.dateModel = null;
    this.description = null;
    this.dupStatus = null;
  }

  hindAlertStatus(){
    setTimeout(() => this.dupStatus = false, 3000);
  }

  removeBooking(booking: BookingList){
    this.itemsRef = this.db.list(`booking-list`);
    this.itemsRef.remove(booking.key).then((value) => {
      console.log(value);
    });
  }

  paddingLeftNumber(num: number): string{
    let result = "";
    if(num < 10){
      return "0"+String(num);
    } else {
      return String(num);
    }
  }

}
