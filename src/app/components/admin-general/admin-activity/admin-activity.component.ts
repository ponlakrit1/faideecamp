import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ActivityList } from './../../../data-model/activity.model';

declare var require: any
@Component({
  selector: 'app-admin-activity',
  templateUrl: './admin-activity.component.html',
  styleUrls: ['./admin-activity.component.scss']
})
export class AdminActivityComponent implements OnInit {

  @ViewChild('modalActivity', {static: true}) modalContent: TemplateRef<any>;
  @ViewChild('modalActivityComplted', {static: true}) modalCompleted: TemplateRef<any>;

  page = 1;
  pageSize = 10;
  moment = require('moment');

  dataItem: ActivityList;

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  dataDisplay: ActivityList[];
  dataSize: number = 0;

  title: string;
  path: string[] = [];

  constructor(private db: AngularFireDatabase, private modalService: NgbModal) {
    // Set firebase
    this.itemsRefDisplay = this.db.list(`activity-list`);
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.addActPath();
  }

  ngOnInit() {
    this.itemsDisplay.subscribe(
      (data: ActivityList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  openModalSuccess(): void {
    this.modalService.open(this.modalCompleted, { windowClass: 'w3-animate-top' });
  }

  removeAct(act: ActivityList){
    this.itemsRef = this.db.list(`activity-list`);
    this.itemsRef.remove(act.key).then((value) => {
      console.log(value);
    });
  }

  addInfoData(){
    this.dataItem = {
      title: this.title,
      path: this.path
    };

    // Set firebase
    this.itemsRef = this.db.list(`activity-list`);
    this.itemsRef.push(this.dataItem).then((value) => {
      this.onResetUserForm();
      this.modalService.dismissAll();

      this.openModalSuccess();
    });
  }

  onResetUserForm(){
    this.title = null;
    this.path = [];

    this.addActPath();
  }

  addActPath(){
    this.path.push("");
  }

  closeModal(){
    this.modalService.dismissAll();
    this.onResetUserForm();
  }

  removeActPath(i: number){
    this.path.splice(i, 1);
  }

}
