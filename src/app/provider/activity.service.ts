import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivityList } from '../data-model/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private dbPath = '/activity-list';

  private itemsRef: AngularFirestoreCollection<ActivityList> = null;
  private items: Observable<ActivityList[]>;

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

  getAll(): Observable<ActivityList[]> {
    return this.items;
  }

  getAllTakeOne(): Observable<ActivityList[]> {
    this.itemsRef = this.db.collection(this.dbPath);

    return this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c =>
          ({ id: c.payload.doc.id, ...c.payload.doc.data() })
        )
      )
    ).pipe(take(1));
  }

  create(items: ActivityList): any {
    return this.itemsRef.add({ ...items });
  }

  update(id: string, data: any): Promise<void> {
    return this.itemsRef.doc(id).update(data);
  }

  delete(id: string): Promise<void> {
    return this.itemsRef.doc(id).delete();
  }
}
