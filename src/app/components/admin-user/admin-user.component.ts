import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserList } from './../../data-model/user.model';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss']
})
export class AdminUserComponent implements OnInit {

  @ViewChild('modalUserReg', {static: true}) modalContent: TemplateRef<any>;

  page = 1;
  pageSize = 10;

  dataItem: UserList;

  username: string;
  password: string;
  rePassword: string;
  alertStatus: boolean;
  dupStatus: boolean;

  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  dataDisplay: UserList[];
  dataSize: number = 0;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal) {
    // Set firebase
    this.itemsRefDisplay = this.db.list(`user-list`);
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.alertStatus = false;
    this.dupStatus = false;
  }

  ngOnInit() {
    this.itemsDisplay.subscribe(
      (data: UserList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  addUser(){
    if(this.password == this.rePassword){
      this.itemsRef = this.db.list(`user-list`, ref => ref.orderByChild('username').equalTo(this.username));
      this.items = this.itemsRef.snapshotChanges().pipe(
        map(changes => 
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      );

      this.items.subscribe(
        (data: UserList[]) => {
          if(data.length > 0){
            // For wait data
            setTimeout(() => this.dupStatus = true, 1000);
          } else {
            this.dataItem = {
              username: this.username,
              password: this.password,
              uid_pwd: this.username+"_"+this.password
            };

            this.itemsRef = this.db.list(`user-list`);
            this.itemsRef.push(this.dataItem).then((value) => {
              this.onResetUserForm();
              this.modalService.dismissAll();
            });
          }
        }
      );
      
    } else {
      this.alertStatus = true;
    }

    // Hind alert
    this.hindAlertStatus();
  }

  onResetUserForm(){
    this.username = null;
    this.password = null;
    this.rePassword = null;
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

  removeUser(user: UserList){
    this.itemsRef = this.db.list(`user-list`);
    this.itemsRef.remove(user.key).then((value) => {
      console.log(value);
    });
  }

  hindAlertStatus(){
    setTimeout(() => this.alertStatus = false, 3000);
    setTimeout(() => this.dupStatus = false, 3000);
  }

}
