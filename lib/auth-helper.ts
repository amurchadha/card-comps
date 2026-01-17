// Edge-compatible Clerk auth helper
// Handles cases where Clerk's server auth doesn't work on Cloudflare Edge

export async function getClerkUserId(): Promise<string | null> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.warn('Clerk auth failed on Edge:', error);
    // On Edge runtime, Clerk's auth() may not work
    // Return null to indicate unauthenticated
    return null;
  }
}
