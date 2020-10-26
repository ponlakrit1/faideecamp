import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserList } from '../../../data-model/user.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from './../../../provider/user.service';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss']
})
export class AdminUserComponent implements OnInit {

  @ViewChild('modalUserReg', {static: true}) modalContent: TemplateRef<any>;
  @ViewChild('modalCompleted', {static: true}) modalCompleted: TemplateRef<any>;
  @ViewChild('modalConfirmDelete', {static: true}) modalConfirmDelete: TemplateRef<any>;

  public page = 1;
  public pageSize = 10;

  // Variable
  public username: string;
  public password: string;
  public rePassword: string;
  public alertStatus: boolean;
  public alertTxt: string;
  public alertType: string;
  public mode: string;

  // Table
  public dataDisplay: UserList[];
  public dataSize: number = 0;
  public dataItem: UserList;

  // Form group
  public userRegisterForm: FormGroup;
  public submitted = false;

  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private userService: UserService) {
    this.alertStatus = false;
    this.dataItem = new UserList();
    this.mode = "I";
  }

  ngOnInit() {
    this.initDataTable();
    this.initRegisterFormGroup();
  }

  initDataTable(){
    this.userService.getAllTakeOne().subscribe(
      (data: UserList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  initRegisterFormGroup(){
    this.userRegisterForm = this.formBuilder.group({
      uid: ['', Validators.required],
      pwd1: ['', Validators.required],
      pwd2: ['', Validators.required]
    });
  }

  get f() { return this.userRegisterForm.controls; }

  addUser(){
    // stop here if form is invalid
    this.submitted = true;
    if (this.userRegisterForm.invalid) {
        return;
    }

    if(this.password == this.rePassword){
      this.userService.getByUsername(this.username).subscribe(
        (data: UserList[]) => {
          if(data.length > 0 && this.mode == "I"){
            this.presentAlertMessage("danger", "ชื่อผู้ใช้งานซ้ำ !");
          } else {
            // set data
            this.dataItem.username = this.username;
            this.dataItem.password = this.password;

            this.modalService.dismissAll();

            // send to service
            this.userService.create(this.dataItem).then((value) => {
              this.openCompletedModal();
              this.initDataTable();
            });
          }
        }
      );
    } else {
      this.presentAlertMessage("danger", "รหัสผ่านและยืนยันรหัสผ่านไม่เหมือนกัน !");
    }
  }

  updateUser(){
    // stop here if form is invalid
    this.submitted = true;
    if (this.userRegisterForm.invalid) {
      return;
    }

    if(this.password == this.rePassword){
      // set data
      this.dataItem.username = this.username;
      this.dataItem.password = this.password;

      this.modalService.dismissAll();

      // send to service
      this.userService.update(this.dataItem.id, this.dataItem).then((value) => {
        this.openCompletedModal();
        this.initDataTable();
      });
    } else {
      this.presentAlertMessage("danger", "รหัสผ่านและยืนยันรหัสผ่านไม่เหมือนกัน !");
    }
  }

  deleteUser(){
    this.modalService.dismissAll();
    
    // send to service
    this.userService.delete(this.dataItem.id).then((value) => {
      this.openCompletedModal();
      this.initDataTable();
    });
  }

  onResetUserForm(){
    this.username = null;
    this.password = null;
    this.rePassword = null;
    this.mode = "I";
    this.dataItem = new UserList();

    this.userRegisterForm.reset();
    this.submitted = false;
    this.modalService.dismissAll();
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' }).result.then((reason) => {
      this.onResetUserForm();
    }, (reason) => {
      this.onResetUserForm();
    });
  }

  openCompletedModal(): void {
    this.modalService.open(this.modalCompleted, { windowClass: 'w3-animate-top' });
  }

  openConfirmDeleteModal(): void {
    this.modalService.open(this.modalConfirmDelete, { windowClass: 'w3-animate-top' });
  }

  removeUser(user: UserList){
    this.dataItem = user;

    this.openConfirmDeleteModal();
  }

  onEditUser(user: UserList){
    this.username = user.username;
    this.dataItem = user;

    this.mode = "U";
    this.openModal();
  }

  presentAlertMessage(type: string, txt: string){
    this.alertTxt = txt;
    this.alertType = type;
    this.alertStatus = true;

    setTimeout(() => this.alertStatus = false, 3000);
  }

}
