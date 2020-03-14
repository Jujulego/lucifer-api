import gitP from 'simple-git/promise';

import pkg from '../../package.json';

// Constants
const git = gitP();

// Utils
export async function version() {
  const commit = await git.revparse(['--short', 'HEAD']);

  return ({
    version: pkg.version,
    commit
  })
}
