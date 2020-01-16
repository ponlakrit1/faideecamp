import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { SchoolList } from './../../data-model/school.model';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

declare var require: any
@Component({
  selector: 'app-admin-school',
  templateUrl: './admin-school.component.html',
  styleUrls: ['./admin-school.component.scss']
})
export class AdminSchoolComponent implements OnInit {

  @ViewChild('modalSchoolDetail', {static: true}) modalContent: TemplateRef<any>;

  page = 1;
  pageSize = 10;
  moment = require('moment');

  dataItem: SchoolList;

  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  dataDisplay: SchoolList[];
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  dataSize: number = 0;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal) {
    console.log(this.moment().format("YYYY"));
    

    // Set firebase
    this.itemsRefDisplay = this.db.list(`school-list`, ref => ref.orderByChild('year').equalTo(this.moment().format("YYYY")));
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  ngOnInit() {
    this.itemsDisplay.subscribe(
      (data: SchoolList[]) => {
        console.log(data);

        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  removeSchool(school: SchoolList){
  this.itemsRef = this.db.list(`school-list`);
    this.itemsRef.remove(school.key).then((value) => {
      console.log(value);
    });
  }

  onRowSelected(data: SchoolList){
    this.dataItem = data;
    this.openModal();
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

}
