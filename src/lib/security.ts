import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting store
// In production, use Redis or another persistent store
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

/**
 * Check if request passes rate limiting
 */
export async function checkRateLimit(
  request: NextRequest,
  identifier?: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  // For MVP, we'll use a simple in-memory rate limiter
  // In production, use a more robust solution like rate-limiter-flexible

  const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';
  const key = identifier ? `${ip}:${identifier}` : ip;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new rate limit window
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Clean up old entries periodically (simple garbage collection)
  if (Math.random() < 0.01) { // 1% chance on each request
    for (const [storeKey, storeEntry] of rateLimitStore.entries()) {
      if (storeEntry.resetTime < now - RATE_LIMIT_WINDOW_MS * 2) {
        rateLimitStore.delete(storeKey);
      }
    }
  }

  return { allowed: true };
}

/**
 * Check CSRF protection via Same-Origin
 * Basic protection: verify request comes from same origin
 */
export function checkCSRF(request: NextRequest, strict: boolean = true): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  // For API requests from browser, origin should match the host
  // Allow requests from same origin or from trusted origins

  if (!origin) {
    // Some legitimate requests might not have origin header (e.g., curl, server-to-server)
    if (strict) {
      // For strict mode (mutating operations), require origin header
      return false;
    }
    // For non-strict mode (GET requests), allow requests without origin
    return true;
  }

  // Parse origin hostname
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host;

    // Check if origin matches the request host
    if (host && originHost === host) {
      return true;
    }

    // For development, allow localhost origins
    if (process.env.NODE_ENV === 'development') {
      if (originHost.includes('localhost') || originHost.includes('127.0.0.1')) {
        return true;
      }
    }

    return false;
  } catch {
    // Invalid origin URL
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS attacks
 * Basic HTML tag removal - in production, use a library like DOMPurify
 */
export function sanitizeInput(input: string): string {
  if (!input) return input;

  // Remove potentially dangerous HTML tags and attributes
  // This is a basic sanitization - for production, use a proper library
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize error messages to avoid information disclosure
 */
export function sanitizeError(error: unknown): {
  message: string;
  details?: string;
  code?: string;
} {
  if (error instanceof Error) {
    const message = error.message;

    // Hide internal error details in production
    if (process.env.NODE_ENV === 'production') {
      // Check for common error patterns that might leak information
      if (message.includes('ZodError') || message.includes('schema')) {
        return {
          message: 'Invalid input data',
          code: 'VALIDATION_ERROR'
        };
      }

      if (message.includes('permission') || message.includes('not authorized')) {
        return {
          message: 'You do not have permission to perform this action',
          code: 'PERMISSION_DENIED'
        };
      }

      if (message.includes('not authenticated') || message.includes('session')) {
        return {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        };
      }

      if (message.includes('not found')) {
        return {
          message: 'Resource not found',
          code: 'NOT_FOUND'
        };
      }

      // Generic error for everything else
      return {
        message: 'An error occurred. Please try again.',
        code: 'INTERNAL_ERROR'
      };
    } else {
      // In development, show more details
      return {
        message: error.message,
        details: error.stack,
        code: 'DEV_ERROR'
      };
    }
  }

  // Non-Error object
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Middleware wrapper for API routes that adds security checks
 */
export async function withSecurity(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: {
    requireCSRF?: boolean;
    rateLimitIdentifier?: string;
  }
): Promise<NextResponse> {
  const { requireCSRF = true, rateLimitIdentifier } = options || {};

  // Check rate limiting
  const rateLimitResult = await checkRateLimit(request, rateLimitIdentifier);
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
        }
      }
    );
  }

  // Check CSRF for mutating operations
  if (requireCSRF && !checkCSRF(request, requireCSRF)) {
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403 }
    );
  }

  try {
    return await handler(request);
  } catch (error) {
    console.error('API Error:', error);

    const sanitizedError = sanitizeError(error);

    // Determine appropriate status code
    let statusCode = 500;
    if (sanitizedError.code === 'VALIDATION_ERROR') statusCode = 400;
    if (sanitizedError.code === 'AUTH_REQUIRED') statusCode = 401;
    if (sanitizedError.code === 'PERMISSION_DENIED') statusCode = 403;
    if (sanitizedError.code === 'NOT_FOUND') statusCode = 404;

    return NextResponse.json(
      {
        error: sanitizedError.message,
        ...(sanitizedError.details && { details: sanitizedError.details }),
        ...(sanitizedError.code && { code: sanitizedError.code })
      },
      { status: statusCode }
    );
  }
}