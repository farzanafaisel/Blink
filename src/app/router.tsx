/* eslint-disable react-refresh/only-export-components -- route config, not a component module */
import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { GameLayout, NavLayout } from '@/components/Layout'
import { Loading } from '@/screens/Loading'
import { Landing } from '@/screens/Landing'

/* Routes mirror the play-first IA on page 001. */
const ModeSelection = lazy(() =>
  import('@/screens/Play').then((m) => ({ default: m.ModeSelection })),
)
const WordGameplay = lazy(() =>
  import('@/screens/Play').then((m) => ({ default: m.WordGameplay })),
)
const MorseKeyPage = lazy(() =>
  import('@/screens/MorseKeyPage').then((m) => ({ default: m.MorseKeyPage })),
)
const AudioChallenge = lazy(() =>
  import('@/screens/AudioMode').then((m) => ({ default: m.AudioChallenge })),
)
const TimedChallenge = lazy(() =>
  import('@/screens/TimedChallenge').then((m) => ({ default: m.TimedChallenge })),
)
const DailyChallenge = lazy(() =>
  import('@/screens/DailyChallenge').then((m) => ({ default: m.DailyChallenge })),
)
const Settings = lazy(() =>
  import('@/screens/Settings').then((m) => ({ default: m.Settings })),
)
const Statistics = lazy(() =>
  import('@/screens/Statistics').then((m) => ({ default: m.Statistics })),
)
const Achievements = lazy(() =>
  import('@/screens/Achievements').then((m) => ({ default: m.Achievements })),
)
const About = lazy(() =>
  import('@/screens/About').then((m) => ({ default: m.About })),
)
const NotFound = lazy(() =>
  import('@/screens/NotFound').then((m) => ({ default: m.NotFound })),
)

const load = (screen: React.ReactNode) => (
  <Suspense fallback={<Loading />}>{screen}</Suspense>
)

export const router = createBrowserRouter([
  {
    element: <NavLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/play', element: load(<ModeSelection />) },
      { path: '/key', element: load(<MorseKeyPage />) },
      { path: '/statistics', element: load(<Statistics />) },
      { path: '/achievements', element: load(<Achievements />) },
      { path: '/settings', element: load(<Settings />) },
      { path: '/about', element: load(<About />) },
      { path: '/daily', element: load(<DailyChallenge />) },
      { path: '*', element: load(<NotFound />) },
    ],
  },
  {
    element: <GameLayout />,
    children: [
      { path: '/audio', element: load(<AudioChallenge />) },
      { path: '/timed', element: load(<TimedChallenge />) },
    ],
  },
  /* Gameplay owns its chrome: the HUD hides on celebration beats. */
  { path: '/play/word', element: load(<WordGameplay />) },
])
