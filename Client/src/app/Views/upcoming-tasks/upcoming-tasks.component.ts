import { Component, OnInit } from '@angular/core';
import { MenuSideBarComponent } from "../menu-side-bar/menu-side-bar.component";
import { CommonModule } from '@angular/common';
import { Task } from '../../Interfaces/task';
import { TasksService } from '../../Services/tasks.service';
import { TaskSidebarComponent } from "../task-sidebar/task-sidebar.component";
import { FormBuilder } from '@angular/forms';
import { addDays, endOfWeek, isWithinInterval, parseISO, startOfDay, startOfWeek } from 'date-fns';

@Component({
  selector: 'app-upcoming-tasks',
  standalone: true,
  imports: [MenuSideBarComponent, CommonModule, TaskSidebarComponent],
  templateUrl: './upcoming-tasks.component.html',
  styleUrls: ['./upcoming-tasks.component.css']
})
export class UpcomingTasksComponent implements OnInit {
  todayTasks: Task[] = [];
  thisWeekTasks: Task[] = [];
  tomorrowTasks: Task[] = [];

  isSidebarOpen: boolean = false;

  constructor(private fb: FormBuilder, private tasksService: TasksService) { }

  ngOnInit(): void {
    this.fetchTasksThisWeek();

  }

  fetchTasksThisWeek() {
    this.tasksService.listTasks().subscribe((tasks) => {
      const today = new Date()
      const normalizedToday = startOfDay(today)
      const tomorrow = addDays(normalizedToday, 1)

      const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Começo da semana
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 }); // Fim da semana

      // Filtrando as tarefas para esta semana
      this.thisWeekTasks = tasks.filter((task) => {
        const startDate = task.startDate;
        const endDate = task.endDate;
        return isWithinInterval(startDate, { start: weekStart, end: weekEnd }) ||
          isWithinInterval(endDate, { start: weekStart, end: weekEnd });
      });

      // Filtrando as tarefas que terminam hoje
      this.todayTasks = tasks.filter((task) => {
        let endDate = task.endDate;

        if (typeof endDate === "string") endDate = parseISO(endDate);

        const normalizedEndDate = startOfDay(endDate)
        return normalizedEndDate.getTime() === normalizedToday.getTime();
      });

      this.tomorrowTasks = tasks.filter((task) => {
        let endDate = task.endDate;

        if (typeof endDate === 'string') endDate = parseISO(endDate);

        const normalizedEndDate = startOfDay(endDate)

        return normalizedEndDate.getTime() === tomorrow.getTime();
      })

    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen
  }

  handleSidebarClose() {
    this.isSidebarOpen = false
  }
}
