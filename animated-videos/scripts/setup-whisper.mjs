// Builds whisper.cpp locally (CPU) so we can transcribe a voiceover and time captions to each word.
// The speech model is downloaded separately, the first time a voiceover is added.
import path from 'node:path';
import {installWhisperCpp} from '@remotion/install-whisper-cpp';

const to = path.join(process.cwd(), 'whisper.cpp');
await installWhisperCpp({to, version: '1.5.5'});
console.log('whisper.cpp ready in', to);
