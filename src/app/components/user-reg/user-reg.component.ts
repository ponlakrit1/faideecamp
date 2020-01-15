import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, ViewEncapsulation } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { BookingList } from './../../data-model/booking.model';
import { SchoolList } from './../../data-model/school.model';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from "@angular/router";

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

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  locale: string = 'th';
  moment = require('moment');

  joinStatus: string = "";
  couseType: string = "";
  schoolAmount: string;
  amountStatus: boolean;
  notEnoughModalStatus: boolean;

  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;

  dataDisplay: BookingList[];
  schoolDetail: SchoolList;

  eventSelected: CalendarEvent;
  events: CalendarEvent[] = [];
  refresh: Subject<any> = new Subject();

  constructor(private modalService: NgbModal, private db: AngularFireDatabase, private router: Router) {
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
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    let eventTitle = "";

    if(events.length > 0){
      for (let ev of events) {
        eventTitle = ev.title;
      }
  
      this.eventSelected = {
        start: date,
        title: eventTitle
      }
  
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
    var eventTemp: BookingList;
    var calculateAmount = 0;

    // Get bookingList from event(click)
    for (let ev of this.dataDisplay) {
      if(ev.day == String(this.eventSelected.start.getDate())){
        eventTemp = ev;
        calculateAmount = eventTemp.amount - Number(this.schoolAmount);
        break;
      }
    }

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

      this.itemsRef = this.db.list(`school-list`);
      this.itemsRef.push(this.schoolDetail).then((value) => {
        console.log("update school");
      });

      // After update data
      this.onResetUserForm();
      this.modalService.dismissAll();
      this.openModalSuccess();

    } else {
      this.notEnoughModalStatus = true;
      setTimeout(() => this.notEnoughModalStatus = false, 3000);
    }
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
                color: colors.red
              };
            } else {
              event = {
                start: startOfDay(new Date(temp.year+"-"+temp.month+"-"+temp.day)),
                title: `${temp.amount}`,
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
    this.amountStatus = false;
    this.schoolDetail = new SchoolList();
  }

}
