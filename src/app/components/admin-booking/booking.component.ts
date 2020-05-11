import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BookingList } from './../../data-model/booking.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from './../../provider/booking.service';

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

  // Table
  dataDisplay: BookingList[];
  dataSize: number = 0;
  dataItem: BookingList;

  // Variable
  public dateModel: NgbDateStruct;
  public searchYear: number;
  public alertStatus: boolean;
  public alertTxt: string;
  public alertType: string;
  public mode: string;

  // Form group
  bookingForm: FormGroup;
  submitted = false;

  constructor(private bookingService: BookingService, private modalService: NgbModal, private formBuilder: FormBuilder) {
    this.searchYear = this.moment().format("YYYY");
    this.mode = "I";

    this.dataItem = new BookingList();
  }

  ngOnInit() {
    this.searchByEventYear();
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

    let eventDate = (this.dateModel.day)+"/"+(this.dateModel.month)+"/"+(this.dateModel.year);
    let month_year = (this.dateModel.month)+"/"+(this.dateModel.year);
    let year = String(this.dateModel.year);

    this.bookingService.getByEventDate(eventDate).subscribe(
      (data: BookingList[]) => {
        if(data.length > 0){
          this.presentAlertMessage("warning", "วันที่จัดกิจกรรมซ้ำ !");
          this.onResetForm();
        } else {
          // this.dataItem = {
          //   amount: 60,
          //   course: this.course,
          //   description: this.description,
          //   year: String(this.dateModel.year),
          //   month_year: String(this.dateModel.month)+"/"+(String(this.dateModel.year)),
          //   eventDate: eventDate,
          // };

          this.dataItem.amount = 60;
          this.dataItem.year = year;
          this.dataItem.month_year = month_year;
          this.dataItem.eventDate = eventDate;

          this.bookingService.create(this.dataItem).then((value) => {
            this.presentAlertMessage("success", "บันทึกสำเร็จ !");
            this.onResetForm();
          });
        }
      }
    );
  }

  editBooking(){
    // stop here if form is invalid
    this.submitted = true;
    if (this.bookingForm.invalid) {
        return;
    }

    let eventDate = (this.dateModel.day)+"/"+(this.dateModel.month)+"/"+(this.dateModel.year);
    let month_year = (this.dateModel.month)+"/"+(this.dateModel.year);
    let year = String(this.dateModel.year);

    this.dataItem.year = year;
    this.dataItem.month_year = month_year;
    this.dataItem.eventDate = eventDate;

    this.bookingService.update(this.dataItem);
    this.presentAlertMessage("success", "อัพเดตสำเร็จ !");
    this.onResetForm();
  }

  openModal(): void {
    if(this.mode == "I"){
      this.dataItem.course = "1";
    }

    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  onResetForm(){
    this.mode = "I";
    this.dateModel = null;

    this.submitted = false;
    this.dataItem = new BookingList();
    this.modalService.dismissAll();
  }

  removeBooking(booking: BookingList){
    this.bookingService.delete(booking.key);
    this.presentAlertMessage("success", "ลบสำเร็จ !");
  }

  onEditBooking(booking: BookingList){
    this.mode = "U";

    this.dataItem = {
      key: booking.key,
      amount: booking.amount,
      course: booking.course,
      description: booking.description,
      year: booking.year,
      month_year: booking.month_year,
      eventDate: booking.eventDate,
    };

    var res = booking.eventDate.split("/");
    this.dateModel = {
      day: null,
      month: null,
      year: null
    };
    this.dateModel.day = Number(res[0]);
    this.dateModel.month = Number(res[1]);
    this.dateModel.year = Number(res[2]);

    this.openModal();
  }

  presentAlertMessage(type: string, txt: string){
    this.alertTxt = txt;
    this.alertType = type;
    this.alertStatus = true;

    setTimeout(() => this.alertStatus = false, 3000);
  }

  searchByEventYear(){
    this.bookingService.getByYear(String(this.searchYear)).subscribe(
      (data: BookingList[]) => {
        if(data.length > 0){
          this.dataDisplay = data;
          this.dataSize = data.length;
        } else {
          this.dataDisplay = [];
          this.dataSize = 0;
        }
      }
    );
  }

}
