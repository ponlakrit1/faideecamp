import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {

  }

  public storeUserSession(token: string) {
    sessionStorage.setItem("username", token);
  }

  public removeUserSession() {
    sessionStorage.removeItem("username");
  }

  public isActive(): boolean{
    let activeUser = sessionStorage.getItem("username");

    if (activeUser == null || activeUser == 'null') {
      return false;
    } else {
      return true;
    }
  }
}
