import { Component, OnInit, ElementRef, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AuthService } from './../../provider/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { UserList } from './../../data-model/user.model';
import { UserService } from './../../provider/user.service';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    @ViewChild('modalLoginContent', {static: true}) modalContent: TemplateRef<any>;
    @ViewChild('modalLogout', {static: true}) modalConfirm: TemplateRef<any>;
    
    private toggleButton: any;
    private sidebarVisible: boolean;

    public username: string;
    public password: string;
    public loginStatus: boolean;
    public alertStatus: boolean;
    public alertTxt: string;
    public alertType: string;

    constructor(public location: Location, 
                private element : ElementRef, 
                private modalService: NgbModal, 
                private authService: AuthService, 
                private router: Router,
                private userService: UserService) {

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

    openModal(): void {
        this.modalService.open(this.modalContent, { windowClass: 'modal-nav' });
    }

    onLogin(){
        try {
            this.userService.getByUsername(this.username).subscribe(
                (data: UserList[]) => {
                    if(data.length > 0){

                        if(data[0].password == this.password){
                            this.loginStatus = true;
                            this.authService.storeUserSession(this.username);
                
                            this.modalService.dismissAll();
                            this.router.navigate(['admin-booking']);
                        } else {
                            this.presentAlertMessage("danger", "รหัสผ่านไม่ถูกต้อง");
                        }
                        
                    } else {
                        this.presentAlertMessage("danger", "ไม่พบข้อมูลผู้ใช้งาน");
                    }
                }
            );
        } catch(error) {
            this.presentAlertMessage("danger", "เกิดข้อผิดพลาดระหว่างการเชื่อมต่อฐานข้อมูล");
        }
    }

    onLogout(){
        this.modalService.open(this.modalConfirm, { windowClass: 'modal-nav' });
    }

    onConfirmLogout(){
        this.loginStatus = false;
        this.alertStatus = false;
        this.username = null;
        this.password = null;

        this.authService.removeUserSession();
        this.authService.storeUserSession(null);

        this.modalService.dismissAll();
        this.router.navigate(['']);
    }

    presentAlertMessage(type: string, txt: string){
        this.alertTxt = txt;
        this.alertType = type;
        this.alertStatus = true;
    
        setTimeout(() => this.alertStatus = false, 3000);
    }
}
