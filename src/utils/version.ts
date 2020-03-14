import gitP from 'simple-git/promise';

import pkg from '../../package.json';

// Constants
const git = gitP();

// Utils
export async function version() {
  let commit: string | undefined = undefined;

  try {
    commit = await git.revparse(['--short', 'HEAD']);
  } catch (error) {}

  return ({
    version: pkg.version,
    commit
  });
}
