import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  roles: string;
  locked: number; // 0 = active, 1 = locked
  accountNonLocked?: boolean; // API response field
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private apiUrl = `${environment.baseUrl}auth`;
  users: UserInfo[] = [];
  filteredUsers: UserInfo[] = [];
  paginatedUsers: UserInfo[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedUser: UserInfo | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  Math = Math;

  // Form models
  newUser = {
    name: '',
    email: '',
    password: '',
    roles: 'ROLE_USER'
  };

  editUser = {
    username: '',
    email: '',
    roles: 'ROLE_USER'
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any[]>(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          // Transform API response: locked boolean (true/false) to number (1/0)
          this.users = response.map(user => ({
            ...user,
            locked: user.locked === true ? 1 : 0
          }));
          this.filteredUsers = this.users;
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load users';
          this.isLoading = false;
          console.error('Error loading users:', error);
        }
      });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(user =>
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  changeItemsPerPage(event: any): void {
    this.itemsPerPage = parseInt(event.target.value);
    this.currentPage = 1;
    this.updatePagination();
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  lockUser(username: string): void {
    this.http.post(`${this.apiUrl}/admin/lockuser`, { username }, { 
      headers: this.getHeaders(),
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        this.toastr.success(`User ${username} locked successfully`, 'Success');
        this.loadUsers();
      },
      error: (error) => {
        this.toastr.error('Failed to lock user', 'Error');
        console.error('Error:', error);
      }
    });
  }

  unlockUser(username: string): void {
    this.http.post(`${this.apiUrl}/admin/unlockuser`, { username }, { 
      headers: this.getHeaders(),
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        this.toastr.success(`User ${username} unlocked successfully`, 'Success');
        this.loadUsers();
      },
      error: (error) => {
        this.toastr.error('Failed to unlock user', 'Error');
        console.error('Error:', error);
      }
    });
  }

  deleteUser(username: string): void {
    if (!confirm(`Are you sure you want to DELETE user: ${username}? This action cannot be undone!`)) return;

    this.http.delete(`${this.apiUrl}/admin/${username}`, { 
      headers: this.getHeaders(),
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        this.toastr.success(`User ${username} deleted successfully`, 'Success');
        this.loadUsers();
      },
      error: (error) => {
        this.toastr.error('Failed to delete user', 'Error');
        console.error('Error:', error);
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newUser = { name: '', email: '', password: '', roles: 'ROLE_USER' };
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addUser(): void {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      this.toastr.warning('Please fill in all fields', 'Validation');
      return;
    }

    this.http.post(`${this.apiUrl}/addNewUser`, this.newUser, { 
      headers: this.getHeaders(),
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        this.toastr.success('User added successfully', 'Success');
        this.closeAddModal();
        this.loadUsers();
      },
      error: (error) => {
        this.toastr.error(error.error || 'Failed to add user', 'Error');
        console.error('Error:', error);
      }
    });
  }

  openEditModal(user: UserInfo): void {
    this.selectedUser = user;
    this.editUser = {
      username: user.name,
      email: user.email,
      roles: user.roles
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  updateUser(): void {
    if (!this.editUser.email) {
      this.toastr.warning('Please fill in all fields', 'Validation');
      return;
    }

    this.http.put(`${this.apiUrl}/admin/update-user`, this.editUser, { 
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        this.toastr.success('User updated successfully', 'Success');
        this.closeEditModal();
        this.loadUsers();
      },
      error: (error) => {
        this.toastr.error('Failed to update user', 'Error');
        console.error('Error:', error);
      }
    });
  }
}
