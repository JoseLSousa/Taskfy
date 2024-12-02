import { Component, OnInit } from '@angular/core';
import { MenuSideBarComponent } from "../menu-side-bar/menu-side-bar.component";
import { CommonModule } from '@angular/common';
import { Task } from '../../Interfaces/task';
import { TasksService } from '../../Services/tasks.service';
import { TaskSidebarComponent } from "../task-sidebar/task-sidebar.component";
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

  isSidebarOpen: boolean = false; // Controle de visibilidade da barra lateral
  selectedTask: Task | null = null; // Tarefa selecionada
  mode: 'create' | 'edit' | 'view' = 'edit'; // Modo da barra lateral (criação, edição ou visualização)

  constructor(private tasksService: TasksService) { }

  ngOnInit(): void {
    this.fetchTasksThisWeek();
  }

  // Busca as tarefas da semana
  fetchTasksThisWeek() {
    this.tasksService.listTasks().subscribe((tasks) => {
      const today = new Date();
      const normalizedToday = startOfDay(today);
      const tomorrow = addDays(normalizedToday, 1);

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

        const normalizedEndDate = startOfDay(endDate);
        return normalizedEndDate.getTime() === normalizedToday.getTime();
      });

      // Filtrando as tarefas que terminam amanhã
      this.tomorrowTasks = tasks.filter((task) => {
        let endDate = task.endDate;

        if (typeof endDate === 'string') endDate = parseISO(endDate);

        const normalizedEndDate = startOfDay(endDate);
        return normalizedEndDate.getTime() === tomorrow.getTime();
      });
    });
  }

  // Método para selecionar uma tarefa e abrir a barra lateral
  selectTaskAndToggleSidebar(task: Task | null) {
    this.selectTask(task);
  }

  // Método para selecionar uma tarefa (atualiza os dados no formulário e mantém a barra lateral aberta)
  selectTask(task: Task | null) {
    this.selectedTask = task;
    this.mode = task ? 'view' : 'create'; // Muda o modo dependendo se a tarefa existe ou não

    // Se a barra lateral não estiver aberta, abra-a
    if (!this.isSidebarOpen) {
      this.isSidebarOpen = true;
    }
  }

  // Método para alternar o estado da barra lateral (abrir ou fechar)
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.fetchTasksThisWeek();
  }

  // Método para fechar a barra lateral
  handleSidebarClose() {
    this.isSidebarOpen = false;
    this.fetchTasksThisWeek();
  }

  deleteTask(taskId: string | undefined) {

    if (!taskId) return;

    if (confirm('Deseja excluir essa tarefa?')) {
      this.tasksService.deleteTask(taskId).subscribe({
        next: () => {
          alert('Tarefa excluida!')
          this.handleSidebarClose();
        },
        error: (err) => {
          console.error('Erro ao excluir a tarefa', err)
        },
      })
    }
    console.log();
  }
}
