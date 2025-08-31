const HPO_API_BASE_URL = process.env.NEXT_PUBLIC_HPO_API_BASE_URL;

export interface HPOPlayer {
  id: number;
  player_name: string;
  username: string;
  email?: string;
  phone: string;
  age_group?: string;
  gender?: string;
  province?: string;
  district?: string;
  points: number;
  games_played: number;
  games_won: number;
  win_rate: number;
  created_at: string;
}

export interface HPORegistrationData {
  player_name: string;
  username: string;
  email?: string;
  phone: string;
  password: string;
  password_confirm: string;
  age_group?: string;
  gender?: string;
  province?: string;
  district?: string;
}

export interface HPOLoginData {
  username: string;
  password: string;
}

export interface HPOAuthResponse {
  message: string;
  player: HPOPlayer;
  token: string;
}

export interface HPOErrorResponse {
  error: string;
  details?: any;
}

export class HPOAuthService {
  private static getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    return headers;
  }

  static async register(data: HPORegistrationData): Promise<HPOAuthResponse> {
    const response = await fetch(`${HPO_API_BASE_URL}/api/v1/auth/register/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Registration failed');
    }

    return responseData;
  }

  static async login(data: HPOLoginData): Promise<HPOAuthResponse> {
    const response = await fetch(`${HPO_API_BASE_URL}/api/v1/auth/login/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Login failed');
    }

    return responseData;
  }

  static async getProfile(token: string): Promise<HPOPlayer> {
    const response = await fetch(`${HPO_API_BASE_URL}/api/v1/auth/profile/`, {
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    return await response.json();
  }

  static async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${HPO_API_BASE_URL}/api/v1/auth/logout/`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return await response.json();
  }

  static async getAgeGroups(): Promise<{ age_groups: Array<{ value: string; label: string }> }> {
    const response = await fetch(`${HPO_API_BASE_URL}/api/v1/form-data/age-groups/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch age groups');
    }

    return await response.json();
  }

  static async getProvincesDistricts(): Promise<{ provinces: Array<{ province: string; districts: Array<{ value: string; label: string }> }> }> {
    const response = await fetch(`${HPO_API_BASE_URL}/api/v1/form-data/provinces-districts/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch provinces and districts');
    }

    return await response.json();
  }

  static async getGenders(): Promise<{ genders: Array<{ value: string; label: string }> }> {
    const response = await fetch(`${HPO_API_BASE_URL}/api/v1/form-data/genders/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch gender options');
    }

    return await response.json();
  }
}

// Token management utilities
export const TokenManager = {
  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hpo_auth_token', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hpo_auth_token');
    }
    return null;
  },

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hpo_auth_token');
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
