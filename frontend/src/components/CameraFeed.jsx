import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RiLoader4Line, RiCameraOffLine } from 'react-icons/ri'
import { useMediaPipe } from '../hooks/useMediaPipe'

export default function CameraFeed({ onResults, enabled = true, showFps = true }) {
  const { videoRef, canvasRef, isLoading, error, fps } = useMediaPipe({ onResults, enabled })

  return (
    <div className="relative camera-container w-full aspect-video bg-dark-900 rounded-2xl overflow-hidden">
      {/* Video element (mirrored for selfie view) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Landmark canvas overlay (also mirrored) */}
      <canvas
        ref={canvasRef}
        className="landmark-canvas"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/90 backdrop-blur-sm">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-purple-400 mb-3"
          >
            <RiLoader4Line size={40} />
          </motion.div>
          <p className="text-gray-400 text-sm">Initializing camera & AI...</p>
          <p className="text-gray-600 text-xs mt-1">Loading MediaPipe Hands</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/90">
          <RiCameraOffLine size={40} className="text-red-400 mb-3" />
          <p className="text-red-400 font-medium">Camera Error</p>
          <p className="text-gray-500 text-sm mt-1 text-center px-4">{error}</p>
        </div>
      )}

      {/* Disabled state */}
      {!enabled && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900/70">
          <RiCameraOffLine size={36} className="text-gray-600 mb-2" />
          <p className="text-gray-500 text-sm">AI Recognition Paused</p>
        </div>
      )}

      {/* Corner decorations */}
      {!isLoading && !error && (
        <>
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-purple-500/60 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-purple-500/60 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-purple-500/60 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-purple-500/60 rounded-br-lg" />

          {/* FPS counter */}
          {showFps && fps > 0 && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-dark-900/70 border border-white/10 rounded-full px-3 py-0.5 text-xs text-gray-400 font-mono">
              {fps} FPS
            </div>
          )}

          {/* Live indicator */}
          <div className="absolute top-3 right-10 flex items-center gap-1.5 bg-dark-900/70 border border-white/10 rounded-full px-2.5 py-0.5">
            <span className="status-dot active w-1.5 h-1.5" />
            <span className="text-xs text-gray-300">LIVE</span>
          </div>
        </>
      )}
    </div>
  )
}
