import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';

import localeTh from '@angular/common/locales/th';

import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule  } from '@angular/fire/database';
import { environment } from '../environments/environment.prod';

import { AppComponent } from './app.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

import { ComponentsComponent } from './components/home/components.component';
import { ContactComponent } from './components/contact/contact.component';
import { ActivityComponent } from './components/activity/activity.component';
import { HeaderCompComponent } from './components/header-comp/header-comp.component';
import { UserRegComponent } from './components/user-reg/user-reg.component';
import { FormDownloadComponent } from './components/form-download/form-download.component';
import { BookingComponent } from './components/admin-booking/booking.component';
import { AdminUserComponent } from './components/admin-general/admin-user/admin-user.component';

import { AuthGuardService } from './provider/authGuardService';
import { AuthService } from './provider/auth.service';
import { AdminActivityComponent } from './components/admin-general/admin-activity/admin-activity.component';
import { AdminInfoComponent } from './components/admin-general/admin-info/admin-info.component';
import { AdminSchoolComponent } from './components/admin-school/admin-school.component';
import { AdminGeneralComponent } from './components/admin-general/admin-general.component';
import { AdminNotjoinComponent } from './components/admin-general/admin-notjoin/admin-notjoin.component';

registerLocaleData(localeTh);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    ContactComponent,
    ActivityComponent,
    HeaderCompComponent,
    ComponentsComponent,
    UserRegComponent,
    FormDownloadComponent,
    BookingComponent,
    AdminUserComponent,
    AdminActivityComponent,
    AdminInfoComponent,
    AdminSchoolComponent,
    AdminGeneralComponent,
    AdminNotjoinComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgbModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    AngularFireModule.initializeApp(environment.firebase, 'faideecamp'),
    AngularFireDatabaseModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthGuardService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
