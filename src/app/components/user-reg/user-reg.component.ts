import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, ViewEncapsulation } from '@angular/core';
import { startOfDay} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { BookingList } from './../../data-model/booking.model';
import { SchoolList } from './../../data-model/school.model';
import { NotJoinList } from './../../data-model/notjoin.model';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  @ViewChild('modalBookingComplted', {static: true}) modalSuccess: TemplateRef<any>;

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
  joinStatus: string = "";
  couseType: string = "";
  notJoinCause: string = "";
  schoolAmount: string;
  amountStatus: boolean;

  // Modal
  notEnoughModalStatus: boolean;
  modalTxt: string;

  // Firebase
  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;

  // Object
  dataDisplay: BookingList[];
  schoolDetail: SchoolList;
  notJoinDetail: NotJoinList;

  // Form group
  schoolBookingForm: FormGroup;
  notJoinForm: FormGroup;
  submitted = false;
  submitModal = false;

  constructor(private modalService: NgbModal, private db: AngularFireDatabase, private formBuilder: FormBuilder) {
    // Set firebase
    this.itemsRefDisplay = this.db.list(`booking-list`, ref => ref.orderByChild('year_month').equalTo(this.moment().format("YYYY_MM")));
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.joinStatus = "Y";
    this.couseType = "1";
    this.schoolDetail = new SchoolList();
    this.amountStatus = false;
    this.schoolAmount = '30';
    this.notEnoughModalStatus = false;
  }

  ngOnInit() {
    this.onRefreshEventCalendar();
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
      schoolAmount1: ['', Validators.required]
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
      this.checkBookingAmount(bookingKey);
      this.openModal();
    } else {
      console.log("No booking events");
    }
    
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.itemsRefDisplay = this.db.list(`booking-list`, ref => ref.orderByChild('year_month').equalTo(this.paddingLeftNumber(this.viewDate.getFullYear(), this.viewDate.getMonth())));
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.onRefreshEventCalendar();
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  openModalSuccess(): void {
    this.modalService.open(this.modalSuccess, { windowClass: 'w3-animate-top' });
  }

  onChangeAmountStatus(num: string): void {
    if(num == '99'){
      this.schoolAmount = '';
      this.amountStatus = true;
    } else {
      this.amountStatus = false;
    }
  }

  saveBooking(){
    // stop here if form is invalid
    this.submitModal = true;
    if (this.schoolBookingForm.invalid) {
        return;
    }

    var eventTemp: BookingList;
    var calculateAmount: number = 0;

    // Get bookingList from event(click)
    for (let ev of this.dataDisplay) {
      if(ev.day == String(this.eventSelected.start.getDate())){
        eventTemp = ev;
        // calculateAmount = eventTemp.amount - Number(this.schoolAmount);
        break;
      }
    }

    // calculate amount
    calculateAmount = Number(this.eventSelected.title) - Number(this.schoolAmount);

    // Check student amount(Typing) - amount
    if(calculateAmount >= 0){
      eventTemp.amount = calculateAmount;

      this.itemsRef = this.db.list(`booking-list`);
      this.itemsRef.update(eventTemp.key, eventTemp).then((value) => {
        console.log("update booking");
      });

      // Set school obj
      this.schoolDetail.year_month_day = eventTemp.year_month_day;
      this.schoolDetail.amount = this.schoolAmount;
      this.schoolDetail.year = eventTemp.year;
      this.schoolDetail.course = eventTemp.course;

      this.itemsRef = this.db.list(`school-list`);
      this.itemsRef.push(this.schoolDetail).then((value) => {
        console.log("update school");

        // After update data
        this.onResetUserForm();
        this.modalService.dismissAll();
        this.openModalSuccess();
      });

    } else {
      this.submitted = false;
      this.notEnoughModalStatus = true;
      setTimeout(() => this.notEnoughModalStatus = false, 3000);
    }

    this.onRefreshEventCalendar();
  }

  async checkBookingAmount(key: string){
    this.itemsRef = this.db.list(`booking-list`, ref => ref.orderByChild('key').equalTo(key));
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    // get item
    await this.items.subscribe(
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
      result = (year + 1)+"_01";
    } else {
      if(monthTemp < 10){
        result = year+"_0"+monthTemp;
      } else {
        result = year+"_"+monthTemp;
      }
    }

    return result;
  }

  onRefreshEventCalendar(){
    this.events = [];

    this.itemsDisplay.subscribe(
      (data: BookingList[]) => {
        this.dataDisplay = data;

        for(let temp of this.dataDisplay){
          let event: CalendarEvent;

          if(temp.course == this.couseType){
            if(temp.amount <= 0){
              event = {
                start: startOfDay(new Date(temp.year+"-"+temp.month+"-"+temp.day)),
                title: `${temp.amount}`,
                cssClass: `${temp.key}`,
                color: colors.red
              };
            } else {
              event = {
                start: startOfDay(new Date(temp.year+"-"+temp.month+"-"+temp.day)),
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
    );
  }

  onResetUserForm(){
    this.couseType = "1";
    this.schoolAmount = '30';
    this.notJoinCause = "";
    this.amountStatus = false;
    this.submitModal = false;
    this.submitted = false;
    this.schoolDetail = new SchoolList();
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
      createDate: this.moment().format("DD/MM/YYYY")
    }
    
    this.itemsRef = this.db.list(`notjoin-list`);
    this.itemsRef.push(this.notJoinDetail).then((value) => {
      // After update data
      this.onResetUserForm();
      this.modalService.dismissAll();
      this.openModalSuccess();
    });
  }

  closeModal(){
    this.modalService.dismissAll();
    this.onResetUserForm();
  }

}
