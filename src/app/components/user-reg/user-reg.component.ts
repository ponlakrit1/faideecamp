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

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  locale: string = 'th';
  moment = require('moment');

  joinStatus: string = "";
  couseType: string = "";
  amountStatus: boolean;
  notEnoughStatus: boolean;
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

  activeDayIsOpen: boolean = false;

  constructor(private modalService: NgbModal, private db: AngularFireDatabase) {
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
    this.schoolDetail.amount = '30';
    this.notEnoughStatus = false;
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
    // this.activeDayIsOpen = false;
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  onChangeAmountStatus(num: string): void {
    if(num == '99'){
      this.schoolDetail.amount = '';
      this.amountStatus = true;
    } else {
      this.amountStatus = false;
    }
  }

  saveBooking(){
    var eventTemp: BookingList;

    // Get bookingList from event(click)
    for (let ev of this.dataDisplay) {
      if(ev.day == String(this.eventSelected.start.getDate())){
        eventTemp = ev;
        eventTemp.amount = eventTemp.amount - Number(this.schoolDetail.amount);
        break;
      }
    }

    // Check student amount(Typing)
    if(eventTemp.amount > 0){

      // Init firebase
      this.itemsRef = this.db.list(`booking-list`, ref => ref.orderByChild('year_month_day').equalTo(this.moment(this.eventSelected.start).format('YYYY_MM_DD')));
      this.items = this.itemsRef.snapshotChanges().pipe(
        map(changes => 
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      );

      // Get firebase data
      this.items.subscribe(
        (data: BookingList[]) => {

            // Check student amount from DB
            if(data[0].amount > 0){
              if(eventTemp.school == null){
                eventTemp.school = [];
              }
              eventTemp.school.push(this.schoolDetail);

              this.itemsRef = this.db.list(`booking-list`);
              this.itemsRef.update(eventTemp.key, eventTemp).then((value) => {
                this.onResetUserForm();
                this.modalService.dismissAll();
              });
            } else {
              this.notEnoughStatus = true;
              setTimeout(() => this.notEnoughStatus = false, 3000);
              this.modalService.dismissAll();
            }
        }
      );
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

        // console.log(this.dataDisplay);

        for(let temp of this.dataDisplay){
          let event: CalendarEvent;

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

  }

}
