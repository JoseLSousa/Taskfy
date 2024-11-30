import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../Interfaces/task';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  listTodayTasks(): Observable<any> {
    const tasks = this.http.get<any>(`${this.apiUrl}api/Tasks/today`)
    console.log("TaskService",tasks);
    return tasks
  }
}
