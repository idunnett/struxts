// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "https://449a1c5658b4dea12981ff1fe30b2943@o4507761602002944.ingest.us.sentry.io/4507761662885888",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      autoInject: false,
    }),
    // Sentry.replayIntegration({
    //   // Additional Replay configuration goes in here, for example:
    //   maskAllText: true,
    //   blockAllMedia: true,
    // }),
  ],

  enabled: process.env.NEXT_PUBLIC_VERCEL_ENV === "production",
})
