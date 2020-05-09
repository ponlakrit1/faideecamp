import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BookingList } from './../data-model/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private itemsRef: AngularFireList<BookingList>;
  private items: Observable<BookingList[]>;

  constructor(private afs: AngularFireDatabase) {
    this.itemsRef = this.afs.list<BookingList>('booking-list');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    );
  }

  getAll(): Observable<BookingList[]> {
    return this.items;
  }

  getByMonthAndYear(id: string) {
    return this.afs.list<BookingList>('booking-list', ref => ref.orderByChild('month_year').equalTo(id)).snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    );
  }

  getByYear(id: string) {
    return this.afs.list<BookingList>('booking-list', ref => ref.orderByChild('year').equalTo(id)).snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    );
  }

  getByEventDate(id: string) {
    return this.afs.list<BookingList>('booking-list', ref => ref.orderByChild('eventDate').equalTo(id)).snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    ).pipe(take(1));
  }

  getByKey(id: string) {
    return this.afs.list<BookingList>('booking-list', ref => ref.orderByChild('key').equalTo(id)).snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.key, ...c.payload.val() }))
      )
    ).pipe(take(1));
  }

  create(item: BookingList) {
    return this.itemsRef.push(item);
  }
 
  update(item: BookingList) {
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
