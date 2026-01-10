# Phonon UI - Ultra-Condensed Cheat Sheet

## Install
```bash
npm install phonon-ui
```

## Setup
```tsx
import 'phonon-ui/styles/globals.css';
import { PhononProvider } from 'phonon-ui';

<PhononProvider><App /></PhononProvider>
```

## Typography
```tsx
import { SwissHero, SwissHeading, SwissBody, SwissLabel } from 'phonon-ui';

<SwissHero>BIG TITLE</SwissHero>
<SwissHeading level={1}>H1</SwissHeading>
<SwissHeading level={2}>H2</SwissHeading>
<SwissBody>Body text</SwissBody>
<SwissLabel>01 — Label</SwissLabel>
```

## Markdown
```tsx
import { MarkdownRenderer } from 'phonon-ui';

<MarkdownRenderer content={md} typewriter typingSpeed="fast" />
```

## Chat
```tsx
import { ChatWidget, useChat } from 'phonon-ui';

const { messages, sendMessage, isStreaming } = useChat();
<ChatWidget messages={messages} onSend={sendMessage} isLoading={isStreaming} />
```

## Video Background
```tsx
import { useVideoBackground, VideoControls } from 'phonon-ui';

const v = useVideoBackground('/bg.mp4', 0.7);
<video ref={v.videoRef} autoPlay loop muted={v.state.isMuted} />
<VideoControls
  isPlaying={v.state.isPlaying}
  volume={v.state.volume}
  isMuted={v.state.isMuted}
  onPlayPause={v.state.isPlaying ? v.pause : v.play}
  onVolumeChange={v.setVolume}
  onMuteToggle={v.state.isMuted ? v.unmute : v.mute}
/>
```

## Video Vignette
```tsx
import { VideoVignette } from 'phonon-ui';

<VideoVignette src="/clip.mp4" caption="Fig. 1" aspectRatio="16/9" />
```

## CSS Variables
```css
--phonon-bg, --phonon-fg, --phonon-primary
--phonon-space-xs/sm/md/lg/xl (PHI scale)
--phonon-font-display/body/mono
```

## LLM Commands
```
[RENDER:{"type":"component","props":{}}]
[ACTION:{"type":"navigate","to":"/page"}]
```

## Key Principles
1. No horizontal overflow
2. Words never break
3. PHI spacing (1.618 golden ratio)
4. DNA hierarchy: Terrain > Walls > Stems > Petals > Pollen
5. Audio priority: Voice > Music > Video (last wins)
