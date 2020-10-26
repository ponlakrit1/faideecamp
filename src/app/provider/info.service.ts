import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { InfoList } from './../data-model/info.model';

@Injectable({
  providedIn: 'root'
})
export class InfoService {

  private dbPath = '/info-list';

  private itemsRef: AngularFirestoreCollection<InfoList> = null;
  private items: Observable<InfoList[]>;

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

  getAll(): Observable<InfoList[]> {
    return this.items;
  }

  getAllTakeOne(): Observable<InfoList[]> {
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

  create(items: InfoList): any {
    return this.itemsRef.add({ ...items });
  }

  update(id: string, data: any): Promise<void> {
    return this.itemsRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.itemsRef.doc(id).delete();
  }

}
