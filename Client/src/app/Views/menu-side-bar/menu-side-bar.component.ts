import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-menu-side-bar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './menu-side-bar.component.html',
  styleUrl: './menu-side-bar.component.css'
})
export class MenuSideBarComponent {

}
