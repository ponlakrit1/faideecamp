import { Component, OnInit, ElementRef, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService } from './../../provider/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface UserList {
    id?: number;
    key: string;
    username: string;
    password: string;
  }

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    @ViewChild('modalLoginContent', {static: true}) modalContent: TemplateRef<any>;
    
    private toggleButton: any;
    private sidebarVisible: boolean;

    username: string;
    password: string;
    loginStatus: boolean;
    alertStatus: boolean;

    itemsRef: AngularFireList<any>;
    items: Observable<any[]>;

    constructor(public location: Location, 
                private element : ElementRef, 
                private modalService: NgbModal, 
                private authService: AuthService, 
                private router: Router,
                private db: AngularFireDatabase) {

        this.sidebarVisible = false;
        this.loginStatus = false;
        this.alertStatus = false;
    }

    ngOnInit() {
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];

        this.loginStatus = this.authService.isActive();
    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const html = document.getElementsByTagName('html')[0];
        // console.log(html);
        // console.log(toggleButton, 'toggle');

        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);
        html.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const html = document.getElementsByTagName('html')[0];
        // console.log(html);
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        html.classList.remove('nav-open');
    };
    sidebarToggle() {
        // const toggleButton = this.toggleButton;
        // const body = document.getElementsByTagName('body')[0];
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    };
    isHome() {
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }
        if( titlee === '/home' ) {
            return true;
        }
        else {
            return false;
        }
    }
    isDocumentation() {
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }
        if( titlee === '/documentation' ) {
            return true;
        }
        else {
            return false;
        }
    }

    openModal(): void {
        this.modalService.open(this.modalContent, { windowClass: 'modal-nav' });
    }

    onLogin(){
        var status = false;

        // Set firebase
        this.itemsRef = this.db.list(`user-list`, ref => ref.orderByChild('username').equalTo(this.username));
        this.items = this.itemsRef.snapshotChanges().pipe(
            map(changes => 
              changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
            )
        );

        // Get data
        this.items.subscribe(
            (data: UserList[]) => {
                if(data.length > 0){
                    for(let temp of data){
                        if(temp.password == this.password){
                            status = true;
                        }
                    }

                    // Check correct status
                    if(status){
                        this.loginStatus = true;
                        this.authService.onViewUid(this.username);
            
                        this.modalService.dismissAll();
                        this.router.navigate(['booking']);
                    } else {
                        this.alertStatus = true;
                    }
                } else {
                    this.alertStatus = true;
                }
            }
        );
    }

    onLogout(){
        this.loginStatus = false;
        this.alertStatus = false;
        this.username = null;
        this.password = null;

        this.authService.removeUserSession();
        this.authService.onViewUid(null);

        this.router.navigate(['']);
    }
}
