import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

interface UserList {
  id?: number;
  key: string;
  username: string;
  password: string;
}

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.scss']
})
export class AdminUserComponent implements OnInit {

  @ViewChild('modalUserReg', {static: true}) modalContent: TemplateRef<any>;

  page = 1;
  pageSize = 10;

  username: string;
  password: string;
  rePassword: string;
  alertStatus: boolean;
  dupStatus: boolean;

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  itemsRefCheck: AngularFireList<any>;
  itemsCheck: Observable<any[]>;
  dataDisplay: UserList[];
  dataSize: number = 0;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal) {
    // Set firebase
    this.itemsRef = this.db.list(`user-list`);
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.alertStatus = false;
    this.dupStatus = false;
  }

  ngOnInit() {
    this.items.subscribe(
      (data: UserList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  addUser(){
    // Set firebase
    this.itemsRefCheck = this.db.list(`user-list`, ref => ref.orderByChild('username').equalTo(this.username));
    this.itemsCheck = this.itemsRefCheck.snapshotChanges().pipe(
        map(changes => 
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
    );
    
    this.itemsCheck.subscribe(
      (data: UserList[]) => {
        if(data.length == 0){
          var userObj = {
            username: this.username,
            password: this.password,
          }
      
          if(this.password == this.rePassword){
            this.itemsRef.push(userObj).then((value) => {
              this.onResetUserForm();
              this.modalService.dismissAll();
            });
          } else {
            this.alertStatus = true;
          }
        } else {
          this.dupStatus = true;
        }
      }
    );
    
  }

  onResetUserForm(){
    this.username = null;
    this.password = null;
    this.rePassword = null;
  }

  openModal(): void {
    this.modalService.open(this.modalContent);
  }

  removeUser(user: UserList){
    this.itemsRef.remove(`user-list/${user.key}`).then((value) => {
      // action
    });
  }

}
