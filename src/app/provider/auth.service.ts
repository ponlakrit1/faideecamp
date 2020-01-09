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

  public removeSession() {
    sessionStorage.clear();
  }

  public isActive(): boolean{
    let activeUser = sessionStorage.getItem("username");
    
    console.log("tine = "+activeUser);

    if (activeUser !== null) {
      console.log("true = "+activeUser);
      return true;
    } else {
      console.log("false = "+activeUser);
      return false;
    }
  }
}
