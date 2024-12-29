import React, { useEffect, useState } from 'react';
import {Playlist, PlaylistTrack} from "./models/spotifyModels";


const Dashboard = ({ token }: { token: string | null }) => {
    const [player, setPlayer] = useState<Spotify.Player>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [playlists, setPlaylists] = useState<Playlist[]>([]); // Playlists des Benutzers
    const [playlistTracks, setPlaylistTracks] = useState<Song[]>([]); // Tracks der ausgewählten Playlist
    const [selectedTrackURI, setSelectedTrackURI] = useState<string>(); // Ausgewählter Track
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null); // Ausgewählte Playlist

    const [players, setPlayers] = useState<Player[]>([]); // Spieler

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
        if (selectedPlaylistId) {
            fetch(`https://api.spotify.com/v1/playlists/${selectedPlaylistId}/tracks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    const tracks: Song[] = data.items.map((item: PlaylistTrack) => ({
                        name: item.track.name,
                        uri: item.track.uri,
                        releaseDate: item.track.album.release_date, // Das Erscheinungsjahr des Albums
                    }));
                    setPlaylistTracks(tracks); // Setzt die Tracks der ausgewählten Playlist
                })
                .catch((error) => console.error('Error fetching playlist tracks:', error));
        }
    }, [selectedPlaylistId, token]);


    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const spotifyPlayer = new window.Spotify.Player({
                name: 'Hitster Player',
                getOAuthToken: (cb: any) => { cb(token); },
            });

            spotifyPlayer.addListener('ready', ({ device_id} : { device_id: string }) => {
                console.log('Ready with Device ID:', device_id);
                setDeviceId(device_id);
            });

            spotifyPlayer.addListener('not_ready', ({ device_id } : { device_id: string }) => {
                console.log('Device ID has gone offline:', device_id);
            });

            spotifyPlayer.connect();
            setPlayer(spotifyPlayer);
        };
    }, [token]);

    const playSong = (uri: any) => {
        fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uris: [selectedTrackURI], // URI des ausgewählten Songs
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

        const randomSong = () => {
            console.log(players);

            // Kopiere die playlistTracks, um den Zustand korrekt zu aktualisieren
            const updatedPlaylistTracks = [...playlistTracks];

            // Gehe über alle Spieler
            for (let i = 0; i < players.length; i++) {
                const randomIndex = Math.floor(Math.random() * updatedPlaylistTracks.length);
                const randomTrack = updatedPlaylistTracks[randomIndex];
                console.log(randomTrack);

                // Füge den zufälligen Track zur Playlist des Spielers hinzu
                players[i].playlist.push(randomTrack);

                // Entferne den Track aus der globalen Playlist
                updatedPlaylistTracks.splice(randomIndex, 1);

                console.log(updatedPlaylistTracks);

            }
            setPlaylistTracks(updatedPlaylistTracks);

            // Setze den neuen Zustand der Playlist

            // Setze den neuen Zustand der Spieler (optional, wenn du das auch aktualisieren möchtest)
            setPlayers([...players]);
        };



        // Funktion, um einen neuen Spieler hinzuzufügen
        const addPlayer = (playerId: string) => {
            setPlayers((prevPlayers: Player[] ) => [
                ...prevPlayers,
                { id: playerId, isPlaying: false, playlist:[] },
            ]);
        };


        const nextSong = () => {
            const randomIndex = Math.floor(Math.random() * playlistTracks.length);
            console.log(randomIndex);
            const randomTrack = playlistTracks[randomIndex];
            console.log(playlistTracks);
            console.log(randomTrack);
            setSelectedTrackURI(randomTrack.uri);
        };

    return (
        <div>
            <h1>Hitster Player</h1>
            <div>
                <button onClick={playSong}>Play</button>

                <button onClick={pauseSong}>Pause</button>
                 <button onClick={resumeSong}>Resume</button>
                <button onClick={randomSong}>Random Song</button>
                                 <button onClick={() => addPlayer(`player-${players.length + 1}`)}>
                    Add Player
                </button>
                <button onClick={nextSong}>Next</button>
            </div>

            <div>
                <label htmlFor="playlistSelect">Select a Playlist:</label>
                <select
                    id="playlistSelect"
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}>
                    <option value="">--Select a playlist--</option>
                    {playlists.map((playlist: Playlist) => (
                        <option key={playlist.id} value={playlist.id}>
                            {playlist.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="trackSelect">Select a song:</label>
                <select
                    id="trackSelect"
                    onChange={(e) => {
                        const selectedUri: string = e.target.value;
                        setSelectedTrackURI(selectedUri);
                    }}
                >
                    <option value="">--Select a song--</option>
                    {playlistTracks.map((track: Song, index: number) => (
                        <option key={index} value={track.uri}>
                            {track.name}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <h2>Playlist Songs</h2>
                <ul>
                    {playlistTracks.map((track: Song, index: number) => (
                        <li key={index}>{track.name}
                            {track.releaseDate}
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Players</h2>
                <ul>
                    {players.map((player) => (
                        <li key={player.id}>
                            {player.id} - {player.isPlaying ? 'Playing' : 'Paused'}
                            <ul>
                                {player.playlist.map((track, index) => (
                                    <li key={index}>
                                        {track.name}
                                        {track.releaseDate}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
