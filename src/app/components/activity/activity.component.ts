import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivityList } from './../../data-model/activity.model';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {

  itemsRefDisplay: AngularFireList<any>;
  itemsDisplay: Observable<any[]>;
  dataDisplay: ActivityList[];

  constructor(private db: AngularFireDatabase) {
    // Set firebase
    this.itemsRefDisplay = this.db.list(`activity-list`);
    this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
        map(changes => 
            changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
    );
  }

  ngOnInit() {
    this.itemsDisplay.subscribe(
        (data: ActivityList[]) => {
          this.dataDisplay = data;
        }
    );
  }

}
