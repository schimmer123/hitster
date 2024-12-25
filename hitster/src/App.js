import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Player from './components/Player';

const App = () => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get('access_token');
            setToken(accessToken);
            window.location.hash = ''; // Bereinige die URL
        }
    }, []);

    return (
        <div>
            {!token ? <Login /> : <Player token={token} />}
        </div>
    );
};

export default App;
