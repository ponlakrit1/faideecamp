import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BookingList } from './../../data-model/booking.model';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  @ViewChild('modalBooking', {static: true}) modalContent: TemplateRef<any>;

  page = 1;
  pageSize = 10;

  dataItem: BookingList;

  itemsRef: AngularFireList<any>;
  items: Observable<any[]>;
  itemsRefSearch: AngularFireList<any>;
  itemsSearch: Observable<any[]>;
  dataDisplay: BookingList[];
  dataSize: number = 0;

  constructor(private db: AngularFireDatabase, private modalService: NgbModal) {
    // Set firebase
    this.itemsRefSearch = this.db.list(`user-list`, ref => ref.orderByChild('year').equalTo("2020"));
    this.itemsSearch = this.itemsRefSearch.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  ngOnInit() {
    this.items.subscribe(
      (data: BookingList[]) => {
        this.dataDisplay = data;
        this.dataSize = data.length;
      }
    );
  }

  addBooking(){
    this.dataItem.year = "";
    this.dataItem.month = "";
    this.dataItem.day = "";
    this.dataItem.yearMonth = "";
    this.dataItem.amount = "60";

    // Set firebase
    // this.itemsRef = this.db.list(`user-list`, ref => ref.orderByChild('username').equalTo(this.username));
    // this.items = this.itemsRef.snapshotChanges().pipe(
    //     map(changes => 
    //       changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
    //     )
    // );
  }

  openModal(): void {
    this.modalService.open(this.modalContent, { windowClass: 'w3-animate-top' });
  }

}
