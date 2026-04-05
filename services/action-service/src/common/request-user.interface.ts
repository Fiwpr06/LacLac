export interface RequestUser {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}
