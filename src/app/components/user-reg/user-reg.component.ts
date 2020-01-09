import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, ViewEncapsulation } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';

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

  joinStatus: string = "";
  studentAmount: string = "";

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
    {
      start: startOfDay(new Date()),
      title: 'โรงเรียนทดสอบ',
      color: colors.red
    }
  ];

  activeDayIsOpen: boolean = false;

  constructor(private modalService: NgbModal) {
    this.joinStatus = "Y";
    this.studentAmount = "30";
  }

  ngOnInit() {}

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    let status = false;

    for (let ev of events) {
      if(ev.color == colors.red){
        status = true;
      }
    }

    if (isSameMonth(date, this.viewDate)) {
      if(events.length === 0 || status == false){
        this.openModal();
      } else {
        this.activeDayIsOpen == true ? this.activeDayIsOpen = false : this.activeDayIsOpen = true;
      }
    }
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

}
