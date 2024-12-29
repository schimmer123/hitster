import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from "./components/Dashboard";

const App = () => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const hash: string = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken: string | null = params.get('access_token');
            setToken(accessToken);
            window.location.hash = ''; // Bereinige die URL
        }
    }, []);

    return (
        <div>
            {!token ? <Login /> : <Dashboard token={token} />}
        </div>
    );
};

export default App;
