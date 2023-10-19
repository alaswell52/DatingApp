import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { mapToCanActivate } from '@angular/router';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../_models/user';
import { environment } from 'src/environments/environment';


// root refers to app.module.ts
@Injectable({
  providedIn: 'root'
})


export class AccountService {

  users: any;

  baseUrl = environment.apiURL;
  // Currently on Nav is aware of login, but we need the whole app to know this
  // Store in local storage and an observable in accouont service to allow other components to know if we are logged in
  // <User | null> is a union type allowing a thing to be more than one type
  private currentUserSource = new BehaviorSubject<User | null>(null); 
  // $ is convention to state if variable is an observable
  currentUser$ = this.currentUserSource.asObservable();



  constructor(private http: HttpClient) { }

  // On application start check for user key in app.component

  login(model: any) {
    // post(url, json object passing to backend)
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if(user) {
          this.setCurrentUser(user);
        } 
      })
    );
  }

  setCurrentUser(user : User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push();
    localStorage.setItem('user', JSON.stringify(user)) // store json string in local storage
    this.currentUserSource.next(user);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  register(model: any) {
    return this.http.post<User>(this.baseUrl + 'account/register', model).pipe
    (
      map(user => {
        if(user) {
          this.setCurrentUser(user);          
        }
        return user;
      })
    )
  }

  getDecodedToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]))
  }


}
