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

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
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
  }

  ngOnInit() {
  }

  get userList(): UserList[] {
    this.items.subscribe(
      (data: UserList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
    
    if(this.dataSize > 0){
      return this.dataDisplay
      .map((dataDisplay, i) => ({id: i + 1, ...dataDisplay}))
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
    } else {
      return this.dataDisplay;
    }
    
  }

  addUser(){
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
    
  }

  onResetUserForm(){
    this.username = null;
    this.password = null;
    this.rePassword = null;
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'modal-nav' });
  }

  removeUser(user: UserList){
    this.itemsRef.remove(`user-list/${user.key}`).then((value) => {
      // action
    });
  }

}
