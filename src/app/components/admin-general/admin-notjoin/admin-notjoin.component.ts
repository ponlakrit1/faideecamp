import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NotJoinList } from './../../../data-model/notjoin.model';
import { Observable } from 'rxjs';
import { NotJoinService } from './../../../provider/not-join.service';

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
  
  dataDisplay: NotJoinList[];
  dataSize: number = 0;

  constructor(private notJoinService: NotJoinService) {

  }

  ngOnInit() {
    this.notJoinService.getAll().subscribe(
      (data: NotJoinList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  removeNotjoin(notjoin: NotJoinList){
    this.notJoinService.delete(notjoin.key);
  }

}
