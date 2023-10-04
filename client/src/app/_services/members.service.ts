import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Member } from '../_models/member';
import { environment } from 'src/environments/environment';
import { map, of, take } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { User } from '../_models/user';
import { AccountService } from './account.service';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MembersService implements OnInit{

  baseUrl = environment.apiURL;
  members: Member[] = [];
  paginatedResult: PaginatedResult<Member[]> = new PaginatedResult<Member[]>;
  memberCache = new Map(); // keyvalue pair like a python dictionary
  user: User | undefined;
  userParams: UserParams | undefined;

  constructor(private http: HttpClient,
              private accountService: AccountService) { 
                this.accountService.currentUser$.pipe(take(1)).subscribe({
                  next: user => {
                    if(user) {
                      this.userParams = new UserParams(user);
                      this.user = user;
                    }
                  }
                })
              }

  ngOnInit(): void {

  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParams) {
    this.userParams = params;
  }

  resetUserParams() {
    if(this.user) {
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  getMembers(userParams: UserParams) {
    const response = this.memberCache.get(Object.values(userParams).join('-'));
    
    if(response) return of(response); // of is an observable

    console.log(Object.values(userParams).join('-'))
    let params = this.getPaginationHeaders(userParams.pageNumber, userParams.pageSize);

    params = params.append('gender', userParams.gender);
    params = params.append('minAge', userParams.minAge);
    params = params.append('maxAge', userParams.maxAge);
    params = params.append('orderBy', userParams.orderBy);

    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params).pipe(
      map(response => {
        this.memberCache.set(Object.values(userParams).join('-'), response);
        return response;
      })
    ); 

  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {

    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>;

    // this.http.get<Member[]>(this.baseUrl + 'users').pipe() will only access the data from body of the response
    // the method below gets the data from the body and accesses the headers of the response to get full pagination ie the full http response
    return this.http.get<T>(url, {observe: 'response', params}).pipe(
      map(response => {

        if(response.body) {
          paginatedResult.result = response.body;
        }

        const pagination = response.headers.get('Pagination');

        if(pagination){
          paginatedResult.pagination = JSON.parse(pagination);
        }

        return paginatedResult;
      })
    )

  }

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
 
    
    return params;
  }

  getMember(username: string) {
    // const member = this.members.find(x => x.userName == username);
    // if(member) return of(member);
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.userName === username);

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

  addLike(username: string) {
    return this.http.post(this.baseUrl + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {



    let params = this.getPaginationHeaders(pageNumber, pageSize); 
    params = params.append('predicate', predicate);

    return this.getPaginatedResult<Member[]>(this.baseUrl + 'likes', params); 
    //this.http.get<Member[]>(this.baseUrl + 'likes?predicate=' + predicate);
  }

}
