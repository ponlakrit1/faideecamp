import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, ViewEncapsulation } from '@angular/core';
import { startOfDay} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { BookingList } from './../../data-model/booking.model';
import { SchoolList } from './../../data-model/school.model';
import { NotJoinList } from './../../data-model/notjoin.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotJoinService } from './../../provider/not-join.service';
import { BookingService } from './../../provider/booking.service';
import { SchoolService } from './../../provider/school.service';

/*
  CalendarEvent :
    cssClass = key
    title = amount
*/

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  green: {
    primary: '#00b300',
    secondary: '#1aff1a'
  }
};

declare var require: any
@Component({
  selector: 'app-user-reg',
  templateUrl: './user-reg.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./user-reg.component.scss']
})
export class UserRegComponent implements OnInit {

  @ViewChild('modalRegContent', {static: true}) modalContent: TemplateRef<any>;

  // Calendar
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  locale: string = 'th';
  moment = require('moment');

  // Calendar event
  eventSelected: CalendarEvent;
  events: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();

  // Variable
  public joinStatus: string = "";
  public notJoinCause: string = "";
  public amountStatus: boolean;
  public alertStatus: boolean;
  public alertTxt: string;
  public alertType: string;
  public loading: boolean = false;
  public alertModalStatus: boolean;
  public alertSaveStatus: boolean;

  // Modal
  notEnoughModalStatus: boolean;
  modalTxt: string;

  // Object
  dataDisplay: BookingList[];
  schoolDetail: SchoolList;
  notJoinDetail: NotJoinList;

  // Form group
  schoolBookingForm: FormGroup;
  notJoinForm: FormGroup;
  submitted = false;
  submitModal = false;

  constructor(private modalService: NgbModal,
              private formBuilder: FormBuilder, 
              private notJoinService: NotJoinService,
              private bookingService: BookingService,
              private schoolService: SchoolService) {
                
    this.dataDisplay = [];
    
    // get booking list
    this.closeOpenMonthViewDay();

    this.joinStatus = "Y";
    this.amountStatus = false;

    this.notJoinDetail = new NotJoinList();
    this.schoolDetail = new SchoolList();
  }

  ngOnInit() {
    this.schoolDetail.course = "1";
    this.schoolDetail.amount = "30";
    this.schoolDetail.acceptCont = "y";

    this.initSchoolFormGroup();
    this.initNotJoinFormGroup();
  }

  initSchoolFormGroup(){
    this.schoolBookingForm = this.formBuilder.group({
      schoolName: ['', Validators.required],
      schoolLocation: ['', Validators.required],
      schoolemail: ['', [Validators.required, Validators.email]],
      schoolTel: ['', Validators.required],
      teacherMainName: ['', Validators.required],
      teacherMainTel: ['', Validators.required],
      teacherMainLine: ['', Validators.required],
      teacherSubName: ['', Validators.required],
      teacherSubTel: ['', Validators.required],
      teacherSubLine: ['', Validators.required],
      schoolAmount1: [''],
      area: ['', Validators.required],
      acceptCont: ['', Validators.required],
    });
  }

  initNotJoinFormGroup(){
    this.notJoinForm = this.formBuilder.group({
      schoolName1: ['', Validators.required],
      joinStatus: [''],
      couseType: [''],
      notJoinCause: ['', Validators.required]
    });
  }

  get f() { return this.schoolBookingForm.controls; }

  get j() { return this.notJoinForm.controls; }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }) {
    let eventTitle = "";
    let bookingKey = "";

    if(events.length > 0 && events[0].color.primary != '#ad2121'){
      for (let ev of events) {
        eventTitle = ev.title;
        bookingKey = ev.cssClass;
      }
  
      this.eventSelected = {
        start: date,
        title: eventTitle
      }
  
      // fetch data
      this.checkBookingAmount(date);
      this.openModal();
    } else {
      console.log("No booking events");
    }
    
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.bookingService.getByMonthAndYear(this.paddingLeftNumber(this.viewDate.getFullYear(), this.viewDate.getMonth())).subscribe(
      (data: BookingList[]) => {
        this.dataDisplay = data;

        this.onRefreshEventCalendar();
      }
    );
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  onChangeAmountStatus(num: string): void {
    if(num == '99'){
      this.schoolDetail.amount = "";
      this.amountStatus = true;
    } else {
      this.amountStatus = false;
    }
  }

  saveBooking(){
    // stop here if form is invalid
    // this.submitModal = true;
    // if (this.schoolBookingForm.invalid) {
    //     return;
    // }

    var eventTemp: BookingList;
    var calculateAmount: number = 0;

    // Get bookingList from event(click)
    for (let ev of this.dataDisplay) {
      var res = ev.eventDate.split("/");
      if(res[0] == String(this.eventSelected.start.getDate())){
        eventTemp = ev;
        break;
      }
    }

    // get amount by eventDate
    this.bookingService.getByEventDate(eventTemp.eventDate).subscribe(
      (data: BookingList[]) => {
        if(data.length > 0){
          // set new amount
          calculateAmount = Number(data[0].amount) - Number(this.schoolDetail.amount);
          // console.log(calculateAmount);

          if(calculateAmount >= 0){
            eventTemp.amount = calculateAmount;
            this.bookingService.update(eventTemp);

            this.schoolDetail.eventDate = eventTemp.eventDate;
            this.schoolDetail.year = eventTemp.year;

            this.schoolService.create(this.schoolDetail);
            // this.presentAlertMessage("success", "บันทึกสำเร็จ !");
            this.presentAlertSaveMessage();
            this.onResetForm();
          } else {
            this.presentAlertModalMessage();
          }

          this.onRefreshEventCalendar();
        }
      }
    );
  }

  checkBookingAmount(key: Date){
    this.bookingService.getByEventDate(this.moment(key).format("D/M/YYYY")).subscribe(
      (data: BookingList[]) => {
        if(data.length > 0){
          // set new amount
          this.eventSelected.title = String(data[0].amount);
        }
      }
    );
  }

  paddingLeftNumber(year: number, month: number): string{
    let result = "";
    let monthTemp = month + 1;

    if(monthTemp >= 13){
      result = "1/"+(year + 1);
    } else {
      result = monthTemp+"/"+year;
    }

    return result;
  }

  onRefreshEventCalendar(){
    this.events = [];

    for(let temp of this.dataDisplay){
      let event: CalendarEvent;

      if(temp.course == this.schoolDetail.course){
        var res = temp.eventDate.split("/");

        if(temp.amount <= 0){
          event = {
            start: startOfDay(new Date(res[2]+"-"+res[1]+"-"+res[0])),
            title: `${temp.amount}`,
            cssClass: `${temp.key}`,
            color: colors.red
          };
        } else {
          event = {
            start: startOfDay(new Date(res[2]+"-"+res[1]+"-"+res[0])),
            title: `${temp.amount}`,
            cssClass: `${temp.key}`,
            color: colors.green
          };
        }
      }

      // Check event is not null
      if(event != null){
        this.events.push(event);
      }
    }

    this.refresh.next();
  }

  onResetForm(){
    this.schoolDetail = new SchoolList();
    this.amountStatus = false;
    this.submitModal = false;
    this.schoolDetail.course = "1";
    this.schoolDetail.amount = "30";
    this.schoolDetail.acceptCont = "y";
    
    this.modalService.dismissAll();
    window.scroll(0,0);
  }

  saveNotJoin(){
    // stop here if form is invalid
    this.submitted = true;
    if (this.notJoinForm.invalid) {
      return;
    }

    this.notJoinDetail = {
      school: this.schoolDetail.name,
      cause: this.notJoinCause,
      createDate: this.moment().format("D/M/YYYY")
    }
    
    // service
    this.notJoinService.create(this.notJoinDetail);
    this.presentAlertMessage("success", "บันทึกสำเร็จ !");
    this.joinStatus = "Y";
    this.notJoinCause = "";
    this.submitted = false;
    this.schoolDetail.name = "";
  }

  presentAlertMessage(type: string, txt: string){
    this.alertTxt = txt;
    this.alertType = type;
    this.alertStatus = true;

    setTimeout(() => this.alertStatus = false, 3000);
  }

  presentAlertModalMessage(){
    this.alertModalStatus = true;

    setTimeout(() => this.alertModalStatus = false, 3000);
  }

  presentAlertSaveMessage(){
    this.alertSaveStatus = true;

    setTimeout(() => this.alertSaveStatus = false, 3000);
  }

}
