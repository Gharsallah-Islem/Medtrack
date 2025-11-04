import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class RoleGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRole = route.data['expectedRole']?.toLowerCase();
        const userRole = this.authService.getUserRole()?.toLowerCase();

        if (userRole && expectedRole && userRole === expectedRole) {
            return true;
        } else {
            this.router.navigate(['/auth/login']);
            return false;
        }
    }
}