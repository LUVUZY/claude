import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// WebGL for the 3D reel in headless Chrome
Config.setChromiumOpenGlRenderer('angle');
// Use a locally installed Chrome when REMOTION_BROWSER is set (e.g. in a cloud container)
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
