import {
  Brain,
  Wind,
  Moon,
  Activity,
  Apple,
  Heart,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';

const map: Record<string, LucideIcon> = {
  Brain,
  Wind,
  Moon,
  Activity,
  Apple,
  Heart,
  Target,
  Users,
};

export function categoryIcon(name: string): LucideIcon {
  return map[name] ?? Heart;
}
