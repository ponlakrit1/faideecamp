import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SchoolList } from './../data-model/school.model';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  private itemsRef: AngularFireList<SchoolList>;
  private items: Observable<SchoolList[]>;

  constructor(private afs: AngularFireDatabase) {
    this.itemsRef = this.afs.list<SchoolList>('school-list');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    );
  }

  getAll(): Observable<SchoolList[]> {
    return this.items;
  }

  getByYear(id: string) {
    return this.afs.list<SchoolList>('school-list', ref => ref.orderByChild('year').equalTo(id)).snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    );
  }

  create(item: SchoolList) {
    return this.itemsRef.push(item);
  }
 
  update(item: SchoolList) {
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
