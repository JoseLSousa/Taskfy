import { Component } from '@angular/core';
import { MenuSideBarComponent } from "../menu-side-bar/menu-side-bar.component";

@Component({
  selector: 'app-upcoming-tasks',
  standalone: true,
  imports: [MenuSideBarComponent],
  templateUrl: './upcoming-tasks.component.html',
  styleUrl: './upcoming-tasks.component.css'
})
export class UpcomingTasksComponent {

}
