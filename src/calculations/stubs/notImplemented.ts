export function notImplementedInScaffold(featureName: string): never {
  throw new Error(`${featureName} is reserved for a later implementation step.`);
}
