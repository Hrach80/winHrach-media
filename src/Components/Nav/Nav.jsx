// src/components/Nav.jsx

import React from 'react';
import { usePlayerState } from '../usePlayerState';
import { formatTime } from '../utils';
import '../Nav/Nav.css';
import { EqPanel } from '../Sect/EqPanel';
import { PlaylistPanel } from '../Playlist/PlaylistPanel';

export const Nav = () => {
    const {
        state,
        audioRef,
        progressRef,
        handleFilesChange,
        togglePanel,
        handleGainChange,
        handleSelectSong,
        togglePlayPause,
        handleStop,
        handleNext,
        handlePrevious,
        handleProgressClick,
        handleVolumeChange,
    } = usePlayerState();

    const playPauseIcon = state.isPlaying ? (
        <svg viewBox="0 0 24 24"><path d="M6 6h4v12h-4zM14 6h4v12h-4z" /></svg>
    ) : (
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
    );

    const currentSongName = state.songsList[state.currentSongIndex] ? state.songsList[state.currentSongIndex].name : 'Ընտրեք երգեր';

    return (
        <div className="winamp-container">
            <audio ref={audioRef} />
            <div className="header-panel">
                <span className="logo-text">WinHrach</span>
                <div className="window-controls">
                    <button className="win-control min-button">-</button>
                    <button className="win-control max-button"></button>
                    <button className="win-control close-button">x</button>
                </div>
            </div>
            <div className="top-panel">
                <div className="display-box time-display">
                    <svg className="play-indicator" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    {formatTime(state.currentTime)}
                </div>
                <div className="visualizer-box">
                    {state.visualizerBars.map((height, index) => (
                        <div key={index} className="visualizer-bar" style={{ height: `${height}%` }}></div>
                    ))}
                </div>
                <div className="song-info">
                    <marquee behavior="scroll" direction="left" scrollamount="4">
                        {currentSongName}
                    </marquee>
                    <div className="audio-info">
                        <span className="kbps">320 kbps</span>
                        <span className="khz">44 kHz</span>
                    </div>
                </div>
            </div>
            <div className="middle-panel">
                <div className="progress-bar-container" ref={progressRef} onClick={handleProgressClick}>
                    <div className="progress-bar" style={{ width: `${(state.currentTime / state.duration) * 100}%` }}></div>
                </div>
                <div className="mode-indicators">
                    <div className="volume-slider-container">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={state.volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                        />
                    </div>
                    <span className="stereo active">stereo</span>
                </div>
            </div>
            <div className="bottom-panel">
                <div className="playback-controls">
                    <button className="nav-button prev-track" onClick={handlePrevious}>
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M48 64a16 16 0 0 1 16-16h80c8.8 0 16 7.2 16 16v160.7l223.1-155a16 16 0 0 1 24.9 13.9v295a16 16 0 0 1 -24.9 13.9L160 287.3V448a16 16 0 0 1 -16 16H64a16 16 0 0 1 -16-16V64z" /></svg>
                    </button>
                    <button className="nav-button play" onClick={togglePlayPause}>
                        {playPauseIcon}
                    </button>
                    <button className="nav-button stop" onClick={handleStop}>
                        <svg viewBox="0 0 24 24"><path d="M6 6h12v12h-12z" /></svg>
                    </button>
                    <button className="nav-button next-track" onClick={handleNext}>
                        <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 448a16 16 0 0 1 -16 16h-80a16 16 0 0 1 -16-16v-160.7L128.9 442a16 16 0 0 1 -24.9-13.9V132a16 16 0 0 1 24.9-13.9L384 224.7V64a16 16 0 0 1 16-16h80a16 16 0 0 1 16 16V448z" /></svg>
                    </button>
                </div>
                <div className="eject-controls">
                    <label htmlFor="file-input" className="nav-button eject">
                        <svg viewBox="0 0 24 24"><path d="M12 2l-10 10h5v10h10v-10h5z" /></svg>
                    </label>
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept=".mp3,audio/*"
                        style={{ display: 'none' }}
                        onChange={handleFilesChange}
                    />
                    <button className="nav-button eq-button" onClick={() => togglePanel('eq')}>EQ</button>
                    <button className="nav-button pl-button" onClick={() => togglePanel('pl')}>PL</button>
                </div>
            </div>
            <EqPanel
                isVisible={state.showEqPanel}
                onToggle={() => togglePanel('eq')}
                onGainChange={handleGainChange}
            />
            <PlaylistPanel
                isVisible={state.showPlaylistPanel}
                onToggle={() => togglePanel('pl')}
                songsList={state.songsList}
                currentSongIndex={state.currentSongIndex}
                onSelectSong={handleSelectSong}
            />
        </div>
    );
};