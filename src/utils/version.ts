import gitP from 'simple-git/promise';

import pkg from '../../package.json';

// Constants
const git = gitP();

// Types
export interface Version {
  version: string;
  commit: string | null;
}

// Utils
export async function version(): Promise<Version> {
  let commit: string | null = null;

  try {
    commit = await git.revparse(['--short', 'HEAD']);
  } catch (error) {} // eslint-disable-line no-empty

  return {
    version: pkg.version,
    commit
  };
}
