import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private userService: AuthService, private router: Router) {
      
  }
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let activeUser = sessionStorage.getItem("username");
    if(activeUser == null){
      this.router.navigate(['']);
      return false;
    } else if(activeUser == "null"){
      this.router.navigate(['']);
      return false;
    } else {
      return true;
    }
  }
  
}