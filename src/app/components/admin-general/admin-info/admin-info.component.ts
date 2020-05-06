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

  page = 1;
  pageSize = 10;
  moment = require('moment');

  // Table
  public dataDisplay: InfoList[];
  public dataSize: number = 0;
  public dataItem: InfoList;

  // Variable
  public alertStatus: boolean;
  public alertTxt: string;
  public alertType: string;
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
    this.infoService.getAll().subscribe(
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
      desc: ['']
    });
  }

  get f() { return this.InfoForm.controls; }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top', size: 'xl' });
  }

  removeInfo(info: InfoList){
    this.infoService.delete(info.key);
    this.presentAlertMessage("success", "ลบกิจกรรมสำเร็จ !");
  }

  onEditInfo(info: InfoList){
    this.dataItem = {
      key: info.key,
      title: info.title,
      description: info.description,
      createDate: info.createDate
    }

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

    this.dataItem.createDate = this.moment().format("DD/MM/YYYY");
    this.dataItem.description = this.descriptionData;

    if(this.mode == "I"){
      this.infoService.create(this.dataItem).then((value) => {
        this.presentAlertMessage("success", "บันทึกสำเร็จ !");
        this.onResetForm();
      });
    } else {
      this.infoService.update(this.dataItem);
      this.presentAlertMessage("success", "อัพเดตสำเร็จ !");
      this.onResetForm();
    }
    
  }

  onResetForm(){
    this.dataItem = new InfoList();
    this.mode = "I";
    this.descriptionData = "";
    
    this.submitted = false;
    this.InfoForm.reset();
    this.modalService.dismissAll();
  }

  presentAlertMessage(type: string, txt: string){
    this.alertTxt = txt;
    this.alertType = type;
    this.alertStatus = true;

    setTimeout(() => this.alertStatus = false, 3000);
  }

}
