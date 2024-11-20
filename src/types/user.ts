interface User {
  uid: string;
  username: string;
  email: string;
  createdAt: Date;
  rating: number;
  photoURL?: string;
}

export default User; 