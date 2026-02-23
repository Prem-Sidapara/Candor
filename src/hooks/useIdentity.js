import { useState, useEffect } from "react";
import getOrCreateUser from "../lib/identity";

function useIdentity() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false; // React StrictMode double-invoke se bachao

        getOrCreateUser()
            .then((u) => { if (!cancelled) setUser(u); })
            .catch((err) => { if (!cancelled) setError(err); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; }; // cleanup
    }, []);

    return { user, loading, error };
}

export default useIdentity;