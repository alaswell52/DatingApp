import { HttpClient, HttpParams } from "@angular/common/http";
import { PaginatedResult } from "../_models/pagination";
import { map } from "rxjs";

export function getPaginatedResult<T>(url: string, params: HttpParams, http: HttpClient) {

    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>;

    // this.http.get<Member[]>(this.baseUrl + 'users').pipe() will only access the data from body of the response
    // the method below gets the data from the body and accesses the headers of the response to get full pagination ie the full http response
    return http.get<T>(url, {observe: 'response', params}).pipe(
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

export function  getPaginationHeaders(pageNumber: number, pageSize: number) {
 
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
  
    return params;
  }