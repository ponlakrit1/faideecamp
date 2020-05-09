import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { SchoolList } from './../../data-model/school.model';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BookingList } from './../../data-model/booking.model';
import 'rxjs/add/operator/toPromise';

declare var require: any
@Component({
  selector: 'app-admin-school',
  templateUrl: './admin-school.component.html',
  styleUrls: ['./admin-school.component.scss']
})
export class AdminSchoolComponent implements OnInit {

  @ViewChild('modalSchoolDetail', {static: true}) modalContent: TemplateRef<any>;
  @ViewChild('modalComfirmRemoveSchool', {static: true}) modalRemove: TemplateRef<any>;

  page = 1;
  pageSize = 10;
  moment = require('moment');

  dataItem: SchoolList;
  bookingKey: BookingList;

  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  dataDisplay: SchoolList[];
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  dataSize: number = 0;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal) {
    // Set firebase
    this.itemsRefDisplay = this.db.list(`school-list`, ref => ref.orderByChild('year').equalTo(this.moment().format("YYYY")));
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  ngOnInit() {
    this.itemsDisplay.subscribe(
      (data: SchoolList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  removeSchool(){
    console.log("begin removeSchool()");

    // calculate
    this.bookingKey.amount = Number(this.bookingKey.amount) + Number(this.dataItem.amount);

    // update booking
    this.itemsRef = this.db.list(`booking-list`);
    this.itemsRef.update(this.bookingKey.key, this.bookingKey).then((value) => {
      console.log(value);
    });

    // update school
    this.itemsRef = this.db.list(`school-list`);
    this.itemsRef.remove(this.dataItem.key).then((value) => {
      console.log(value);
    });

    this.modalService.dismissAll();
  }

  async findBookingList(key: string){
    console.log("begin findBookingList()"+key);

    // find booking
    this.itemsRef = this.db.list(`booking-list`, ref => ref.orderByChild('year_month_day').equalTo(key));
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.items.subscribe(
      (data: BookingList[]) => {
        if(data.length > 0){
          this.bookingKey = data[0];
          console.log(this.bookingKey);
        }
      }
    );
  }

  onRowSelected(data: SchoolList){
    this.dataItem = data;
    this.openModal();
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top', size: 'lg' });
  }

  openModalRemove(school: SchoolList): void {
    this.dataItem = school;
    this.findBookingList(school.eventDate);

    this.modalService.open(this.modalRemove, { windowClass: 'w3-animate-top' });
  }

}
