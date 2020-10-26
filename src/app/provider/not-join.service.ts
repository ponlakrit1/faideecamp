import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NotJoinList } from './../data-model/notjoin.model';

@Injectable({
  providedIn: 'root'
})
export class NotJoinService {

  private dbPath = '/notjoin-list';

  private itemsRef: AngularFirestoreCollection<NotJoinList> = null;
  private items: Observable<NotJoinList[]>;

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

  getAll(): Observable<NotJoinList[]> {
    return this.items;
  }

  getAllTakeOne(): Observable<NotJoinList[]> {
    this.itemsRef = this.db.collection(this.dbPath);

    return this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).pipe(take(1));
  }

  getByCreateDate(id: string) {
    this.itemsRef = this.db.collection(this.dbPath, ref => ref.where('createDate', '==', id));

    return this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).pipe(take(1));
  }

  create(items: NotJoinList): any {
    return this.itemsRef.add({ ...items });
  }

  update(id: string, data: any): Promise<void> {
    return this.itemsRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.itemsRef.doc(id).delete();
  }
}
