import { join } from 'path'
import type { Config } from 'tailwindcss'

// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin'

import { myCustomTheme } from './theme'

const config = {
  // 2. Opt for dark mode to be handled via the class method
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    // 3. Append the path to the Skeleton package
    join(
      require.resolve('@skeletonlabs/skeleton'),
      '../**/*.{html,js,svelte,ts}'
    ),
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 0.1s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': {
            transform: 'translateY(-4px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [
    // 4. Append the Skeleton plugin (after other plugins)
    skeleton({
      themes: {
        custom: [myCustomTheme],
      },
    }),
  ],
} satisfies Config

export default config
