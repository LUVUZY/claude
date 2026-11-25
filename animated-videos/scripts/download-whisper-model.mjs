// Downloads a Whisper speech model into whisper.cpp/ (needed once, before transcribing a voiceover).
import path from 'node:path';
// In a proxied cloud container Node may not reach Hugging Face; download the .bin with curl into whisper.cpp/ instead.
import {downloadWhisperModel} from '@remotion/install-whisper-cpp';

const model = process.argv[2] ?? 'base.en';
await downloadWhisperModel({model, folder: path.join(process.cwd(), 'whisper.cpp')});
console.log('model ready:', model);
