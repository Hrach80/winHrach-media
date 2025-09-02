import React, { useState, useEffect } from 'react';
import './EqPanel.css';

export const EqPanel = ({ isVisible, onToggle, onGainChange }) => {
    const frequencies = [60, 170, 350, 1000, 3500, 10000, 16000];

    const presets = {
        'Custom': frequencies.reduce((acc, freq) => ({ ...acc, [freq]: 0 }), {}),
        'Rock': {
            60: 8,
            170: 4,
            350: 2,
            1000: 0,
            3500: 6,
            10000: 8,
            16000: 10,
        },
        'Pop': {
            60: 4,
            170: 2,
            350: 0,
            1000: 2,
            3500: 4,
            10000: 6,
            16000: 8,
        },
        'Classical': {
            60: 0,
            170: 0,
            350: 0,
            1000: 0,
            3500: 0,
            10000: 0,
            16000: 0,
        },
        'Jazz': {
            60: 2,
            170: 4,
            350: 6,
            1000: 4,
            3500: 2,
            10000: 4,
            16000: 6,
        },
    };

    const [currentPreset, setCurrentPreset] = useState('Custom');
    const [gains, setGains] = useState(presets['Custom']);

    useEffect(() => {
        onGainChange(gains);
    }, [gains, onGainChange]);

    const handlePresetChange = (e) => {
        const selectedPreset = e.target.value;
        setCurrentPreset(selectedPreset);
        const newGains = presets[selectedPreset];
        setGains(newGains);
        onGainChange(newGains);
    };

    const handleGainChange = (freq, e) => {
        const newGains = { ...gains, [freq]: parseFloat(e.target.value) };
        setGains(newGains);
        setCurrentPreset('Custom');
        onGainChange(newGains);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="eq-panel-container">
            <div className="eq-panel-header">
                <span>Equalizer</span>
                <button className="eq-close-btn" onClick={onToggle}>x</button>
            </div>
            <div className="eq-controls">
                <div className="eq-presets">
                    <label htmlFor="preset-select">Presets:</label>
                    <select id="preset-select" value={currentPreset} onChange={handlePresetChange}>
                        {Object.keys(presets).map((presetName) => (
                            <option key={presetName} value={presetName}>
                                {presetName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="eq-sliders">
                    {frequencies.map((freq) => (
                        <div key={freq} className="eq-slider-group">
                            <input
                                type="range"
                                min="-20"
                                max="20"
                                step="0.1"
                                value={gains[freq]}
                                onChange={(e) => handleGainChange(freq, e)}
                                className="eq-slider"
                            />
                            <span className="eq-freq">{freq} Hz</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};