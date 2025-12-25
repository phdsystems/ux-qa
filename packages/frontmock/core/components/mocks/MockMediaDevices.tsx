/**
 * MockMediaDevices - Mock MediaDevices API for testing
 *
 * Allows testing camera, microphone, and screen sharing without actual devices
 */

export interface MockMediaStreamTrack {
  kind: 'audio' | 'video'
  id: string
  label: string
  enabled: boolean
  muted: boolean
  readyState: 'live' | 'ended'
  stop: () => void
}

export interface MockMediaStream {
  id: string
  active: boolean
  getTracks: () => MockMediaStreamTrack[]
  getAudioTracks: () => MockMediaStreamTrack[]
  getVideoTracks: () => MockMediaStreamTrack[]
  addTrack: (track: MockMediaStreamTrack) => void
  removeTrack: (track: MockMediaStreamTrack) => void
  stop: () => void
}

export interface MockMediaDevicesReturn {
  mockGetUserMedia: ReturnType<typeof vi.fn>
  mockGetDisplayMedia: ReturnType<typeof vi.fn>
  mockEnumerateDevices: ReturnType<typeof vi.fn>
  createMockStream: (audio?: boolean, video?: boolean) => MockMediaStream
  triggerDeviceChange: () => void
  setPermission: (type: 'camera' | 'microphone', state: PermissionState) => void
  cleanup: () => void
}

/**
 * Sets up mock for MediaDevices API
 *
 * @example
 * ```typescript
 * import { setupMockMediaDevices } from '@ux.qa/frontmock'
 *
 * const { mockGetUserMedia, createMockStream, cleanup } = setupMockMediaDevices()
 *
 * render(<VideoCallComponent />)
 *
 * // User clicks "start video"
 * await user.click(screen.getByRole('button', { name: /start video/i }))
 *
 * // Verify getUserMedia was called
 * expect(mockGetUserMedia).toHaveBeenCalledWith({
 *   video: true,
 *   audio: true
 * })
 *
 * // Simulate stream
 * const stream = createMockStream(true, true)
 * // Component receives stream and displays video
 *
 * cleanup()
 * ```
 */
export function setupMockMediaDevices(): MockMediaDevicesReturn {
  let trackIdCounter = 0
  const activeStreams: MockMediaStream[] = []

  const createMockTrack = (kind: 'audio' | 'video'): MockMediaStreamTrack => {
    trackIdCounter++
    return {
      kind,
      id: `mock-track-${trackIdCounter}`,
      label: kind === 'audio' ? 'Mock Microphone' : 'Mock Camera',
      enabled: true,
      muted: false,
      readyState: 'live',
      stop: vi.fn(),
    }
  }

  const createMockStream = (audio = true, video = true): MockMediaStream => {
    const tracks: MockMediaStreamTrack[] = []

    if (audio) {
      tracks.push(createMockTrack('audio'))
    }
    if (video) {
      tracks.push(createMockTrack('video'))
    }

    const stream: MockMediaStream = {
      id: `mock-stream-${Date.now()}`,
      active: true,
      getTracks: () => tracks,
      getAudioTracks: () => tracks.filter((t) => t.kind === 'audio'),
      getVideoTracks: () => tracks.filter((t) => t.kind === 'video'),
      addTrack: (track) => tracks.push(track),
      removeTrack: (track) => {
        const index = tracks.indexOf(track)
        if (index > -1) tracks.splice(index, 1)
      },
      stop: () => {
        stream.active = false
        tracks.forEach((t) => {
          t.readyState = 'ended'
          t.stop()
        })
      },
    }

    activeStreams.push(stream)
    return stream
  }

  const mockGetUserMedia = vi.fn(
    async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
      const hasAudio = !!constraints.audio
      const hasVideo = !!constraints.video
      return createMockStream(hasAudio, hasVideo) as any
    }
  )

  const mockGetDisplayMedia = vi.fn(
    async (constraints?: DisplayMediaStreamOptions): Promise<MediaStream> => {
      return createMockStream(!!constraints?.audio, true) as any
    }
  )

  const mockEnumerateDevices = vi.fn(async (): Promise<MediaDeviceInfo[]> => {
    return [
      {
        deviceId: 'mock-camera-1',
        kind: 'videoinput',
        label: 'Mock Camera',
        groupId: 'mock-group-1',
        toJSON: () => ({}),
      },
      {
        deviceId: 'mock-mic-1',
        kind: 'audioinput',
        label: 'Mock Microphone',
        groupId: 'mock-group-1',
        toJSON: () => ({}),
      },
      {
        deviceId: 'mock-speaker-1',
        kind: 'audiooutput',
        label: 'Mock Speaker',
        groupId: 'mock-group-1',
        toJSON: () => ({}),
      },
    ] as MediaDeviceInfo[]
  })

  const deviceChangeListeners: ((event: Event) => void)[] = []

  const mockMediaDevices: MediaDevices = {
    getUserMedia: mockGetUserMedia,
    getDisplayMedia: mockGetDisplayMedia as any,
    enumerateDevices: mockEnumerateDevices,
    getSupportedConstraints: () => ({
      aspectRatio: true,
      facingMode: true,
      frameRate: true,
      height: true,
      width: true,
      deviceId: true,
    }),
    addEventListener: (type: string, listener: any) => {
      if (type === 'devicechange') {
        deviceChangeListeners.push(listener)
      }
    },
    removeEventListener: (type: string, listener: any) => {
      if (type === 'devicechange') {
        const index = deviceChangeListeners.indexOf(listener)
        if (index > -1) deviceChangeListeners.splice(index, 1)
      }
    },
    dispatchEvent: () => true,
    ondevicechange: null,
  }

  const originalMediaDevices = navigator.mediaDevices

  // Install mock
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: mockMediaDevices,
  })

  const triggerDeviceChange = () => {
    const event = new Event('devicechange')
    deviceChangeListeners.forEach((listener) => listener(event))
  }

  const setPermission = (type: 'camera' | 'microphone', state: PermissionState) => {
    // Simplified - would need full permissions API mock
    console.log(`Mock permission for ${type} set to ${state}`)
  }

  const cleanup = () => {
    // Stop all active streams
    activeStreams.forEach((stream) => stream.stop())
    activeStreams.length = 0

    // Restore original
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: originalMediaDevices,
    })

    deviceChangeListeners.length = 0
    mockGetUserMedia.mockClear()
    mockGetDisplayMedia.mockClear()
    mockEnumerateDevices.mockClear()
  }

  return {
    mockGetUserMedia,
    mockGetDisplayMedia,
    mockEnumerateDevices,
    createMockStream,
    triggerDeviceChange,
    setPermission,
    cleanup,
  }
}

/**
 * Common media constraints presets
 */
export const MediaConstraintPresets = {
  videoOnly: { video: true, audio: false },
  audioOnly: { video: false, audio: true },
  videoAudio: { video: true, audio: true },
  hd: { video: { width: 1280, height: 720 }, audio: true },
  fullHd: { video: { width: 1920, height: 1080 }, audio: true },
  frontCamera: { video: { facingMode: 'user' }, audio: true },
  backCamera: { video: { facingMode: 'environment' }, audio: true },
} as const
