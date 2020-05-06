import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { InfoList } from './../data-model/info.model';

@Injectable({
  providedIn: 'root'
})
export class InfoService {
  private itemsRef: AngularFireList<InfoList>;
  private items: Observable<InfoList[]>;

  constructor(private afs: AngularFireDatabase) {
    this.itemsRef = this.afs.list<InfoList>('info-list');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    );
  }

  getAll(): Observable<InfoList[]> {
    return this.items;
  }

  getByCreateDate(id: string) {
    return this.afs.list<InfoList>('info-list', ref => ref.orderByChild('createDate').equalTo(id)).snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    ).pipe(take(1));
  }

  create(item: InfoList) {
    return this.itemsRef.push(item);
  }
 
  update(item: InfoList) {
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
