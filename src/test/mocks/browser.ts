import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

/**
 * MSW worker for browser environment (development testing mode)
 * This allows testing the app with mocked APIs during local development
 *
 * Usage:
 * 1. Set VITE_TESTING_MODE=true in .env
 * 2. The worker will automatically start in development mode
 * 3. All API calls will be intercepted and mocked
 */
export const worker = setupWorker(...handlers)
