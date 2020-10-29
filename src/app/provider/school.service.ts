import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SchoolList } from './../data-model/school.model';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {

  private dbPath = '/school-list';

  private itemsRef: AngularFirestoreCollection<SchoolList> = null;
  private items: Observable<SchoolList[]>;

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

  getAll(): Observable<SchoolList[]> {
    return this.items;
  }

  getAllTakeOne(): Observable<SchoolList[]> {
    this.itemsRef = this.db.collection(this.dbPath);

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

  getByYearAndSchoolArea(year: string, area: string) {
    this.itemsRef = this.db.collection(this.dbPath, ref => ref.where('year', '==', year).where('area', '==', area));

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

  create(items: SchoolList): any {
    return this.itemsRef.add({ ...items });
  }

  update(id: string, data: any): Promise<void> {
    return this.itemsRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.itemsRef.doc(id).delete();
  }

}
