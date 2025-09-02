// src/components/usePlayerState.js

import { useState, useRef, useEffect, useCallback } from 'react';

export const usePlayerState = () => {
    const [state, setState] = useState({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 0.5,
        visualizerBars: Array(30).fill(0),
        showEqPanel: false,
        showPlaylistPanel: false,
        songsList: [],
        currentSongIndex: -1,
    });

    const audioRef = useRef(null);
    const progressRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const filtersRef = useRef({});

    const setupEqFilters = useCallback(() => {
        if (!audioContextRef.current || !sourceRef.current || Object.keys(filtersRef.current).length > 0) {
            return;
        }

        const frequencies = [60, 170, 350, 1000, 3500, 10000, 16000];
        let lastNode = sourceRef.current;

        frequencies.forEach(freq => {
            const filter = audioContextRef.current.createBiquadFilter();
            filter.type = "peaking";
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;

            lastNode.connect(filter);
            lastNode = filter;
            filtersRef.current[freq] = filter;
        });

        lastNode.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
    }, []);

    const setupAudioApi = useCallback((audio) => {
        if (audioContextRef.current) return;

        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();

        sourceRef.current = audioContextRef.current.createMediaElementSource(audio);

        setupEqFilters();
    }, [setupEqFilters]);

    const handleNext = useCallback(() => {
        if (state.songsList.length > 0) {
            const nextIndex = (state.currentSongIndex + 1) % state.songsList.length;
            setState(prev => ({ ...prev, currentSongIndex: nextIndex }));
        }
    }, [state.songsList, state.currentSongIndex]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const drawVisualizer = () => {
            const numberOfBars = 30;
            if (state.isPlaying && analyserRef.current) {
                analyserRef.current.getByteFrequencyData(dataArray);
                const newBars = Array.from({ length: numberOfBars }, (_, i) => dataArray[Math.floor(i * dataArray.length / numberOfBars)] * 0.8 || 0);
                setState(prev => ({ ...prev, visualizerBars: newBars }));
            } else {
                setState(prev => ({ ...prev, visualizerBars: Array(numberOfBars).fill(0) }));
            }
            requestAnimationFrame(drawVisualizer);
        };

        drawVisualizer();

        const handleTimeUpdate = () => setState(prev => ({ ...prev, currentTime: audio.currentTime, duration: audio.duration }));
        const handleEnded = () => handleNext();

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [state.isPlaying, handleNext]);

    useEffect(() => {
        const audio = audioRef.current;
        if (state.currentSongIndex >= 0 && state.songsList.length > 0) {
            const songUrl = URL.createObjectURL(state.songsList[state.currentSongIndex]);
            audio.src = songUrl;

            const onLoadedMetadata = () => {
                setupAudioApi(audio);
                setState(prev => ({ ...prev, duration: audio.duration }));
                audio.play().catch(e => console.error("Play failed:", e));
                setState(prev => ({ ...prev, isPlaying: true }));
            };

            audio.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
            audio.volume = state.volume;

            return () => URL.revokeObjectURL(songUrl);
        }
    }, [state.currentSongIndex, state.songsList, setupAudioApi]); // removed state.volume from dependency array

    const handleFilesChange = (e) => {
        const files = Array.from(e.target.files).filter(file => file.name.toLowerCase().endsWith('.mp3'));
        if (files.length > 0) {
            setState(prev => ({ ...prev, songsList: files, currentSongIndex: 0 }));
        } else {
            setState(prev => ({ ...prev, songsList: [], currentSongIndex: -1, isPlaying: false }));
            alert("Ընտրված ֆայլերի մեջ MP3 ֆայլեր չկան։");
        }
    };

    const togglePanel = useCallback((panel) => {
        setState(prev => ({
            ...prev,
            showEqPanel: panel === 'eq' ? !prev.showEqPanel : false,
            showPlaylistPanel: panel === 'pl' ? !prev.showPlaylistPanel : false,
        }));
    }, []);

    const handleGainChange = (newGains) => {
        if (!audioContextRef.current) return;
        for (const freq in newGains) {
            if (filtersRef.current[freq]) {
                filtersRef.current[freq].gain.value = newGains[freq];
            }
        }
    };

    const handleSelectSong = useCallback((index) => setState(prev => ({ ...prev, currentSongIndex: index })), []);

    const togglePlayPause = () => {
        if (state.songsList.length === 0) return;
        const audio = audioRef.current;
        if (state.isPlaying) {
            audio.pause();
        } else {
            if (audioContextRef.current) {
                audioContextRef.current.resume();
            }
            audio.play().catch(e => console.error("Play failed:", e));
        }
        setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    };

    const handleStop = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };

    const handlePrevious = () => {
        if (state.songsList.length > 0) {
            const prevIndex = (state.currentSongIndex - 1 + state.songsList.length) % state.songsList.length;
            setState(prev => ({ ...prev, currentSongIndex: prevIndex }));
        }
    };

    const handleProgressClick = (e) => {
        if (audioRef.current && progressRef.current) {
            audioRef.current.currentTime = (e.nativeEvent.offsetX / progressRef.current.clientWidth) * state.duration;
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        setState(prev => ({ ...prev, volume: newVolume }));
    };

    return {
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
    };
};