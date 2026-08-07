export interface AchievementDef {
  id: string
  title: string
  description: string
}

/* Nine achievements: triggers per dev notes p012 (v2). */
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-word', title: 'First Signal', description: 'Complete your first word' },
  { id: 'hat-trick', title: 'Hat Trick', description: 'Three perfect letters in a row' },
  { id: 'no-key-word', title: 'Word Smith', description: 'Finish a word without the Key' },
  { id: 'midnight-word', title: 'Night Owl', description: 'Complete a word after midnight' },
  { id: 'sub-second', title: 'Speed Reader', description: 'Tap a letter in under one second' },
  { id: 'perfect-word', title: 'Perfect Round', description: 'Finish a word at 100%' },
  { id: 'marathon', title: 'Marathon', description: 'A 30-day daily streak' },
  { id: 'deep-listener', title: 'Deep Listener', description: 'Clear 50 audio words' },
  { id: 'fluent', title: 'Fluent', description: 'Master all 26 letters' },
]
