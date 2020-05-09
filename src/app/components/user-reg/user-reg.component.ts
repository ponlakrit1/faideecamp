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
  public alertStatus: boolean;
  public alertTxt: string;
  public alertType: string;
  public loading: boolean = false;

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

  constructor(private modalService: NgbModal, 
              private db: AngularFireDatabase, 
              private formBuilder: FormBuilder, 
              private notJoinService: NotJoinService,
              private bookingService: BookingService,
              private schoolService: SchoolService) {
                
    this.dataDisplay = [];
    
    // get booking list
    this.bookingService.getByMonthAndYear(this.moment().format("MM/YYYY")).subscribe(
      (data: BookingList[]) => {
        this.dataDisplay = data;

        this.onRefreshEventCalendar();
      }
    );

    this.joinStatus = "Y";
    this.couseType = "1";
    this.amountStatus = false;
    this.schoolAmount = '30';
    this.notEnoughModalStatus = false;

    this.notJoinDetail = new NotJoinList();
    this.schoolDetail = new SchoolList();
  }

  ngOnInit() {
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
    // for (let ev of this.dataDisplay) {
    //   if(ev.day == String(this.eventSelected.start.getDate())){
    //     eventTemp = ev;
    //     // calculateAmount = eventTemp.amount - Number(this.schoolAmount);
    //     break;
    //   }
    // }

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
      // this.schoolDetail.year_month_day = eventTemp.year_month_day;
      // this.schoolDetail.amount = this.schoolAmount;
      // this.schoolDetail.year = eventTemp.year;
      // this.schoolDetail.course = eventTemp.course;

      this.itemsRef = this.db.list(`school-list`);
      this.itemsRef.push(this.schoolDetail).then((value) => {
        console.log("update school");

        // After update data
        this.onResetForm();
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
      result = "01/"+(year + 1);
    } else {
      if(monthTemp < 10){
        result = "0"+monthTemp+"/"+year;
      } else {
        result = monthTemp+"/"+year;
      }
    }

    return result;
  }

  onRefreshEventCalendar(){
    this.events = [];

    for(let temp of this.dataDisplay){
      let event: CalendarEvent;

      if(temp.course == this.couseType){
        let day = temp.eventDate.substring(0, 2); 
        let month = temp.eventDate.substring(3, 5);
        let year = temp.eventDate.substring(6, 10);

        if(temp.amount <= 0){
          event = {
            start: startOfDay(new Date(year+"-"+month+"-"+day)),
            title: `${temp.amount}`,
            cssClass: `${temp.key}`,
            color: colors.red
          };
        } else {
          event = {
            start: startOfDay(new Date(year+"-"+month+"-"+day)),
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
    this.joinStatus = 'Y';
    this.couseType = "1";
    this.schoolAmount = '30';
    this.notJoinCause = "";
    
    this.amountStatus = false;
    this.submitModal = false;
    this.submitted = false;

    this.schoolDetail = new SchoolList();
    this.modalService.dismissAll();
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
    
    this.notJoinService.create(this.notJoinDetail);
    this.presentAlertMessage("success", "บันทึกสำเร็จ !");
    this.onResetForm();
  }

  presentAlertMessage(type: string, txt: string){
    this.alertTxt = txt;
    this.alertType = type;
    this.alertStatus = true;

    setTimeout(() => this.alertStatus = false, 3000);
  }

}
