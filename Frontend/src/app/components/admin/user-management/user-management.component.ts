import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as THREE from 'three';
import * as L from 'leaflet';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    FormsModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0)', opacity: 1 })),
      state('out', style({ transform: 'translateY(20px)', opacity: 0 })),
      transition('in => out', animate('0.3s ease-in')),
      transition('out => in', animate('0.3s ease-out'))
    ])
  ]
})
export class UserManagementComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('bgCanvas') bgCanvas!: ElementRef<HTMLCanvasElement>;

  users: User[] = [];
  filteredUsers: User[] = [];
  displayedUsers: User[] = [];
  userForm: FormGroup;
  editingUser: User | null = null;
  searchQuery: string = '';
  roleFilter: string = '';
  pageSize: number = 9;
  currentPage: number = 0;
  loading: boolean = false;
  showPanel: boolean = false;
  isDarkMode: boolean = false;
  isSidebarOpen: boolean = false;
  sortColumn: keyof User | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Location Autocomplete
  locationSuggestions: any[] = [];
  private locationSearchSubject = new Subject<string>();
  private map!: L.Map;
  private marker: L.Marker | null = null;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private points!: THREE.Points;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.userForm = this.fb.group({
      id: [0],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      specialty: [''],
      location: [''],
      isActive: [true],
      verificationCode: ['']
    });
  }

  ngOnInit(): void {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode ? JSON.parse(savedMode) : false;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    this.loadUsers();
    this.setupLocationSearch();
  }

  ngAfterViewInit(): void {
    this.initWebGL();
  }

  ngAfterViewChecked(): void {
    if (this.showPanel && !this.map) {
      this.initMap();
    }
  }

  private initWebGL(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.bgCanvas.nativeElement });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.z = 5;

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 1000; i++) {
      vertices.push(THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000), THREE.MathUtils.randFloatSpread(2000));
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0x5eead4, size: 0.5 });
    this.points = new THREE.Points(geometry, material);
    this.scene.add(this.points);

    const animate = () => {
      requestAnimationFrame(animate);
      this.points.rotation.y += 0.001;
      this.renderer.render(this.scene, this.camera);
    };
    animate();

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  private initMap(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    this.map = L.map('map').setView([51.505, -0.09], 13); // Default to London

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  private updateMap(lat: number, lon: number): void {
    if (!this.map) return;

    const latLng = L.latLng(lat, lon);
    this.map.setView(latLng, 13);

    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    this.marker = L.marker(latLng).addTo(this.map);
    this.marker.bindPopup(`<b>Location</b><br>${this.userForm.get('location')?.value}`).openPopup();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = this.searchQuery
        ? user.username?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (user.email ?? '').toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;
      const matchesRole = this.roleFilter ? user.role === this.roleFilter : true;
      return matchesSearch && matchesRole;
    });
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.currentPage = 0;
    this.updateDisplayedUsers();
  }

  updateDisplayedUsers(): void {
    const start = this.currentPage * this.pageSize;
    this.displayedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  sortTable(column: keyof User): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.filteredUsers.sort((a, b) => {
      const valueA = a[column] ?? '';
      const valueB = b[column] ?? '';
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return this.sortDirection === 'asc'
        ? (valueA < valueB ? -1 : 1)
        : (valueB < valueA ? -1 : 1);
    });
    this.updateDisplayedUsers();
  }

  startEdit(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      specialty: user.specialty,
      location: user.location,
      isActive: user.isActive,
      verificationCode: user.verificationCode
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showPanel = true;
  }

  openAddUserPanel(): void {
    this.editingUser = null;
    this.resetForm();
    this.showPanel = true;
  }

  closePanel(event?: Event): void {
    if (event) event.stopPropagation();
    this.showPanel = false;
    this.cancelEdit();
    if (this.map) {
      this.map.remove();
      this.map = null as any;
      this.marker = null;
    }
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.userForm.reset();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.locationSuggestions = [];
  }

  submitUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const userData: User = this.userForm.value;
    if (this.editingUser) {
      this.userService.updateUser(userData).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) this.users[index] = updatedUser;
          this.applyFilters();
          this.closePanel();
        },
        error: (err) => console.error('Error updating user:', err)
      });
    } else {
      this.userService.addUser(userData).subscribe({
        next: (newUser) => {
          this.users.push(newUser);
          this.applyFilters();
          this.closePanel();
        },
        error: (err) => console.error('Error adding user:', err)
      });
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.applyFilters();
        },
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  toggleUserStatus(user: User): void {
    const updatedUser = { ...user, isActive: !user.isActive };
    this.userService.updateUser(updatedUser).subscribe({
      next: (updated) => {
        const index = this.users.findIndex(u => u.id === updated.id);
        if (index !== -1) this.users[index] = updated;
        this.applyFilters();
      },
      error: (err) => console.error('Error toggling user status:', err)
    });
  }

  resetForm(): void {
    this.userForm.reset({
      id: 0,
      username: '',
      password: '',
      email: '',
      role: 'patient',
      specialty: '',
      location: '',
      isActive: true,
      verificationCode: ''
    });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.locationSuggestions = [];
  }

  toggleSidebar(event: Event): void {
    event.stopPropagation();
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnClickOutside(event: Event): void {
    if (this.isSidebarOpen && !(event.target as HTMLElement).closest('.sidebar') && !(event.target as HTMLElement).closest('.sidebar-toggle')) {
      this.isSidebarOpen = false;
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/auth/login']);
  }

  // Location Autocomplete Methods
  setupLocationSearch(): void {
    this.locationSearchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.length < 3) {
        this.locationSuggestions = [];
        return;
      }
      this.fetchLocationSuggestions(query);
    });
  }

  onLocationInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.locationSearchSubject.next(query);
  }

  fetchLocationSuggestions(query: string): void {
    // Mock data since network calls are restricted
    const mockResults = [
      { display_name: "Paris, France", lat: "48.8566", lon: "2.3522" },
      { display_name: "Paris, Texas, USA", lat: "33.6609", lon: "-95.5555" },
      { display_name: "Paris, Ontario, Canada", lat: "43.2", lon: "-80.3833" },
      { display_name: "Paris, Illinois, USA", lat: "39.6111", lon: "-87.6961" },
      { display_name: "Paris, New York, USA", lat: "42.2279", lon: "-75.9846" }
    ].filter(result => result.display_name.toLowerCase().includes(query.toLowerCase()));

    this.locationSuggestions = mockResults;

    // Uncomment the following to use the actual Nominatim API in your environment

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`;
    this.http.get(url, {
      headers: { 'User-Agent': 'MedTrack/1.0 (your-email@example.com)' }
    }).subscribe({
      next: (results: any) => {
        this.locationSuggestions = results || [];
      },
      error: (err) => {
        console.error('Error fetching location suggestions:', err);
        this.locationSuggestions = [];
      }
    });

  }

  selectLocation(suggestion: any): void {
    this.userForm.get('location')?.setValue(suggestion.display_name);
    this.locationSuggestions = [];
    this.updateMap(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
  }
}