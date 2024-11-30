import { Routes } from '@angular/router';
import { HomeComponent } from './Views/home/home.component';

import { authGuard } from './Guards/auth.guard';
import { UpcomingTasksComponent } from './Views/upcoming-tasks/upcoming-tasks.component';
import { TodayTasksComponent } from './Views/today-tasks/today-tasks.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        children: [
            { path: "", redirectTo: 'today', pathMatch: 'full' },
            { path: "today", component: TodayTasksComponent },
            { path: "upcoming", component: UpcomingTasksComponent }
        ]
    },
];
