import React from 'react';

const Login = () => {
    const clientId: string = '2fcdd79fbd9844c1b1814af118bdc128'; // Ersetze mit deiner Spotify Client ID
    const redirectUri: string = 'http://localhost:3000'; // Ersetze mit deiner Redirect URI
    const scopes: string [] = [
        'user-read-playback-state',
        'user-modify-playback-state',
        'streaming',
    ];

    const authUrl: string = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}`;

    return (
        <div>
            <h1>Hitster Login</h1>
            <a href={authUrl}>Login with Spotify</a>
        </div>
    );
};

export default Login;
