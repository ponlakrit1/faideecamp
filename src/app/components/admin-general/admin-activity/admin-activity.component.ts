import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivityList } from './../../../data-model/activity.model';
import { v4 as uuidv4 } from 'uuid';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { ActivityService } from './../../../provider/activity.service';

declare var require: any
@Component({
  selector: 'app-admin-activity',
  templateUrl: './admin-activity.component.html',
  styleUrls: ['./admin-activity.component.scss']
})
export class AdminActivityComponent implements OnInit {

  @ViewChild('modalActivity', {static: true}) modalContent: TemplateRef<any>;
  @ViewChild('modalCompleted', {static: true}) modalCompleted: TemplateRef<any>;
  @ViewChild('modalConfirmDelete', {static: true}) modalConfirmDelete: TemplateRef<any>;

  page = 1;
  pageSize = 10;
  moment = require('moment');

  dataItem: ActivityList;

  dataDisplay: ActivityList[];
  dataSize: number = 0;

  title: string;
  path: string[] = [];
  submitted = false;
  public loading: boolean = false;

  selectedFile: File = null;
  task: AngularFireUploadTask;
  ref: AngularFireStorageReference;
  downloadURL: Observable<string>;

  constructor(private modalService: NgbModal, private storage: AngularFireStorage, private activityService: ActivityService) {
    this.addActPath();
  }

  ngOnInit() {
    this.initDataTable();
  }

  initDataTable(){
    this.activityService.getAllTakeOne().subscribe(
      (data: ActivityList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  removeAct(act: ActivityList){
    this.dataItem = act;

    this.openConfirmDeleteModal();
  }

  addInfoData(){
    this.submitted = true;
    if(this.title == null || this.title == ""){
      return;
    }

    this.path.pop();

    this.dataItem = {
      title: this.title,
      path: this.path
    };

    this.modalService.dismissAll();

    this.activityService.create(this.dataItem).then((value) => {
      this.openCompletedModal();
      this.initDataTable();
    });
  }

  deleteActivity(){
    this.modalService.dismissAll();
    
    // send to service
    this.activityService.delete(this.dataItem.id).then((value) => {
      this.openCompletedModal();
      this.initDataTable();
    });
  }

  openCompletedModal(): void {
    this.modalService.open(this.modalCompleted, { windowClass: 'w3-animate-top' });
  }

  openConfirmDeleteModal(): void {
    this.modalService.open(this.modalConfirmDelete, { windowClass: 'w3-animate-top' });
  }

  onResetForm(){
    this.title = null;
    this.path = [];

    this.modalService.dismissAll();
    this.addActPath();
  }

  addActPath(){
    this.path.push("");
  }

  upload(event){
    this.loading = true;

    try {
      this.selectedFile = event.target.files[0];

      const randomId = uuidv4();
      this.ref = this.storage.ref(randomId);
      this.ref.put(event.target.files[0]).snapshotChanges().pipe(
        finalize(() => {
          this.downloadURL = this.ref.getDownloadURL();
          this.downloadURL.subscribe(url => {
            if(url) {
              this.path[this.path.length - 1] = url;
              this.addActPath();
            }
            // console.log(this.urlTxt);
          });
        })
      ).subscribe(url => {
        if(url) {
          // console.log(url);
          this.loading = false;
          this.selectedFile = null;
        }
      });
    } catch(error) {
      console.log("เกิดข้อผิดพลาด จากการอัพโหลดรูป");
      this.loading = false;
      this.selectedFile = null;
    }
  }

}
