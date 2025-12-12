import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { isPlatformBrowser } from '@angular/common';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  roles: string;
  accountNonLocked: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private apiUrl = 'http://localhost:8080/auth';
  users: UserInfo[] = [];
  filteredUsers: UserInfo[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedUser: UserInfo | null = null;

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

    this.http.get<UserInfo[]>(`${this.apiUrl}/admin/users`, { headers: this.getHeaders() })
      .subscribe({
        next: (users) => {
          this.users = users;
          this.filteredUsers = users;
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
  }

  lockUser(username: string): void {
    if (!confirm(`Are you sure you want to lock user: ${username}?`)) return;

    this.http.post(`${this.apiUrl}/admin/lockuser`, { username }, { 
      headers: this.getHeaders(),
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        alert(response);
        this.loadUsers();
      },
      error: (error) => {
        alert('Failed to lock user');
        console.error('Error:', error);
      }
    });
  }

  unlockUser(username: string): void {
    if (!confirm(`Are you sure you want to unlock user: ${username}?`)) return;

    this.http.post(`${this.apiUrl}/admin/unlockuser`, { username }, { 
      headers: this.getHeaders(),
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        alert(response);
        this.loadUsers();
      },
      error: (error) => {
        alert('Failed to unlock user');
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
        alert(response);
        this.loadUsers();
      },
      error: (error) => {
        alert('Failed to delete user');
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
      alert('Please fill in all fields');
      return;
    }

    this.http.post(`${this.apiUrl}/addNewUser`, this.newUser, { 
      headers: this.getHeaders(),
      responseType: 'text'
    }).subscribe({
      next: (response) => {
        alert(response);
        this.closeAddModal();
        this.loadUsers();
      },
      error: (error) => {
        alert(error.error || 'Failed to add user');
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
      alert('Please fill in all fields');
      return;
    }

    this.http.put(`${this.apiUrl}/admin/update-user`, this.editUser, { 
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        alert('User updated successfully');
        this.closeEditModal();
        this.loadUsers();
      },
      error: (error) => {
        alert('Failed to update user');
        console.error('Error:', error);
      }
    });
  }
}
