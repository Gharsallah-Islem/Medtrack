import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { WelcomeComponent } from './welcome/welcome.component';
import { LoginComponent } from './components/common/login/login.component';
import { SignupComponent } from './components/common/signup/signup.component';
import { VerifyEmailComponent } from './components/common/verify-email/verify-email.component';
import { PatientDashboardComponent } from './components/patient/patient-dashboard/patient-dashboard.component';
import { MedicationListComponent } from './components/patient/medication-list/medication-list.component';
import { AppointmentScheduleComponent } from './components/patient/appointment-schedule/appointment-schedule.component';
import { ReportUploadComponent } from './components/patient/report-upload/report-upload.component';
import { ChatComponent as PatientChatComponent } from './components/patient/chat/chat.component';
import { NotificationsComponent as PatientNotificationsComponent } from './components/patient/notifications/notifications.component';
import { DoctorRatingsComponent } from './components/patient/doctor-ratings/doctor-ratings.component';
import { StatisticsComponent as PatientStatisticsComponent } from './components/patient/statistics/statistics.component';
import { DoctorDashboardComponent } from './components/doctor/doctor-dashboard/doctor-dashboard.component';
import { AppointmentListComponent } from './components/doctor/appointment-list/appointment-list.component';
import { PatientReportsComponent } from './components/doctor/patient-reports/patient-reports.component';
import { AvailabilityManagementComponent } from './components/doctor/availability-management/availability-management.component';
import { ChatComponent as DoctorChatComponent } from './components/doctor/chat/chat.component';
import { NotificationsComponent as DoctorNotificationsComponent } from './components/doctor/notifications/notifications.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { StatisticsComponent as AdminStatisticsComponent } from './components/admin/statistics/statistics.component';
import { PatientLayoutComponent } from './components/patient/patient-layout/patient-layout.component';
import { DoctorStatisticsComponent } from './components/doctor/statistics/statistics.component';

export const routes: Routes = [
    { path: '', component: WelcomeComponent },
    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/signup', component: SignupComponent },
    { path: 'auth/verify-email', component: VerifyEmailComponent },

    {
        path: 'patient',
        component: PatientLayoutComponent,  // Parent layout component
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'patient' },
        children: [
            { path: 'dashboard', component: PatientDashboardComponent },
            { path: 'medications', component: MedicationListComponent },
            { path: 'appointments', component: AppointmentScheduleComponent },
            { path: 'report-upload', component: ReportUploadComponent },
            { path: 'chat', component: PatientChatComponent },
            { path: 'notifications', component: PatientNotificationsComponent },
            { path: 'doctor-ratings', component: DoctorRatingsComponent },
            { path: 'statistics', component: PatientStatisticsComponent },
            // Add redirect for empty patient path
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    {
        path: 'doctor/dashboard',
        component: DoctorDashboardComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'doctor' },
    },
    {
        path: 'doctor/appointments',
        component: AppointmentListComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'doctor' },
    },
    {
        path: 'doctor/patient-reports',
        component: PatientReportsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'doctor' },
    },
    {
        path: 'doctor/availability',
        component: AvailabilityManagementComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'doctor' },
    },
    {
        path: 'doctor/chat',
        component: DoctorChatComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'doctor' },
    },
    {
        path: 'doctor/notifications',
        component: DoctorNotificationsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'doctor' },
    },
    {
        path: 'doctor/statistics',
        component: DoctorStatisticsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'doctor' },  
    },
    

    {
        path: 'admin/dashboard',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'admin' },
    },
    {
        path: 'admin/user-management',
        component: UserManagementComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'admin' },
    },
    {
        path: 'admin/statistics',
        component: AdminStatisticsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'admin' },
    },

    { path: '**', redirectTo: '' },
];  