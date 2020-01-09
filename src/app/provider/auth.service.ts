import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private viewUid: ReplaySubject<string>;
  public currentViewUid: Observable<string>;

  constructor() {
    this.viewUid = new ReplaySubject(1);
    this.currentViewUid = this.viewUid.asObservable();
  }

  public onViewUid(token: string) {
    sessionStorage.setItem("username", token);
    this.viewUid.next(token);
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
