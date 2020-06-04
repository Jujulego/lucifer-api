import { IDaemon } from 'daemons/daemon.entity';

// Model
export type User = {
  id:         string;
  email:      string;
  emailVerified: boolean;
  name:       string;
  nickname:   string;
  username?:  string;
  givenName?: string;
  familyName?: string;
  createdAt?: string;
  updatedAt?: string;
  picture:    string;
  lastIp?:    string;
  lastLogin?: string;
  blocked?:   boolean;
  daemons?:   IDaemon[];
};
