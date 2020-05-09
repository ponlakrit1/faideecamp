import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { SchoolList } from './../../data-model/school.model';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BookingList } from './../../data-model/booking.model';
import { SchoolService } from './../../provider/school.service';
import { BookingService } from './../../provider/booking.service';

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

  dataDisplay: SchoolList[];
  dataSize: number = 0;

  private searchYear: number;

  constructor(private modalService: NgbModal, private schoolService: SchoolService, private bookingService: BookingService) {
    this.searchYear = this.moment().format("YYYY");
  }

  ngOnInit() {
    this.searchByEventYear();
  }

  removeSchool(){
    this.bookingService.getByEventDate(this.dataItem.eventDate).subscribe(
      (data: BookingList[]) => {
        if(data.length > 0){
          this.bookingKey = data[0];

          // calculate
          this.bookingKey.amount = Number(this.bookingKey.amount) + Number(this.dataItem.amount);

          this.bookingService.update(this.bookingKey);
          this.schoolService.delete(this.dataItem.key);
        }

        this.modalService.dismissAll();
      }
    );
  }

  onViewSchool(data: SchoolList){
    this.dataItem = data;
    this.openModal();
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top', size: 'lg' });
  }

  openModalRemove(school: SchoolList): void {
    this.dataItem = school;

    this.modalService.open(this.modalRemove, { windowClass: 'w3-animate-top' });
  }

  searchByEventYear(){
    this.schoolService.getByYear(String(this.searchYear)).subscribe(
      (data: SchoolList[]) => {
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
