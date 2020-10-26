import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NotJoinList } from './../../../data-model/notjoin.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotJoinService } from './../../../provider/not-join.service';

declare var require: any
@Component({
  selector: 'app-admin-notjoin',
  templateUrl: './admin-notjoin.component.html',
  styleUrls: ['./admin-notjoin.component.scss']
})
export class AdminNotjoinComponent implements OnInit {

  @ViewChild('modalCompleted', {static: true}) modalCompleted: TemplateRef<any>;
  @ViewChild('modalConfirmDelete', {static: true}) modalConfirmDelete: TemplateRef<any>;

  page = 1;
  pageSize = 10;
  moment = require('moment');
  
  public dataDisplay: NotJoinList[];
  public dataSize: number = 0;
  public dataItem: NotJoinList;

  constructor(private notJoinService: NotJoinService, private modalService: NgbModal) {

  }

  ngOnInit() {
    this.initDataTable();
  }

  initDataTable(){
    this.notJoinService.getAllTakeOne().subscribe(
      (data: NotJoinList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  removeNotjoin(){
    this.modalService.dismissAll();
    
    this.notJoinService.delete(this.dataItem.id).then((value) => {
      this.openCompletedModal();
      this.initDataTable();
    });
  }

  openCompletedModal(): void {
    this.modalService.open(this.modalCompleted, { windowClass: 'w3-animate-top' });
  }

  openConfirmDeleteModal(notjoin: NotJoinList): void {
    this.dataItem = notjoin;

    this.modalService.open(this.modalConfirmDelete, { windowClass: 'w3-animate-top' });
  }

}
