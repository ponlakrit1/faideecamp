import { Component, OnInit } from '@angular/core';
import { InfoList } from './../../data-model/info.model';
import { InfoService } from './../../provider/info.service';

@Component({
    selector: 'app-components',
    templateUrl: './components.component.html'
})

export class ComponentsComponent implements OnInit {

    public dataDisplay: InfoList[];
    public loading: boolean = false;

    constructor(private infoService: InfoService) {

    }

    ngOnInit() {
        this.loading = true;

        this.infoService.getAll().subscribe(
            (data: InfoList[]) => {
              this.dataDisplay = data;
              this.loading = false;
            }
        );
    }

}
