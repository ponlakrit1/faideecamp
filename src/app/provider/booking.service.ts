import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BookingList } from './../data-model/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private dbPath = '/booking-list';

  private itemsRef: AngularFirestoreCollection<BookingList> = null;
  private items: Observable<BookingList[]>;

  constructor(private db: AngularFirestore) {
    this.itemsRef = this.db.collection(this.dbPath);
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    );
  }

  getAll(): Observable<BookingList[]> {
    return this.items;
  }

  getAllTakeOne(): Observable<BookingList[]> {
    this.itemsRef = this.db.collection(this.dbPath);

    return this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).pipe(take(1));
  }

  getByMonthAndYear(month: string, year: string) {
    this.itemsRef = this.db.collection(this.dbPath, ref => ref.where('month', '==', String(month)).where('year', '==', year));

    return this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).pipe(take(1));
  }

  getByYear(id: string) {
    this.itemsRef = this.db.collection(this.dbPath, ref => ref.where('year', '==', id));

    return this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).pipe(take(1));
  }

  getByEventDate(id: string) {
    this.itemsRef = this.db.collection(this.dbPath, ref => ref.where('eventDate', '==', id));

    return this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).pipe(take(1));
  }

  create(items: BookingList): any {
    return this.itemsRef.add({ ...items });
  }

  update(id: string, data: any): Promise<void> {
    return this.itemsRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.itemsRef.doc(id).delete();
  }

}
