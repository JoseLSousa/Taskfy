import { Routes } from '@angular/router';
import { HomeComponent } from './Views/home/home.component';
import { DashboardComponent } from './Views/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'dashboard', component: DashboardComponent }
];
