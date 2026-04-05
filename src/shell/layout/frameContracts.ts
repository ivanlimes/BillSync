export type ShellRegion = 'top-bar' | 'left-navigation' | 'center-workspace' | 'right-inspector';

export interface ShellOwnershipRule {
  region: ShellRegion;
  reservedForStep: 5;
  notes: string;
}

export const SHELL_OWNERSHIP_RULES: ShellOwnershipRule[] = [
  {
    region: 'top-bar',
    reservedForStep: 5,
    notes: 'Destination title, one dominant action, light global context, and utility access only.',
  },
  {
    region: 'left-navigation',
    reservedForStep: 5,
    notes: 'Top-level destination switching only.',
  },
  {
    region: 'center-workspace',
    reservedForStep: 5,
    notes: 'Current destination main task surface.',
  },
  {
    region: 'right-inspector',
    reservedForStep: 5,
    notes: 'Selected-bill details and supporting facts only.',
  },
];
