import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { AdminUserComponent } from './components/admin-user/admin-user.component';

import { AuthGuardService } from './provider/authGuardService';
import { AuthService } from './provider/auth.service';

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
    AdminUserComponent
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
    FormsModule
  ],
  providers: [
    AuthGuardService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
