export interface User {
  id: string;
  name: string;
  email: string;
  rating: number;
  profileImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
}
