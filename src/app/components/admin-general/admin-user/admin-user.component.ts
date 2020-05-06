import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    this.userService.getAll().subscribe(
      (data: UserList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );

    this.initRegisterFormGroup();
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
            this.onResetUserForm();
          } else {
            // set data
            this.dataItem.username = this.username;
            this.dataItem.password = this.password;

            // send to service
            if(this.mode == "I"){
              this.userService.create(this.dataItem).then((value) => {
                this.presentAlertMessage("success", "บันทึกสำเร็จ !");
                this.onResetUserForm();
              });
            } else {
              this.userService.update(this.dataItem);
              this.presentAlertMessage("success", "อัพเดตสำเร็จ !");
              this.onResetUserForm();
            }
            
          }
        }
      );
    } else {
      this.presentAlertMessage("danger", "รหัสผ่านและยืนยันรหัสผ่านไม่เหมือนกัน !");
      this.modalService.dismissAll();
      this.onResetUserForm();
    }
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
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  removeUser(user: UserList){
    this.userService.delete(user.key);
    this.presentAlertMessage("success", "ลบผู้ใช้งานสำเร็จ !");
  }

  onEditUser(user: UserList){
    this.dataItem.key = user.key;
    this.username = user.username;
    this.password = user.password;

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
