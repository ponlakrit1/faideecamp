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
import { AdminActivityComponent } from './components/admin-activity/admin-activity.component';
import { AdminInfoComponent } from './components/admin-info/admin-info.component';
import { AuthGuardService } from './provider/authGuardService';

const routes: Routes =[
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home',             component: ComponentsComponent },
    { path: 'contact',          component: ContactComponent },
    { path: 'activity',         component: ActivityComponent },
    { path: 'user-reg',         component: UserRegComponent },
    { path: 'form-download',    component: FormDownloadComponent },
    { path: 'booking',          component: BookingComponent, canActivate: [AuthGuardService] },
    { path: 'admin-user',       component: AdminUserComponent, canActivate: [AuthGuardService] },
    { path: 'admin-activity',   component: AdminActivityComponent, canActivate: [AuthGuardService] },
    { path: 'admin-info',       component: AdminInfoComponent, canActivate: [AuthGuardService] }
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