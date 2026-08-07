import { Outlet } from 'react-router-dom'
import { ToastViewport } from '@/components/Toast'
import { usePlayTime } from '@/hooks/usePlayTime'
import { Navigation } from './Navigation'
import { Hud } from './Hud'

/*
  Component hierarchy per dev notes p012: each screen gets Navigation
  or HUD chrome plus a centred column (game content max 800px), with
  the toast viewport above everything.
*/
export function NavLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navigation />
      <main className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col px-[22px] md:px-16 xl:px-0">
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  )
}

export function GameLayout() {
  usePlayTime()
  return (
    <div className="flex min-h-dvh flex-col">
      <Hud />
      <main className="mx-auto flex w-full max-w-[800px] flex-1 flex-col px-[22px] md:px-6">
        <Outlet />
      </main>
      <ToastViewport />
    </div>
  )
}

