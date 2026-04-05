export interface ThemeContract {
  spacingScale: readonly number[];
  spacing: Record<string, number>;
  typographyFamily: string;
  typography: {
    sizes: Record<string, number>;
    lineHeights: Record<string, number>;
    weights: Record<string, number>;
  };
  radius: {
    panel: number;
    control: number;
    modal: number;
  };
  colors: Record<string, string>;
}
