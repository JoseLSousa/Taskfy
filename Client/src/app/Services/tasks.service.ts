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

  listTasks(): Observable<Task[]> {

    return this.http.get<Task[]>(`${this.apiUrl}api/Tasks`)
  }

  createTask(data: any): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}api/Tasks/add`, data)
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}api/Tasks/${task.id}`, task)
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}api/Tasks/delete/${taskId}`)
  }
}


