export async function getSupabaseUser(getAccessTokenSilently) {
  try {
    const token = await getAccessTokenSilently();
    const userResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userResponse.ok) {
      // /api/student failed (could be an org user or new user not yet synced)
      console.debug('getSupabaseUser: /api/student returned non-ok, trying /api/auth/sync');
      let syncRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!syncRes.ok && syncRes.status === 429) {
        await new Promise(r => setTimeout(r, 1000));
        syncRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (syncRes.status === 409) {
        const errData = await syncRes.json();
        throw new Error(errData.message || "This email is already registered with a different role.");
      }
      if (!syncRes.ok) {
        const syncText = await syncRes.text();
        console.warn('getSupabaseUser: sync failed', syncText);
        throw new Error(`Failed to sync user: ${syncText}`);
      }

      // Use the sync response directly — it already contains the full user data
      const syncData = await syncRes.json();
      return syncData.data;
    }

    const userData = await userResponse.json();
    return userData[0];
  } catch (err) {
    console.error('getSupabaseUser error', err);
    throw err;
  }
}

export default { getSupabaseUser };
