import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Member } from '../_models/member';
import { environment } from 'src/environments/environment';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService implements OnInit{

  baseUrl = environment.apiURL;
  members: Member[] = [];
  
  constructor(private http: HttpClient) { }

  ngOnInit(): void {

  }

  getMembers() {
    if(this.members.length > 0) return of(this.members);

    return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
      map(members => {
        this.members = members;
        return members;
      })
    ) // , this.getHttpOptions()
  }
  
  getMember(username: string) {
    const member = this.members.find(x => x.userName == username);
    if(member) return of(member);
    return this.http.get<Member>(this.baseUrl + 'users/' + username) // , this.getHttpOptions() handle by jwt.interceptor.ts
  }

  //Pass token with request 
  getHttpOptions(){
    const userString = localStorage.getItem('user');
    if(!userString) return;
    const user = JSON.parse(userString);
    // create options
    return {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + user.token
      })
    }
  }

  updateMember(member: Member) {
    return this.http.put(this.baseUrl + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        // spread operator
        this.members[index] = {...this.members[index], ...member} // all of the elements in this location of the name and spreads them
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.http.delete(this.baseUrl + 'users/delet-photo/' + photoId);
  }



}
