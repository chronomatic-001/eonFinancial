// Common types used across components
export interface Feature {
  id: number;
  name: string;
  description: string;
}

export interface Stat {
  id: number;
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}