"use client"

/**
 * audio-change-dialog.tsx - Confirmation dialog for changing audio
 * 
 * Shows when user tries to play new audio while current audio is playing
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAudioPlayerStore } from "@/stores/audio-player-store"

export function AudioChangeDialog() {
  const showChangeConfirm = useAudioPlayerStore((s) => s.showChangeConfirm)
  const pendingAudio = useAudioPlayerStore((s) => s.pendingAudio)
  const currentTitle = useAudioPlayerStore((s) => s.title)
  
  const confirmAudioChange = useAudioPlayerStore((s) => s.confirmAudioChange)
  const cancelAudioChange = useAudioPlayerStore((s) => s.cancelAudioChange)
  
  return (
    <AlertDialog open={showChangeConfirm} onOpenChange={(open) => !open && cancelAudioChange()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Audio?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>You are currently listening to:</p>
            <p className="font-medium text-foreground">"{currentTitle}"</p>
            <p className="mt-2">Do you want to switch to:</p>
            <p className="font-medium text-foreground">"{pendingAudio?.title}"</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelAudioChange}>
            Keep Current
          </AlertDialogCancel>
          <AlertDialogAction onClick={confirmAudioChange}>
            Switch Audio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AudioChangeDialog
