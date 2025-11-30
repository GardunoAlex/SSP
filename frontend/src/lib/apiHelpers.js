export async function getSupabaseUser(getAccessTokenSilently) {
  try {
    const token = await getAccessTokenSilently();
    const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userResponse.ok) {
      // Try to sync the user and retry once
      console.debug('getSupabaseUser: /api/student returned non-ok, trying /api/auth/sync');
      // sync with retry/backoff in case of rate-limits from Auth0
      let syncRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!syncRes.ok && syncRes.status === 429) {
        // quick retry with backoff
        await new Promise(r => setTimeout(r, 1000));
        syncRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (!syncRes.ok) {
        const syncText = await syncRes.text();
        console.warn('getSupabaseUser: sync failed', syncText);
        throw new Error(`Failed to sync user: ${syncText}`);
      }

      // re-fetch student
      const retryUserResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!retryUserResponse.ok) {
        throw new Error('Failed to fetch student after sync');
      }
      const retryUserData = await retryUserResponse.json();
      return retryUserData[0];
    }

    const userData = await userResponse.json();
    return userData[0];
  } catch (err) {
    console.error('getSupabaseUser error', err);
    throw err;
  }
}

export default { getSupabaseUser };
