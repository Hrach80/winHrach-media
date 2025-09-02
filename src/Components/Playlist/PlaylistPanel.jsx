import React from 'react';
import '../Playlist/PlaylistPanel.css';

export const PlaylistPanel = ({ isVisible, onToggle, songsList, currentSongIndex, onSelectSong }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <div className="playlist-panel-container">
            <div className="playlist-panel-header">
                <span>Playlist</span>
                <button className="playlist-close-btn" onClick={onToggle}>x</button>
            </div>
            <div className="playlist-songs-list">
                {songsList.length > 0 ? (
                    <ul>
                        {songsList.map((song, index) => (
                            <li
                                key={index}
                                className={`playlist-item ${index === currentSongIndex ? 'active' : ''}`}
                                onClick={() => onSelectSong(index)}
                            >
                                {song.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-songs-message">Երգեր չկան։</p>
                )}
            </div>
        </div>
    );
};