import { Component } from '@angular/core';
import { MenuSideBarComponent } from "../menu-side-bar/menu-side-bar.component";
import { Task } from '../../Interfaces/task';
import { TasksService } from '../../Services/tasks.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-today-tasks',
  standalone: true,
  imports: [MenuSideBarComponent,
    CommonModule
  ],
  templateUrl: './today-tasks.component.html',
  styleUrl: './today-tasks.component.css'
})
export class TodayTasksComponent {

}
