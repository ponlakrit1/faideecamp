import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NotJoinList } from './../../../data-model/notjoin.model';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

declare var require: any
@Component({
  selector: 'app-admin-notjoin',
  templateUrl: './admin-notjoin.component.html',
  styleUrls: ['./admin-notjoin.component.scss']
})
export class AdminNotjoinComponent implements OnInit {

  page = 1;
  pageSize = 10;
  moment = require('moment');

  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  dataDisplay: NotJoinList[];
  dataSize: number = 0;

  constructor(private db: AngularFireDatabase) {
    this.itemsRefDisplay = this.db.list(`notjoin-list`, ref => ref.orderByChild('year').equalTo(this.moment().format("YYYY")));
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  ngOnInit() {
    this.itemsDisplay.subscribe(
      (data: NotJoinList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  removeNotjoin(notjoin: NotJoinList){
    this.itemsRef = this.db.list(`notjoin-list`);
    this.itemsRef.remove(notjoin.key).then((value) => {
      console.log(value);
    });
  }

}
