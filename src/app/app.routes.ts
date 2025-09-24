import { Routes } from '@angular/router';
import { Appointments } from './appointments/appointments';
import { Contacts } from './contacts/contacts';
import { Doctors } from './doctors/doctors';
import { Family } from './family/family';
import { FamilyMemberComponent } from './family-member/family-member';
import { Tasks } from './tasks/tasks';
import { Documents } from './documents/documents';
import { SigninComponent } from './signin/signin';
import { SignupComponent } from './signup/signup.component';
import { AuthCallbackComponent } from './auth-callback/auth-callback.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'auth/callback', component: AuthCallbackComponent },
  { path: 'tasks', component: Tasks, canActivate: [authGuard] },
  { path: 'tasks/new', component: Tasks, canActivate: [authGuard] },
  { path: 'tasks/:id', component: Tasks, canActivate: [authGuard] },
  { path: 'appointments', component: Appointments, canActivate: [authGuard] },
  { path: 'appointments/new', component: Appointments, canActivate: [authGuard] },
  { path: 'appointments/:id', component: Appointments, canActivate: [authGuard] },
  { path: 'contacts', component: Contacts, canActivate: [authGuard] },
  { path: 'contacts/new', component: Contacts, canActivate: [authGuard] },
  { path: 'contacts/:id', component: Contacts, canActivate: [authGuard] },
  { path: 'doctors', component: Doctors, canActivate: [authGuard] },
  { path: 'doctors/new', component: Doctors, canActivate: [authGuard] },
  { path: 'doctors/:id', component: Doctors, canActivate: [authGuard] },
  { path: 'family', component: Family, canActivate: [authGuard] },
  { path: 'family-member', component: FamilyMemberComponent, canActivate: [authGuard] },
  { path: 'family-member/new', component: FamilyMemberComponent, canActivate: [authGuard] },
  { path: 'family-member/:id', component: FamilyMemberComponent, canActivate: [authGuard] },
  { path: 'documents', component: Documents, canActivate: [authGuard] },
  { path: '**', redirectTo: 'signin' }
];
