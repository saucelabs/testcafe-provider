import { rcompare, coerce } from 'semver';

export function rcompareVersions(versionA: string, versionB: string) {
  const semVerA = coerce(versionA);
  const semVerB = coerce(versionB);

  if (semVerA && semVerB) {
    return rcompare(semVerA, semVerB);
  }

  // NOTE: Satisfy reflexivity requirement
  if (versionA === versionB) {
    return 0;
  }

  if (!semVerA) {
    // NOTE: Bubble up 'dev' and 'beta'
    if (versionA === 'dev' || (versionA === 'beta' && versionB !== 'dev')) {
      return -1;
    }
    // NOTE: Bubble down everything else
    return 1;
  }
  if (!semVerB) {
    // NOTE: Bubble up 'dev' and 'beta'
    if (versionB === 'dev' || (versionB === 'beta' && versionA !== 'dev')) {
      return 1;
    }
    // NOTE: Bubble down everything else
    return -1;
  }
  return 0;
}
