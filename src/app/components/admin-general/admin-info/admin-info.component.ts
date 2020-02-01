import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { InfoList } from './../../../data-model/info.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

declare var require: any
@Component({
  selector: 'app-admin-info',
  templateUrl: './admin-info.component.html',
  styleUrls: ['./admin-info.component.scss']
})
export class AdminInfoComponent implements OnInit {

  @ViewChild('modalInfo', {static: true}) modalContent: TemplateRef<any>;
  @ViewChild('modalInfoComplted', {static: true}) modalCompleted: TemplateRef<any>;
  @ViewChild('modalInfoView', {static: true}) modalView: TemplateRef<any>;

  page = 1;
  pageSize = 10;
  moment = require('moment');

  // Firebase
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;

  // Table
  dataDisplay: InfoList[];
  dataSize: number = 0;
  dataItem: InfoList;

  // Variable
  title: string;
  desc: string;

  // Form group
  InfoForm: FormGroup;
  submitted = false;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal, private formBuilder: FormBuilder) {
    // Set firebase
    this.itemsRefDisplay = this.db.list(`info-list`);
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  ngOnInit() {
    this.itemsDisplay.subscribe(
      (data: InfoList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );

    this.initInfoFormGroup();
  }

  initInfoFormGroup(){
    this.InfoForm = this.formBuilder.group({
      title: ['', Validators.required],
      desc: ['', Validators.required]
    });
  }

  get f() { return this.InfoForm.controls; }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top', size: 'xl' });
  }

  openModalView(): void {
    this.modalService.open(this.modalView, { windowClass: 'w3-animate-top', size: 'xl' });
  }

  openModalSuccess(): void {
    this.modalService.open(this.modalCompleted, { windowClass: 'w3-animate-top' });
  }

  removeInfo(info: InfoList){
    this.itemsRef = this.db.list(`info-list`);
    this.itemsRef.remove(info.key).then((value) => {
      console.log(value);
    });
  }

  addInfoData(){
    // stop here if form is invalid
    this.submitted = true;
    if (this.InfoForm.invalid) {
        return;
    }

    this.dataItem = {
      title: this.title,
      description: this.desc,
      year_month_day: this.moment().format("DD/MM/YYYY")
    };

    // Set firebase
    this.itemsRef = this.db.list(`info-list`);
    this.itemsRef.push(this.dataItem).then((value) => {
      this.onResetUserForm();
      this.modalService.dismissAll();

      this.openModalSuccess();
    });
  }

  onResetUserForm(){
    this.title = null;
    this.desc = null;
    this.submitted = false;
  }

  onRowSelected(info: InfoList){
    this.dataItem = info;
    this.openModalView();
  }

}
