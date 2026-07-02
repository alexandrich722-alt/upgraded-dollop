// NOVA Life OS — Marketplace Products

import type { MarketplaceProduct } from '../types';

export const marketplaceProducts: MarketplaceProduct[] = [
  {
    id: 'mp-founder-os',
    title: 'Founder OS',
    description: 'Complete operating system for founders, indie hackers, and creators. Turn your startup into a system: goals, projects, habits, quests, and mentors calibrated for shipping and growing.',
    category: 'Business & Founder',
    duration: 'Ongoing',
    difficulty: 'Advanced',
    icon: 'Rocket',
    color: 'cyan',
    permissions: ['goals', 'projects', 'tasks', 'habits', 'finance', 'journal'],
    preview: { goals: 4, projects: 3, tasks: 8, habits: 3, quests: 3, mentors: 4, skills: 5, protocols: 4 },
    adaptationQuestions: [
      'What is your startup or project name?',
      'What is your North Star Metric?',
      'How many users do you have now?',
      'What is your biggest bottleneck right now?',
    ],
    installData: {
      goals: [
        { title: 'Ship MVP', description: 'Launch minimum viable product', category: 'Business', priority: 'critical', progress: 0, milestones: [{ id: 'f1', title: 'Define MVP scope', done: false }, { id: 'f2', title: 'Build core feature', done: false }, { id: 'f3', title: 'Deploy', done: false }] },
        { title: 'Get first 10 users', description: 'Onboard 10 beta users', category: 'Growth', priority: 'high', progress: 0 },
        { title: 'First $100 revenue', description: 'Earn first $100 online', category: 'Revenue', priority: 'high', progress: 0 },
        { title: 'Talk to 25 users', description: 'Conduct 25 customer interviews', category: 'Research', priority: 'medium', progress: 0 },
      ],
      projects: [
        { title: 'Product', description: 'Core product development', category: 'Product', priority: 'critical', progress: 0 },
        { title: 'Marketing', description: 'Distribution and content', category: 'Marketing', priority: 'high', progress: 0 },
        { title: 'Sales', description: 'Outbound and conversions', category: 'Sales', priority: 'high', progress: 0 },
      ],
      tasks: [
        { title: 'Define your user persona', priority: 'high', estimatedMinutes: 30, energyLevel: 'medium' },
        { title: 'Write down the #1 pain you solve', priority: 'critical', estimatedMinutes: 15, energyLevel: 'low' },
        { title: 'List 10 potential users', priority: 'high', estimatedMinutes: 20, energyLevel: 'low' },
        { title: 'Send 5 outreach messages', priority: 'high', estimatedMinutes: 30, energyLevel: 'medium' },
        { title: 'Define MVP feature list (max 3)', priority: 'critical', estimatedMinutes: 45, energyLevel: 'high' },
        { title: 'Set up analytics', priority: 'medium', estimatedMinutes: 60, energyLevel: 'medium' },
        { title: 'Write landing page copy', priority: 'medium', estimatedMinutes: 90, energyLevel: 'high' },
        { title: 'Plan 45-min MVP core session', priority: 'high', estimatedMinutes: 45, energyLevel: 'high' },
      ],
      habits: [
        { title: 'Daily Shipping', description: 'Ship one thing every day', category: 'Productivity', frequency: 'daily', target: 1 },
        { title: 'Talk to User', description: 'Talk to 1 user daily', category: 'Growth', frequency: 'daily', target: 1 },
        { title: 'Metrics Check', description: 'Review key metrics daily', category: 'Business', frequency: 'daily', target: 1 },
      ],
      quests: [
        { title: '30-Day MVP Launch', description: 'Ship your MVP in 30 days', duration: 30, xpReward: 500, stages: [{ title: 'Week 1: Core', done: false }, { title: 'Week 2: Polish', done: false }, { title: 'Week 3: Deploy', done: false }, { title: 'Week 4: Beta', done: false }], dailyMissions: ['Ship one thing', 'Log progress'] },
        { title: 'First 10 Users', description: 'Get your first 10 beta users', duration: 14, xpReward: 300, stages: [{ title: 'List 20', done: false }, { title: 'Message 10', done: false }, { title: 'Onboard 10', done: false }], dailyMissions: ['Message 1 person'] },
        { title: 'First $100', description: 'Earn your first $100 online', duration: 30, xpReward: 400, stages: [{ title: 'Define offer', done: false }, { title: 'First sale', done: false }], dailyMissions: ['Work on revenue'] },
      ],
      mentors: [
        { name: 'Ruthless Operator', persona: 'No-nonsense executioner', tone: 'Direct, sharp', domain: 'Execution', rules: ['Always propose next action', 'Cut the non-essential'], dataAccess: ['tasks', 'goals', 'projects'], trustLevel: 3, unlockableQuotes: ['Done is better than perfect. Ship it.'] },
        { name: 'YC Partner', persona: 'Startup accelerator partner', tone: 'Challenging, direct', domain: 'Strategy', rules: ['Talk to users', 'Ship fast', 'Do things that don\'t scale'], dataAccess: ['goals', 'projects'], trustLevel: 3, unlockableQuotes: ['Make something people want.', 'Do things that don\'t scale.'] },
        { name: 'CFO', persona: 'Financial analyst', tone: 'Analytical', domain: 'Finance', rules: ['Track everything', 'Question every expense'], dataAccess: ['finance'], trustLevel: 2, unlockableQuotes: ['You can\'t manage what you don\'t measure.'] },
        { name: 'Product Strategist', persona: 'Product expert', tone: 'Thoughtful, user-focused', domain: 'Product', rules: ['User first', 'Data over opinions', 'Ship to learn'], dataAccess: ['projects', 'tasks'], trustLevel: 2, unlockableQuotes: ['Fall in love with the problem, not the solution.'] },
      ],
      skills: [
        { title: 'Idea Validation', description: 'Validate before building', category: 'Founder', level: 1, xp: 0, practices: ['Talk to 10 users', 'Define the problem'], unlocks: ['MVP Building'] },
        { title: 'MVP Building', description: 'Ship MVPs fast', category: 'Founder', level: 1, xp: 0, practices: ['Ship in 7 days', 'Cut features'], prerequisites: [], unlocks: ['Sales'] },
        { title: 'Sales', description: 'Sell to first customers', category: 'Founder', level: 1, xp: 0, practices: ['Send 20 messages', '3 customer interviews'], prerequisites: [], unlocks: ['Growth'] },
        { title: 'Growth', description: 'Grow user base', category: 'Founder', level: 1, xp: 0, practices: ['Define channel', 'Run experiments'], prerequisites: [], unlocks: ['Leadership'] },
        { title: 'Leadership', description: 'Lead a team', category: 'Founder', level: 1, xp: 0, practices: ['Delegate', 'Set vision'], prerequisites: [], unlocks: [] },
      ],
      protocols: [
        { name: 'Idea Validation', steps: ['Who is the user?', 'What is the pain?', 'Is there demand?', 'Can I test without building?'], category: 'Founder' },
        { name: 'Feature Decision', steps: ['Who is the user?', 'What is the pain?', 'Does it affect North Star?', 'Can I test without building?', 'What do I remove?'], category: 'Founder' },
        { name: 'Outreach Protocol', steps: ['Identify target', 'Find their channel', 'Write short message', 'Follow up in 3 days'], category: 'Founder' },
        { name: 'Weekly Review', steps: ['Review goals progress', 'Check metrics', 'List wins and blockers', 'Plan next week'], category: 'Founder' },
      ],
    },
    firstMission: ['Formulate the user pain you solve', 'List 10 potential users', 'Plan 45 minutes for MVP core session'],
    featured: true,
  },
  {
    id: 'mp-student-os',
    title: 'Student OS',
    description: 'Turn your studies into a system. Manage subjects as projects, track exams, use spaced repetition, and sprint through your thesis with AI-powered study protocols.',
    category: 'Study & Learning',
    duration: 'Semester',
    difficulty: 'Intermediate',
    icon: 'GraduationCap',
    color: 'blue',
    permissions: ['goals', 'projects', 'tasks', 'habits', 'journal'],
    preview: { goals: 3, projects: 4, tasks: 6, habits: 4, quests: 2, mentors: 1, skills: 3, protocols: 3 },
    adaptationQuestions: ['What are you studying?', 'When is your next exam?', 'What is your biggest academic challenge?'],
    installData: {
      goals: [
        { title: 'Pass all exams', description: 'Pass every exam this semester', category: 'Academic', priority: 'critical', progress: 0 },
        { title: 'Finish thesis', description: 'Complete and submit thesis', category: 'Academic', priority: 'high', progress: 0 },
        { title: 'Build study habit', description: 'Study consistently every day', category: 'Academic', priority: 'medium', progress: 0 },
      ],
      projects: [
        { title: 'Math', description: 'Mathematics course', category: 'Subject', priority: 'high', progress: 0 },
        { title: 'Computer Science', description: 'CS course', category: 'Subject', priority: 'high', progress: 0 },
        { title: 'Thesis', description: 'Thesis project', category: 'Academic', priority: 'critical', progress: 0 },
        { title: 'Exam Prep', description: 'Final exam preparation', category: 'Academic', priority: 'high', progress: 0 },
      ],
      tasks: [
        { title: 'Review lecture notes', priority: 'medium', estimatedMinutes: 30, energyLevel: 'medium' },
        { title: 'Complete problem set', priority: 'high', estimatedMinutes: 60, energyLevel: 'high' },
        { title: 'Read chapter 5', priority: 'medium', estimatedMinutes: 45, energyLevel: 'medium' },
        { title: 'Write thesis outline', priority: 'critical', estimatedMinutes: 90, energyLevel: 'high' },
        { title: 'Practice past exam', priority: 'high', estimatedMinutes: 120, energyLevel: 'high' },
        { title: 'Spaced repetition review', priority: 'medium', estimatedMinutes: 20, energyLevel: 'low' },
      ],
      habits: [
        { title: 'Daily study session', description: 'Study for 2 hours', category: 'Academic', frequency: 'daily', target: 1 },
        { title: 'Spaced repetition', description: 'Review flashcards', category: 'Academic', frequency: 'daily', target: 1 },
        { title: 'Lecture notes review', description: 'Review notes same day', category: 'Academic', frequency: 'daily', target: 1 },
        { title: 'Sleep 7 hours', description: 'Get enough sleep', category: 'Health', frequency: 'daily', target: 1 },
      ],
      quests: [
        { title: 'Thesis Sprint', description: 'Sprint through your thesis in 14 days', duration: 14, xpReward: 400, stages: [{ title: 'Outline', done: false }, { title: 'First draft', done: false }, { title: 'Revision', done: false }, { title: 'Submit', done: false }], dailyMissions: ['Write 500 words'] },
        { title: 'Exam Prep Quest', description: 'Prepare for final exams in 7 days', duration: 7, xpReward: 300, stages: [{ title: 'Review all notes', done: false }, { title: 'Practice exams', done: false }, { title: 'Final review', done: false }], dailyMissions: ['Study 3 hours'] },
      ],
      mentors: [
        { name: 'Strict Professor', persona: 'Demanding but fair academic', tone: 'Rigorous, encouraging', domain: 'Academic', rules: ['No excuses', 'Show your work', 'Review daily'], dataAccess: ['tasks', 'goals', 'projects'], trustLevel: 3, unlockableQuotes: ['Excellence is a habit, not an act.'] },
      ],
      skills: [
        { title: 'Spaced Repetition', description: 'Master spaced repetition', category: 'Learning', level: 1, xp: 0, practices: ['Daily review', 'Active recall'], unlocks: ['Speed Reading'] },
        { title: 'Active Recall', description: 'Test yourself to learn', category: 'Learning', level: 1, xp: 0, practices: ['Flashcards', 'Practice tests'], unlocks: ['Deep Understanding'] },
        { title: 'Time Management', description: 'Manage study time', category: 'Learning', level: 1, xp: 0, practices: ['Pomodoro', 'Time blocking'], unlocks: [] },
      ],
      protocols: [
        { name: 'Study Session', steps: ['Set goal for session', 'Remove distractions', 'Study 25 min', 'Break 5 min', 'Review what you learned'], category: 'Study' },
        { name: 'Exam Prep', steps: ['List all topics', 'Prioritize by weight', 'Practice past exams', 'Review weak areas', 'Final review night before'], category: 'Study' },
        { name: 'Thesis Sprint', steps: ['Define scope', 'Write outline', 'Daily writing goal', 'Weekly review with advisor', 'Edit and polish'], category: 'Academic' },
      ],
    },
    firstMission: ['List all your subjects as projects', 'Set your next exam date', 'Plan a 2-hour study session for today'],
    featured: true,
  },
  {
    id: 'mp-money-reset',
    title: 'Money Reset',
    description: 'Take control of your finances. Track every expense, hunt subscriptions, crush debt, and build an emergency fund. Includes spending decision protocol and no-spend challenge.',
    category: 'Money & Finance',
    duration: '30 days',
    difficulty: 'Intermediate',
    icon: 'DollarSign',
    color: 'emerald',
    permissions: ['finance', 'goals', 'habits', 'tasks'],
    preview: { goals: 3, projects: 1, tasks: 5, habits: 3, quests: 2, mentors: 1, skills: 2, protocols: 2 },
    adaptationQuestions: ['What is your monthly income?', 'What is your biggest financial stress?', 'How much debt do you have?'],
    installData: {
      goals: [
        { title: 'Build emergency fund', description: 'Save 3 months of expenses', category: 'Finance', priority: 'high', progress: 0 },
        { title: 'Pay off all debt', description: 'Become debt-free', category: 'Finance', priority: 'critical', progress: 0 },
        { title: 'Track every expense', description: 'Log 100% of expenses for 30 days', category: 'Finance', priority: 'high', progress: 0 },
      ],
      projects: [
        { title: 'Money Control Center', description: 'Your financial command center', category: 'Finance', priority: 'critical', progress: 0 },
      ],
      tasks: [
        { title: 'List all subscriptions', priority: 'high', estimatedMinutes: 30, energyLevel: 'low' },
        { title: 'Cancel 1 unused subscription', priority: 'high', estimatedMinutes: 15, energyLevel: 'low' },
        { title: 'Set monthly budget', priority: 'critical', estimatedMinutes: 20, energyLevel: 'medium' },
        { title: 'List all debts', priority: 'critical', estimatedMinutes: 30, energyLevel: 'medium' },
        { title: 'Open savings account', priority: 'medium', estimatedMinutes: 30, energyLevel: 'low' },
      ],
      habits: [
        { title: 'Log every expense', description: 'Track 100% of spending', category: 'Finance', frequency: 'daily', target: 1 },
        { title: 'Daily finance check', description: 'Review spending daily', category: 'Finance', frequency: 'daily', target: 1 },
        { title: 'No-spend days', description: 'Days with zero spending', category: 'Finance', frequency: 'weekly', target: 3 },
      ],
      quests: [
        { title: 'No-Spend Challenge', description: '7 days of zero non-essential spending', duration: 7, xpReward: 200, stages: [{ title: 'Day 1-2', done: false }, { title: 'Day 3-5', done: false }, { title: 'Day 6-7', done: false }], dailyMissions: ['Log $0 spent'] },
        { title: 'Subscription Hunt', description: 'Audit and cut all unused subscriptions', duration: 3, xpReward: 150, stages: [{ title: 'List all subs', done: false }, { title: 'Cancel unused', done: false }], dailyMissions: ['Cancel 1 subscription'] },
      ],
      mentors: [
        { name: 'CFO', persona: 'Financial analyst', tone: 'Analytical, precise', domain: 'Finance', rules: ['Track everything', 'Question every expense', 'Build the buffer'], dataAccess: ['finance'], trustLevel: 2, unlockableQuotes: ['You can\'t manage what you don\'t measure.', 'Pay yourself first.'] },
      ],
      skills: [
        { title: 'Expense Tracking', description: 'Track every expense', category: 'Finance', level: 1, xp: 0, practices: ['Log daily', 'Review weekly'], unlocks: ['Budgeting'] },
        { title: 'Budgeting', description: 'Create and stick to a budget', category: 'Finance', level: 1, xp: 0, practices: ['Set limits', 'Review monthly'], unlocks: ['Investing'] },
      ],
      protocols: [
        { name: 'Spending Decision', steps: ['Is this a need or impulse?', 'Is it connected to a goal?', 'Can I wait 24 hours?', 'How does it affect my daily limit?', 'What do I lose if I buy this?'], category: 'Finance' },
        { name: 'Weekly Finance Review', steps: ['Total expenses this week', 'Compare to budget', 'Identify overspending', 'Plan next week', 'Update savings'], category: 'Finance' },
      ],
    },
    firstMission: ['List all your active subscriptions', 'Set your monthly budget', 'Log today\'s expenses'],
    featured: true,
  },
  {
    id: 'mp-burnout-recovery',
    title: 'Burnout Recovery',
    description: 'A gentle system for recovering from burnout. Low energy day protocols, evening shutdown, boundary week, digital sunset, and a calm mentor to guide you back to balance.',
    category: 'Mental Clarity & Recovery',
    duration: '4 weeks',
    difficulty: 'Gentle',
    icon: 'HeartPulse',
    color: 'rose',
    permissions: ['habits', 'journal', 'reflections', 'tasks'],
    preview: { goals: 2, projects: 1, tasks: 4, habits: 4, quests: 1, mentors: 1, skills: 2, protocols: 3 },
    adaptationQuestions: ['How burned out do you feel (1-10)?', 'What is draining you most right now?', 'How much sleep are you getting?'],
    installData: {
      goals: [
        { title: 'Recover from burnout', description: 'Return to sustainable energy levels', category: 'Recovery', priority: 'critical', progress: 0 },
        { title: 'Build sustainable rhythm', description: 'Create a life rhythm that prevents burnout', category: 'Recovery', priority: 'high', progress: 0 },
      ],
      projects: [
        { title: 'Recovery Center', description: 'Your burnout recovery hub', category: 'Recovery', priority: 'critical', progress: 0 },
      ],
      tasks: [
        { title: 'Set work boundaries', priority: 'high', estimatedMinutes: 30, energyLevel: 'low' },
        { title: 'Plan a rest day', priority: 'high', estimatedMinutes: 15, energyLevel: 'low' },
        { title: 'Reduce commitments list', priority: 'medium', estimatedMinutes: 30, energyLevel: 'low' },
        { title: 'Schedule digital sunset', priority: 'medium', estimatedMinutes: 10, energyLevel: 'low' },
      ],
      habits: [
        { title: 'Evening shutdown', description: 'Close the day properly', category: 'Recovery', frequency: 'daily', target: 1 },
        { title: 'Digital sunset', description: 'No screens 1 hour before bed', category: 'Recovery', frequency: 'daily', target: 1 },
        { title: 'Daily walk', description: '20-minute walk outside', category: 'Recovery', frequency: 'daily', target: 1 },
        { title: 'Sleep 8 hours', description: 'Prioritize sleep', category: 'Recovery', frequency: 'daily', target: 1 },
      ],
      quests: [
        { title: 'Boundary Week', description: '7 days of strict work boundaries', duration: 7, xpReward: 200, stages: [{ title: 'Set boundaries', done: false }, { title: 'Enforce daily', done: false }, { title: 'Review', done: false }], dailyMissions: ['Stop work on time'] },
      ],
      mentors: [
        { name: 'Calm Mentor', persona: 'Gentle recovery guide', tone: 'Warm, supportive', domain: 'Recovery', rules: ['Watch for burnout', 'Reduce load when needed', 'Small wins matter'], dataAccess: ['reflections', 'habits', 'dailyNotes'], trustLevel: 2, unlockableQuotes: ['Rest is not the opposite of work. It\'s part of it.', 'One small step is still a step.'] },
      ],
      skills: [
        { title: 'Boundary Setting', description: 'Set and maintain healthy boundaries', category: 'Emotional Regulation', level: 1, xp: 0, practices: ['Say no', 'Protect time'], unlocks: ['Self-Compassion'] },
        { title: 'Self-Compassion', description: 'Be kind to yourself', category: 'Emotional Regulation', level: 1, xp: 0, practices: ['Acknowledge effort', 'No harsh self-talk'], unlocks: [] },
      ],
      protocols: [
        { name: 'Low Energy Day', steps: ['Reduce plan to 1 task', 'Keep only critical items', 'Add recovery time', 'No big decisions', 'Get one small win'], category: 'Recovery' },
        { name: 'Evening Shutdown', steps: ['Close all tabs', 'Write 3 facts about the day', 'Move unfinished to tomorrow', 'Prepare tomorrow\'s first step', 'Set phone away'], category: 'Recovery' },
        { name: 'Digital Sunset', steps: ['Set a screen-off time', 'Switch to analog activities', 'Read or journal', 'Dim lights', 'Sleep'], category: 'Recovery' },
      ],
    },
    firstMission: ['Assess your energy (1-10)', 'Pick 1 gentle task for today', 'Schedule your evening shutdown'],
    featured: true,
  },
  {
    id: 'mp-deep-work-pack',
    title: 'Deep Work Pack',
    description: 'Master focused, distraction-free work. Protocols for 90-minute deep work sessions, attention management, and flow state. For creators, developers, and knowledge workers.',
    category: 'Productivity & Focus',
    duration: 'Ongoing',
    difficulty: 'Advanced',
    icon: 'Brain',
    color: 'violet',
    permissions: ['habits', 'tasks', 'goals', 'journal'],
    preview: { goals: 2, projects: 1, tasks: 4, habits: 3, quests: 2, mentors: 1, skills: 3, protocols: 2 },
    adaptationQuestions: ['What is your biggest distraction?', 'How many hours of deep work do you get now?', 'What time of day is your focus best?'],
    installData: {
      goals: [
        { title: 'Master deep work', description: 'Consistently do 4 hours of deep work daily', category: 'Focus', priority: 'high', progress: 0 },
        { title: 'Eliminate distractions', description: 'Remove all major focus blockers', category: 'Focus', priority: 'high', progress: 0 },
      ],
      projects: [
        { title: 'Focus System', description: 'Your deep work infrastructure', category: 'Productivity', priority: 'high', progress: 0 },
      ],
      tasks: [
        { title: 'Identify your top 3 distractions', priority: 'high', estimatedMinutes: 20, energyLevel: 'low' },
        { title: 'Set up website blocker', priority: 'medium', estimatedMinutes: 30, energyLevel: 'low' },
        { title: 'Block 90-min focus slot', priority: 'critical', estimatedMinutes: 10, energyLevel: 'low' },
        { title: 'Create phone-free zone', priority: 'high', estimatedMinutes: 15, energyLevel: 'low' },
      ],
      habits: [
        { title: 'Daily deep work', description: '90 minutes of focused work', category: 'Focus', frequency: 'daily', target: 1 },
        { title: 'No phone first hour', description: 'No phone for first hour of day', category: 'Focus', frequency: 'daily', target: 1 },
        { title: 'Focus session log', description: 'Log each deep work session', category: 'Focus', frequency: 'daily', target: 1 },
      ],
      quests: [
        { title: 'Deep Work Monk', description: '14 days of 4+ hours deep work', duration: 14, xpReward: 400, stages: [{ title: 'Days 1-5', done: false }, { title: 'Days 6-10', done: false }, { title: 'Days 11-14', done: false }], dailyMissions: ['4 hours deep work'] },
        { title: 'Anti-Procrastination Quest', description: '7 days of zero procrastination', duration: 7, xpReward: 250, stages: [{ title: 'Identify triggers', done: false }, { title: 'Build system', done: false }, { title: 'Execute', done: false }], dailyMissions: ['Start within 5 min'] },
      ],
      mentors: [
        { name: 'Ruthless Operator', persona: 'No-nonsense executioner', tone: 'Direct, sharp', domain: 'Execution', rules: ['Always propose next action', 'Cut the non-essential', 'No excuses'], dataAccess: ['tasks', 'goals'], trustLevel: 3, unlockableQuotes: ['Done is better than perfect. Ship it.'] },
      ],
      skills: [
        { title: 'Deep Work', description: 'Sustained focused work', category: 'Focus', level: 1, xp: 0, practices: ['90-min blocks', 'No phone'], unlocks: ['Flow State'] },
        { title: 'Attention Control', description: 'Manage your attention', category: 'Focus', level: 1, xp: 0, practices: ['Meditation', 'Single-tasking'], unlocks: ['Flow State'] },
        { title: 'Flow State', description: 'Enter flow on command', category: 'Focus', level: 1, xp: 0, practices: ['Clear goal', 'Immediate feedback', 'Match skill to challenge'], unlocks: [] },
      ],
      protocols: [
        { name: 'Deep Work Session', steps: ['Set clear goal', 'Remove all distractions', 'Set timer 90 min', 'Work without interruption', 'Log the session'], category: 'Focus' },
        { name: 'Anti-Procrastination', steps: ['Identify the task', 'Set 5-minute timer', 'Start — just begin', 'Continue for 25 min', 'Assess and continue'], category: 'Focus' },
      ],
    },
    firstMission: ['Identify your top 3 distractions', 'Block a 90-minute focus slot today', 'Do one deep work session'],
    featured: false,
  },
];

export const marketplaceCategories = [
  'Business & Founder',
  'Study & Learning',
  'Health & Fitness',
  'Money & Finance',
  'Mental Clarity & Recovery',
  'Productivity & Focus',
  'Relationships & Social Life',
  'Creator & Content',
  'Philosophy / Identity',
];
