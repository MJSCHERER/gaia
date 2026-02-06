export interface UserJwtPayload {
  id: string;
  email: string;
  role: 'GUEST' | 'ADMIN' | 'ARTIST' | 'COLLECTOR';
}
