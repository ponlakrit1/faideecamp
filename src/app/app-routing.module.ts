import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { ComponentsComponent } from './components/home/components.component';
import { ContactComponent } from './components/contact/contact.component';
import { ActivityComponent } from './components/activity/activity.component';
import { UserRegComponent } from './components/user-reg/user-reg.component';

const routes: Routes =[
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home',             component: ComponentsComponent },
    { path: 'contact',          component: ContactComponent },
    { path: 'activity',         component: ActivityComponent },
    { path: 'user-reg',         component: UserRegComponent }
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