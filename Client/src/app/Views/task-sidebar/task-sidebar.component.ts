import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../Interfaces/task';
import { CommonModule } from '@angular/common';
import { TasksService } from '../../Services/tasks.service';

@Component({
  selector: 'app-task-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-sidebar.component.html',
  styleUrls: ['./task-sidebar.component.css']
})
export class TaskSidebarComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() task: Task | null = null;
  @Input() mode: 'create' | 'edit' | 'view' = 'view';

  @Output() onClose = new EventEmitter<void>();
  @Output() delete = new EventEmitter<any>();

  taskForm: FormGroup;

  constructor(private fb: FormBuilder, private tasksService: TasksService) {
    this.taskForm = this.fb.group({
      id: [],
      title: ['', Validators.required],
      description: ['', Validators.required],
      priority: ['Média', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      isFullDay: [false],
    });
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (this.mode === "create") {
      this.taskForm.reset()
    } else {
      if (changes['task']) {
        if (this.task != null) {
          this.taskForm.patchValue({
            title: this.task.title,
            description: this.task.description,
            priority: this.task.priority,
            startDate: this.task.startDate,
            endDate: this.task.endDate,
          })
        }
      }

    }

  }


  closeSidebar() {
    this.onClose.emit();
  }

  saveTask() {
    if (this.taskForm.valid) {
      if (this.mode === "create") {
        const taskData = {
          title: this.taskForm.value.title,
          description: this.taskForm.value.description,
          priority: this.taskForm.value.priority,
          startDate: this.taskForm.value.startDate,
          endDate: this.taskForm.value.endDate,
        }
        this.tasksService.createTask(taskData).subscribe({
          next: () => {
            alert("Tarefa Adicionada!")
            this.closeSidebar();
          },
        })

      } else {

        const taskData = {
          id: this.task?.id,
          title: this.taskForm.value.title,
          description: this.taskForm.value.description,
          priority: this.taskForm.value.priority,
          startDate: this.taskForm.value.startDate,
          endDate: this.taskForm.value.endDate,
        }

        this.tasksService.updateTask(this.task?.id, taskData).subscribe({
          next: () => {

            this.closeSidebar()
          },
          error(err) {
            console.warn(err.error.errors)
          },
        })
      }


    } else {
      console.log('Formulário inválido', this.taskForm.errors);
    }
  }

  onDelete() {
    this.delete.emit(this.task?.id)
  }
}


