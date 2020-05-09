import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotJoinList } from './../data-model/notjoin.model';

@Injectable({
  providedIn: 'root'
})
export class NotJoinService {
  private itemsRef: AngularFireList<NotJoinList>;
  private items: Observable<NotJoinList[]>;

  constructor(private afs: AngularFireDatabase) {
    this.itemsRef = this.afs.list<NotJoinList>('notjoin-list');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    );
  }

  getAll(): Observable<NotJoinList[]> {
    return this.items;
  }

  getByCreateDate(id: string) {
    return this.afs.list<NotJoinList>('notjoin-list', ref => ref.orderByChild('createDate').equalTo(id)).snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    ).pipe(take(1));
  }

  create(item: NotJoinList) {
    return this.itemsRef.push(item);
  }
 
  update(item: NotJoinList) {
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
