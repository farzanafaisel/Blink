import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { AchievementCard } from '@/components/AchievementCard'
import { Button } from '@/components/Button'
import { EmptyState } from '@/components/EmptyState'
import { useMorseStore } from '@/app/store'
import { ACHIEVEMENTS } from '@/game/achievements'
import { fadeInUp, staggerChildren } from '@/utils/motion'

/* Screen 021: header with unlocked count, 3-per-row achievement grid. */
export function Achievements() {
  const navigate = useNavigate()
  const unlocked = useMorseStore((s) => s.achievements)
  const unlockedCount = Object.keys(unlocked).length

  if (unlockedCount === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No achievements yet"
        description="Play your first round and start collecting them."
        action={<Button onClick={() => navigate('/learn')}>Start learning</Button>}
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-10 py-14">
      <div className="flex flex-col gap-1">
        <h1 className="text-h3 text-text-primary">Achievements</h1>
        <p className="text-body-sm text-text-secondary">
          {unlockedCount} of {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      <motion.div
        variants={staggerChildren(0.04)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
      >
        {ACHIEVEMENTS.map((achievement) => (
          <motion.div key={achievement.id} variants={fadeInUp}>
            <AchievementCard
              title={achievement.title}
              description={achievement.description}
              unlocked={achievement.id in unlocked}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
