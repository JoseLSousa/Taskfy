import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { Register } from '../Interfaces/register';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }

  register(data: any): Observable<Register> {

    return this.http.post<Register>(`${this.apiUrl}register`, data)
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login`, data)
  }

}
