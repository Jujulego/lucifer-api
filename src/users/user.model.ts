import { Daemon } from 'daemons/daemon.entity';

// Model
export type User = {
  id:         string;
  email:      string;
  name:       string;
  emailVerified?: boolean;
  nickname?:  string;
  username?:  string;
  givenName?: string;
  familyName?: string;
  createdAt?: string;
  updatedAt?: string;
  picture?:   string;
  lastIp?:    string;
  lastLogin?: string;
  blocked?:   boolean;
  daemons?:   Daemon[];
};
