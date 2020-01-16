import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InfoList } from './../../data-model/info.model';

@Component({
    selector: 'app-components',
    templateUrl: './components.component.html'
})

export class ComponentsComponent implements OnInit {

    itemsRefDisplay: AngularFireList<any>;
    itemsDisplay: Observable<any[]>;
    dataDisplay: InfoList[];

    constructor(private db: AngularFireDatabase) {
        // Set firebase
        this.itemsRefDisplay = this.db.list(`info-list`);
        this.itemsDisplay = this.itemsRefDisplay.snapshotChanges().pipe(
            map(changes => 
                changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
            )
        );
    }

    ngOnInit() {
        this.itemsDisplay.subscribe(
            (data: InfoList[]) => {
              this.dataDisplay = data;
            }
        );
    }

}
