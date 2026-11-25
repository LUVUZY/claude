import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled in public/fonts (variable fonts, so one file covers every weight).
loadFont({family: 'Fraunces', url: staticFile('fonts/Fraunces.woff2'), weight: '100 900'});
loadFont({family: 'Inter', url: staticFile('fonts/Inter.woff2'), weight: '100 900'});

// Draft palette for The Buyers Mind: swap these for your real brand colours.
export const brand = {
  name: 'The Buyers Mind',
  ink: '#14172B', // deep navy
  inkSoft: '#262B4A',
  cream: '#F6EFE3',
  amber: '#F2A93B', // main accent
  coral: '#E5574C', // "problem" colour
  mint: '#5CC8A8', // "fixed" colour
  muted: '#8A8FA8',
  serif: 'Fraunces, serif',
  sans: 'Inter, sans-serif',
};

export const toolkits = {
  fix: {
    title: 'Fix Your Product Toolkit',
    // Draft lines: replace with what is really inside the toolkit.
    points: ['Spot what stops the sale', 'Fix the offer, not just the look', 'Test it before you relaunch'],
  },
  mind: {
    title: 'Inside the Buyers Mind Toolkit',
    points: ['What they want', 'What they fear', 'Why they hesitate'],
  },
};
