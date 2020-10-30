import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivityList } from './../../data-model/activity.model';
import { ActivityService } from './../../provider/activity.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit {

  dataDisplay: ActivityList[];

  constructor(private activityService: ActivityService) {
    this.activityService.getAllTakeOne().subscribe(
      (data: ActivityList[]) => {
        this.dataDisplay = data;
      }
    );
  }

  ngOnInit() {

  }

}
