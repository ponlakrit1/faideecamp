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
  @ViewChild('modalCompleted', {static: true}) modalCompleted: TemplateRef<any>;
  @ViewChild('modalConfirmDelete', {static: true}) modalConfirmDelete: TemplateRef<any>;

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
    let month = String(this.dateModel.month);
    let year = String(this.dateModel.year);

    this.bookingService.getByEventDate(eventDate).subscribe(
      (data: BookingList[]) => {
        if(data.length > 0){
          this.presentAlertMessage("danger", "วันที่จัดกิจกรรมซ้ำ !");
        } else {
          this.dataItem.amount = 60;
          this.dataItem.year = year;
          this.dataItem.month = month;
          this.dataItem.eventDate = eventDate;

          this.modalService.dismissAll();

          this.bookingService.create(this.dataItem).then((value) => {
            this.openCompletedModal();
            this.searchByEventYear();
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
    let month = String(this.dateModel.month);
    let year = String(this.dateModel.year);

    this.dataItem.year = year;
    this.dataItem.month = month;
    this.dataItem.eventDate = eventDate;

    this.modalService.dismissAll();

    this.bookingService.update(this.dataItem.id, this.dataItem).then((value) => {
      this.openCompletedModal();
      this.searchByEventYear();
    });
  }

  openModal(): void {
    if(this.mode == "I"){
      this.dataItem.course = "1";
    }

    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  openCompletedModal(): void {
    this.modalService.open(this.modalCompleted, { windowClass: 'w3-animate-top' });
  }

  openConfirmDeleteModal(): void {
    this.modalService.open(this.modalConfirmDelete, { windowClass: 'w3-animate-top' });
  }

  onResetForm(){
    this.mode = "I";
    this.dateModel = null;

    this.submitted = false;
    this.dataItem = new BookingList();
    this.modalService.dismissAll();
  }

  removeBooking(booking: BookingList){
    this.dataItem = booking;

    this.openConfirmDeleteModal();
  }

  deleteBooking(){
    this.modalService.dismissAll();
    
    // send to service
    this.bookingService.delete(this.dataItem.id).then((value) => {
      this.openCompletedModal();
      this.searchByEventYear();
    });
  }

  onEditBooking(booking: BookingList){
    this.mode = "U";
    this.dataItem = booking;

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
