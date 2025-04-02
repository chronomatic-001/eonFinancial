import { Users, Star, Shield } from 'lucide-react';
import { Feature, Stat } from '../types';

// Stats for social proof
export const stats: Stat[] = [
  { id: 1, name: 'Waitlist Joined', value: '1K+', icon: Users },
  { id: 2, name: 'Customer Rating', value: '4.9/5', icon: Star },
  { id: 3, name: 'Bank-grade Security', value: '100%', icon: Shield },
];

// Combined pain points from both savings and banking
export const sparkSavings: Feature[] = [
  {
    id: 1,
    name: 'Cashback to Savings',
    description:
      'Every dollar you spend earns cashback points, which are automatically deposited into your savings account to earn interest. It will spark your Savings!',
  },
  {
    id: 2,
    name: 'Wise Debt Management',
    description:
      'Debt is a part of modern life—credit cards, mortgages, and student loans can be valuable financial tools when managed wisely. However, mismanagement can result in challenges.',
  },
  {
    id: 3,
    name: 'Smart Spending Management',
    description:
      'Seal your spending leaks! For example, we uncovers unnecessary subscriptions. Or automates bill payments, categorize spending into Want vs. Need.',
  },
  {
    id: 4,
    name: 'Cost Saving Notification',
    description:
      'Receive instant notifications on sales items as soon as you walk-in to grocery stores in our partnership (and it earns more points too). Or when you drive into random gas station, what if you receive notifications about nearby gas stations offering cheaper prices.',
  },
];
