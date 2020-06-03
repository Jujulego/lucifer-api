// Models
export type User = {
  id:            string;
  email:         string;
  emailVerified: boolean;
  username?:     string;
  name?:         string;
  nickname?:     string;
  givenName?:    string;
  familyName?:   string;
  createdAt:     string;
  updatedAt?:    string;
  picture:       string;
  lastIp?:       string;
  lastLogin?:    string;
  blocked?:      boolean;
};
