import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { ComponentsComponent } from './components/home/components.component';
import { ContactComponent } from './components/contact/contact.component';
import { ActivityComponent } from './components/activity/activity.component';
import { UserRegComponent } from './components/user-reg/user-reg.component';
import { FormDownloadComponent } from './components/form-download/form-download.component';
import { BookingComponent } from './components/admin-booking/booking.component';
import { AdminUserComponent } from './components/admin-user/admin-user.component';
import { AuthGuardService } from './provider/AuthGuardService';

const routes: Routes =[
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home',             component: ComponentsComponent },
    { path: 'contact',          component: ContactComponent },
    { path: 'activity',         component: ActivityComponent },
    { path: 'user-reg',         component: UserRegComponent },
    { path: 'form-download',    component: FormDownloadComponent },
    { path: 'booking',          component: BookingComponent, canActivate: [AuthGuardService]},
    { path: 'admin-user',       component: AdminUserComponent, canActivate: [AuthGuardService] }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes,{
      useHash: false
    })
  ],
  exports: [
  ],
})
export class AppRoutingModule { }