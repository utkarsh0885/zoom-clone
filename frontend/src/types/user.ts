export interface User {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface AuthResponseData {
  access_token: string;
  token_type: string;
  user: User;
}
