import type {Config} from '@react-router/dev/config';
import {hydrogenPreset} from '@shopify/hydrogen/react-router-preset';

/**
 * React Router 7.9.x Configuration for Hydrogen
 *
 * This configuration uses the Vercel preset to enable seamless deployment
 * on Vercel infrastructure.
 */
export default {
  presets: [hydrogenPreset()],
} satisfies Config;
