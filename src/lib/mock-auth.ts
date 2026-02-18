// Mock authentication for UI development
// This will be replaced with real Supabase auth later

export interface MockUser {
  id: string;
  email: string;
  createdAt: Date;
}

export interface MockAuthState {
  user: MockUser | null;
  isLoading: boolean;
  error: string | null;
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockAuth {
  private user: MockUser | null = null;
  private listeners: Array<(state: MockAuthState) => void> = [];

  constructor() {
    // Check if user exists in localStorage on initialization
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mock-auth-user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
        }
      }
    }
  }

  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach(listener => listener(state));
  }

  getState(): MockAuthState {
    return {
      user: this.user,
      isLoading: false,
      error: null,
    };
  }

  subscribe(listener: (state: MockAuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async signUp(email: string, password: string): Promise<MockUser> {
    await delay(1000); // Simulate network delay

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = localStorage.getItem(`mock-auth-user-${email}`);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const user: MockUser = {
      id: `user_${Date.now()}`,
      email,
      createdAt: new Date(),
    };

    // Store user in localStorage
    localStorage.setItem('mock-auth-user', JSON.stringify(user));
    localStorage.setItem(`mock-auth-user-${email}`, JSON.stringify(user));

    this.user = user;
    this.notifyListeners();

    return user;
  }

  async signIn(email: string, password: string): Promise<MockUser> {
    await delay(1000); // Simulate network delay

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Check if user exists
    const storedUser = localStorage.getItem(`mock-auth-user-${email}`);
    if (!storedUser) {
      // Don't reveal whether email exists for security
      throw new Error('Invalid email or password');
    }

    const user = JSON.parse(storedUser);

    // In real app, we'd verify password hash here
    // For mock, we'll just check if password is not empty
    if (!password) {
      throw new Error('Invalid email or password');
    }

    // Update localStorage with current user
    localStorage.setItem('mock-auth-user', JSON.stringify(user));

    this.user = user;
    this.notifyListeners();

    return user;
  }

  async signOut(): Promise<void> {
    await delay(500); // Simulate network delay

    localStorage.removeItem('mock-auth-user');
    this.user = null;
    this.notifyListeners();
  }

  async resetPassword(email: string): Promise<void> {
    await delay(1000); // Simulate network delay

    if (!email) {
      throw new Error('Email is required');
    }

    // Check if user exists
    const storedUser = localStorage.getItem(`mock-auth-user-${email}`);
    if (!storedUser) {
      // Don't reveal whether email exists for security
      return; // Silently succeed for security
    }

    // In a real app, we'd send an email here
    console.log(`Password reset email sent to ${email}`);
  }

  async updateEmail(newEmail: string, password: string): Promise<MockUser> {
    await delay(1000); // Simulate network delay

    if (!this.user) {
      throw new Error('Not authenticated');
    }

    if (!newEmail || !password) {
      throw new Error('New email and password are required');
    }

    // Check if new email already exists
    const existingUser = localStorage.getItem(`mock-auth-user-${newEmail}`);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Remove old user record
    localStorage.removeItem(`mock-auth-user-${this.user.email}`);

    // Update user
    const updatedUser = {
      ...this.user,
      email: newEmail,
    };

    // Store updated user
    localStorage.setItem('mock-auth-user', JSON.stringify(updatedUser));
    localStorage.setItem(`mock-auth-user-${newEmail}`, JSON.stringify(updatedUser));

    this.user = updatedUser;
    this.notifyListeners();

    return updatedUser;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await delay(1000); // Simulate network delay

    if (!this.user) {
      throw new Error('Not authenticated');
    }

    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }

    // In real app, we'd verify current password hash here
    // For mock, we'll just check if currentPassword is not empty
    if (!currentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Password updated successfully
    console.log(`Password updated for user ${this.user.email}`);
  }
}

// Create singleton instance
export const mockAuth = new MockAuth();