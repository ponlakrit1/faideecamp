import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserList } from './../data-model/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private itemsRef: AngularFireList<UserList>;
  private items: Observable<UserList[]>;

  constructor(private afs: AngularFireDatabase) {
    this.itemsRef = this.afs.list<UserList>('user-list');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    );
  }

  getAll(): Observable<UserList[]> {
    return this.items;
  }

  getByUsername(id: string) {
    return this.afs.list<UserList>('user-list', ref => ref.orderByChild('username').equalTo(id)).snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    ).pipe(take(1));
  }

  create(item: UserList) {
    return this.itemsRef.push(item);
  }
 
  update(item: UserList) {
    this.itemsRef.update(item.key, item).then((value) => {
      return value;
    });
  }
 
  delete(id: string) {
    this.itemsRef.remove(id).then((value) => {
      return value;
    });
  }
}
