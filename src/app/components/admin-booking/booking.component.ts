import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BookingList } from './../../data-model/booking.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var require: any
@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  @ViewChild('modalBooking', {static: true}) modalContent: TemplateRef<any>;
  @ViewChild('modalAddBookingComplted', {static: true}) modalCompleted: TemplateRef<any>;

  page = 1;
  pageSize = 10;
  moment = require('moment');

  // Firebase
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;

  // Table
  dataDisplay: BookingList[];
  dataSize: number = 0;
  dataItem: BookingList;

  // Variable
  course: string;
  dateModel: NgbDateStruct;
  description: string;
  dupStatus: boolean;

  // Form group
  bookingForm: FormGroup;
  submitted = false;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal, private formBuilder: FormBuilder) {
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

    this.initBookingFormGroup();
  }

  initBookingFormGroup(){
    this.bookingForm = this.formBuilder.group({
      couseType: [''],
      dateBooking: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  get f() { return this.bookingForm.controls; }

  addBooking(){
    // stop here if form is invalid
    this.submitted = true;
    if (this.bookingForm.invalid) {
        return;
    }

    // Set firebase
    this.itemsRef = this.db.list(`booking-list`, ref => ref.orderByChild('year_month_day').equalTo(String(this.dateModel.year)+"_"+this.paddingLeftNumber(this.dateModel.month)+"_"+String(this.dateModel.day)));
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

            this.openModalSuccess();
          });
        }
    });

    // Hind alert
    this.hindAlertStatus();
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  openModalSuccess(): void {
    this.modalService.open(this.modalCompleted, { windowClass: 'w3-animate-top' });
  }

  onResetUserForm(){
    this.course = "1";
    this.dateModel = null;
    this.description = null;
    this.dupStatus = null;
    this.submitted = false;
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
    if(num < 10){
      return "0"+String(num);
    } else {
      return String(num);
    }
  }

}
