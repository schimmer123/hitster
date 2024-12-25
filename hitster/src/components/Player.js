import React, { useEffect, useState } from 'react';

const Player = ({ token }) => {
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [deviceId, setDeviceId] = useState(null);
    const [playlists, setPlaylists] = useState([]); // Playlists des Benutzers
    const [playlistTracks, setPlaylistTracks] = useState([]); // Tracks der ausgewählten Playlist
    const [selectedTrack, setSelectedTrack] = useState(null); // Ausgewählter Track
    const [selectedPlaylist, setSelectedPlaylist] = useState(null); // Ausgewählte Playlist

    // Funktion, um die Playlists des Benutzers abzurufen
    useEffect(() => {
        if (token) {
            fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setPlaylists(data.items); // Setzt die Playlists im Zustand
                })
                .catch((error) => console.error('Error fetching playlists:', error));
        }
    }, [token]);

    // Funktion, um die Tracks einer ausgewählten Playlist abzurufen
    useEffect(() => {
        if (selectedPlaylist) {
            fetch(`https://api.spotify.com/v1/playlists/${selectedPlaylist}/tracks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    const tracks = data.items.map((item) => ({
                        name: item.track.name,
                        uri: item.track.uri,
                    }));
                    setPlaylistTracks(tracks); // Setzt die Tracks der ausgewählten Playlist
                })
                .catch((error) => console.error('Error fetching playlist tracks:', error));
        }
    }, [selectedPlaylist, token]);


    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: 'Hitster Player',
                getOAuthToken: (cb) => { cb(token); },
            });

            spotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID:', device_id);
                setDeviceId(device_id);
            });

            spotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline:', device_id);
            });

            spotifyPlayer.connect();
            setPlayer(spotifyPlayer);
        };
    }, [token]);

    const playSong = (uri) => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [selectedTrack], // URI des ausgewählten Songs
            }),
        }).then(() => setIsPlaying(true));
    };

    const pauseSong = () => {
        fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then(() => setIsPlaying(false));
    };

    const resumeSong = () => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        }).then(() => setIsPlaying(true));
    };

    return (
        <div>
            <h1>Hitster Player</h1>
            <div>
                <button onClick={playSong}>Play</button>
                <button onClick={pauseSong}>Pause</button>
                <button onClick={resumeSong}>Resume</button>
            </div>

            <div>
                {/* Dropdown für die Auswahl der Playlist */}
                <label htmlFor="playlistSelect">Select a Playlist:</label>
                <select
                    id="playlistSelect"
                    onChange={(e) => setSelectedPlaylist(e.target.value)}
                >
                    <option value="">--Select a playlist--</option>
                    {playlists.map((playlist) => (
                        <option key={playlist.id} value={playlist.id}>
                            {playlist.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                {/* Dropdown für die Auswahl des Songs */}
                <label htmlFor="trackSelect">Select a song:</label>
                <select
                    id="trackSelect"
                    onChange={(e) => {
                        const selectedUri = e.target.value;
                        setSelectedTrack(selectedUri);
                    }}
                >
                    <option value="">--Select a song--</option>
                    {playlistTracks.map((track, index) => (
                        <option key={index} value={track.uri}>
                            {track.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Player;
