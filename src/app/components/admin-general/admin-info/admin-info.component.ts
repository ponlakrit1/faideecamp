import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { InfoList } from './../../../data-model/info.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InfoService } from './../../../provider/info.service';
import { RichTextEditorComponent, CountService} from '@syncfusion/ej2-angular-richtexteditor';

declare var require: any
@Component({
  selector: 'app-admin-info',
  templateUrl: './admin-info.component.html',
  styleUrls: ['./admin-info.component.scss']
})
export class AdminInfoComponent implements OnInit {

  @ViewChild('alertMsg', null) rteObj: RichTextEditorComponent;
  @ViewChild('modalInfo', {static: true}) modalContent: TemplateRef<any>;
  @ViewChild('modalCompleted', {static: true}) modalCompleted: TemplateRef<any>;
  @ViewChild('modalConfirmDelete', {static: true}) modalConfirmDelete: TemplateRef<any>;

  page = 1;
  pageSize = 5;
  moment = require('moment');

  // Table
  public dataDisplay: InfoList[];
  public dataSize: number = 0;
  public dataItem: InfoList;

  // Variable
  public mode: string;
  public descriptionData: string;
  public loading: boolean = false;

  // Form group
  InfoForm: FormGroup;
  submitted = false;

  constructor(private infoService: InfoService, private modalService: NgbModal, private formBuilder: FormBuilder) {
    this.dataItem = new InfoList();
    this.mode = "I";
    this.descriptionData = "";
  }

  ngOnInit() {
    this.initDataTable();
    this.initInfoFormGroup();
  }

  initDataTable(){
    this.infoService.getAllTakeOne().subscribe(
      (data: InfoList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  initInfoFormGroup(){
    this.InfoForm = this.formBuilder.group({
      title: ['', Validators.required],
      desc: ['']
    });
  }

  get f() { return this.InfoForm.controls; }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top', size: 'xl' });
  }

  openCompletedModal(): void {
    this.modalService.open(this.modalCompleted, { windowClass: 'w3-animate-top' });
  }

  openConfirmDeleteModal(): void {
    this.modalService.open(this.modalConfirmDelete, { windowClass: 'w3-animate-top' });
  }

  removeInfo(info: InfoList){
    this.dataItem = info;

    this.openConfirmDeleteModal();
  }

  onEditInfo(info: InfoList){
    this.dataItem = info;

    // set temp value
    this.loading = true;
    setTimeout(() => 
      this.setDetailToModal(info.description)
      ,3000
    );

    this.mode = "U";
    this.openModal();
  }

  setDetailToModal(info: string){
    this.descriptionData = info;
    this.loading = false;
  }

  addInfoData(){
    // stop here if form is invalid
    this.submitted = true;
    if (this.InfoForm.invalid) {
      return;
    }

    this.dataItem.createDate = this.moment().format("D/MM/YYYY");
    this.dataItem.description = this.descriptionData;

    this.modalService.dismissAll();

    this.infoService.create(this.dataItem).then((value) => {
      this.openCompletedModal();
      this.initDataTable();
    });
  }

  updateInfoData(){
    // stop here if form is invalid
    this.submitted = true;
    if (this.InfoForm.invalid) {
      return;
    }

    this.dataItem.description = this.descriptionData;

    this.modalService.dismissAll();

    this.infoService.update(this.dataItem.id, this.dataItem).then((value) => {
      this.openCompletedModal();
      this.initDataTable();
    });
  }

  deleteUser(){
    this.modalService.dismissAll();
    
    // send to service
    this.infoService.delete(this.dataItem.id).then((value) => {
      this.openCompletedModal();
      this.initDataTable();
    });
  }

  onResetForm(){
    this.dataItem = new InfoList();
    this.mode = "I";
    this.descriptionData = "";
    
    this.submitted = false;
    this.InfoForm.reset();
    this.modalService.dismissAll();
  }

}
