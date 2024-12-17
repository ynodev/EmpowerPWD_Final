import { useState, useEffect } from 'react';
import { Accessibility, VolumeX, Volume2, X } from 'lucide-react';

const AccessibilityWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [settings, setSettings] = useState({
        fontSize: 'default',
        textStyle: 'default',
        letterSpacing: 'default',
        lineSpacing: 'default',
        readingMask: 'off',
        readingGuide: 'off',
        contentMagnifier: 'off',
        stopAnimations: 'off',
        colorContrast: 'default',
        saturation: 'default',
        readPage: 'off',
        readingSpeed: 'default'
    });

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [caption, setCaption] = useState({ words: [], currentIndex: -1 });
    const [isTextSelectionMode, setIsTextSelectionMode] = useState(false);
    const [selectedTextSpeed, setSelectedTextSpeed] = useState(1);
    const [isSelectedTextSpeaking, setIsSelectedTextSpeaking] = useState(false);

    // Apply styles when settings change
    useEffect(() => {
        const root = document.documentElement;
        
        // Font Size
        switch(settings.fontSize) {
            case 'low':
                root.style.fontSize = '14px';
                break;
            case 'high':
                root.style.fontSize = '20px';
                break;
            default:
                root.style.fontSize = '16px';
        }

        // Text Style
        switch(settings.textStyle) {
            case 'low':
                root.style.fontWeight = '300';
                break;
            case 'high':
                root.style.fontWeight = '700';
                break;
            default:
                root.style.fontWeight = '400';
        }

        // Letter Spacing
        switch(settings.letterSpacing) {
            case 'low':
                root.style.letterSpacing = '0px';
                break;
            case 'high':
                root.style.letterSpacing = '1.5px';
                break;
            default:
                root.style.letterSpacing = 'normal';
        }

        // Line Spacing
        switch(settings.lineSpacing) {
            case 'low':
                root.style.lineHeight = '1.2';
                break;
            case 'high':
                root.style.lineHeight = '2';
                break;
            default:
                root.style.lineHeight = '1.5';
        }

        // Add transition for smooth changes
        root.style.transition = 'all 0.3s ease';

    }, [settings]);

    // Navigation Features Effect
    useEffect(() => {
        // Reading Mask
        if (settings.readingMask === 'on') {
            // Create mask element
            const mask = document.createElement('div');
            mask.id = 'reading-mask';
            
            // Set initial styles
            Object.assign(mask.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: '9998', // Below other accessibility features
                transition: 'background 0.1s ease-out'
            });

            document.body.appendChild(mask);

            let rafId;
            let lastY = 0;
            const THROTTLE_THRESHOLD = 5; // pixels
            const MASK_HEIGHT = 100; // Height of the reading window

            const updateMaskPosition = (y) => {
                // Throttle updates
                if (Math.abs(y - lastY) < THROTTLE_THRESHOLD) {
                    return;
                }
                
                lastY = y;

                if (rafId) {
                    cancelAnimationFrame(rafId);
                }

                rafId = requestAnimationFrame(() => {
                    mask.style.background = `
                        linear-gradient(
                            to bottom,
                            rgba(0, 0, 0, 0.65) 0,
                            rgba(0, 0, 0, 0.65) ${y - MASK_HEIGHT/2}px,
                            transparent ${y - MASK_HEIGHT/2}px,
                            transparent ${y + MASK_HEIGHT/2}px,
                            rgba(0, 0, 0, 0.65) ${y + MASK_HEIGHT/2}px,
                            rgba(0, 0, 0, 0.65) 100%
                        )
                    `;
                });
            };

            const handleMouseMove = (e) => {
                updateMaskPosition(e.clientY);
            };

            // Handle touch events
            const handleTouch = (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                updateMaskPosition(touch.clientY);
            };

            // Add event listeners
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('touchmove', handleTouch, { passive: false });

            // Initial position at center of screen
            updateMaskPosition(window.innerHeight / 2);

            // Cleanup function
            return () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('touchmove', handleTouch);
                mask.remove();
            };
        } else {
            // Remove existing mask if setting is turned off
            const existingMask = document.getElementById('reading-mask');
            if (existingMask) {
                existingMask.remove();
            }
        }

        // Reading Guide
        if (settings.readingGuide === 'on') {
            const guide = document.createElement('div');
            guide.id = 'reading-guide';
            guide.style.position = 'fixed';
            guide.style.height = '2px';
            guide.style.width = '100%';
            guide.style.background = '#007AFF';
            guide.style.pointerEvents = 'none';
            guide.style.zIndex = '9999';
            document.body.appendChild(guide);

            const handleMouseMove = (e) => {
                guide.style.top = `${e.clientY}px`;
            };

            document.addEventListener('mousemove', handleMouseMove);
            return () => document.removeEventListener('mousemove', handleMouseMove);
        } else {
            const existingGuide = document.getElementById('reading-guide');
            if (existingGuide) existingGuide.remove();
        }

        // Content Magnifier
        if (settings.contentMagnifier === 'on') {
            // Create magnifier only once
            const magnifier = document.createElement('div');
            magnifier.id = 'content-magnifier';
            
            // Apply all styles at once for better performance
            Object.assign(magnifier.style, {
                position: 'fixed',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                border: '2px solid #007AFF',
                pointerEvents: 'none',
                zIndex: '9999',
                display: 'none',
                backgroundColor: 'white',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                overflow: 'hidden'
            });

            document.body.appendChild(magnifier);

            let rafId;
            let lastX = 0;
            let lastY = 0;
            const THROTTLE_THRESHOLD = 10; // pixels

            const handleMouseMove = (e) => {
                const x = e.clientX;
                const y = e.clientY;

                // Throttle updates based on mouse movement distance
                if (Math.abs(x - lastX) < THROTTLE_THRESHOLD && 
                    Math.abs(y - lastY) < THROTTLE_THRESHOLD) {
                    return;
                }

                lastX = x;
                lastY = y;

                // Cancel any pending animation frame
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }

                rafId = requestAnimationFrame(() => {
                    // Position magnifier
                    magnifier.style.display = 'block';
                    magnifier.style.left = `${x - 100}px`;
                    magnifier.style.top = `${y - 100}px`;

                    // Get element under cursor
                    const elementUnderCursor = document.elementFromPoint(x, y);
                    
                    if (elementUnderCursor && elementUnderCursor !== magnifier) {
                        // Clear previous content
                        while (magnifier.firstChild) {
                            magnifier.removeChild(magnifier.firstChild);
                        }

                        // Clone and enhance
                        const clone = elementUnderCursor.cloneNode(true);
                        const rect = elementUnderCursor.getBoundingClientRect();
                        
                        // Apply all styles at once
                        Object.assign(clone.style, {
                            position: 'absolute',
                            transform: 'scale(1.5)',
                            transformOrigin: 'center center',
                            left: `${-((x - rect.left) * 1.5) + 100}px`,
                            top: `${-((y - rect.top) * 1.5) + 100}px`,
                            width: `${rect.width}px`,
                            height: `${rect.height}px`
                        });

                        magnifier.appendChild(clone);
                    }
                });
            };

            const hideMagnifier = () => {
                magnifier.style.display = 'none';
            };

            // Event listeners
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseleave', hideMagnifier);
            magnifier.addEventListener('mousemove', hideMagnifier);

            // Cleanup
            return () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseleave', hideMagnifier);
                magnifier.removeEventListener('mousemove', hideMagnifier);
                magnifier.remove();
            };
        } else {
            // Remove existing magnifier if setting is turned off
            const existingMagnifier = document.getElementById('content-magnifier');
            if (existingMagnifier) {
                existingMagnifier.remove();
            }
        }

        // Stop Animations
        if (settings.stopAnimations === 'on') {
            const style = document.createElement('style');
            style.id = 'stop-animations';
            style.textContent = `
                * {
                    animation: none !important;
                    transition: none !important;
                }
            `;
            document.head.appendChild(style);
        } else {
            const existingStyle = document.getElementById('stop-animations');
            if (existingStyle) existingStyle.remove();
        }

        // Cleanup function
        return () => {
            const mask = document.getElementById('reading-mask');
            const guide = document.getElementById('reading-guide');
            const magnifier = document.getElementById('content-magnifier');
            const stopAnimations = document.getElementById('stop-animations');
            
            if (mask) mask.remove();
            if (guide) guide.remove();
            if (magnifier) magnifier.remove();
            if (stopAnimations) stopAnimations.remove();
        };
    }, [settings]);

    useEffect(() => {
        const root = document.documentElement;
        
        // Get contrast value
        let contrastValue;
        switch(settings.colorContrast) {
            case 'high':
                contrastValue = '150%';
                break;
            case 'low':
                contrastValue = '75%';
                break;
            default:
                contrastValue = '100%';
        }

        // Get saturation value
        let saturationValue;
        switch(settings.saturation) {
            case 'high':
                saturationValue = '150%';
                break;
            case 'low':
                saturationValue = '50%';
                break;
            default:
                saturationValue = '100%';
        }

        // Apply both filters together
        root.style.filter = `contrast(${contrastValue}) saturate(${saturationValue})`;

    }, [settings.colorContrast, settings.saturation]);

    const toggleSetting = (key) => {
        const fontControlSettings = ['fontSize', 'textStyle', 'letterSpacing', 'lineSpacing', 'colorContrast', 'saturation', 'readingSpeed'];
        
        if (key === 'readPage') {
            handleTextToSpeech();
            return;
        }
        
        if (fontControlSettings.includes(key)) {
            setSettings(prev => ({
                ...prev,
                [key]: prev[key] === 'default' ? 'high' : 
                       prev[key] === 'high' ? 'low' : 
                       'default'
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                [key]: prev[key] === 'off' ? 'on' : 'off'
            }));
        }
    };

    const CardButton = ({ icon, title, value, settingKey }) => {
        const isFontControl = ['fontSize', 'textStyle', 'letterSpacing', 'lineSpacing', 'readingSpeed'].includes(settingKey);
        
        const getStateColor = () => {
            if (settingKey === 'readPage') {
                return isSpeaking ? 'text-green-500' : 'text-blue-500';
            }
            if (isFontControl) {
                return value === 'default' ? 'text-blue-500' : 
                       value === 'high' ? 'text-green-500' : 
                       'text-orange-500';
            }
            return value === 'on' ? 'text-green-500' : 'text-red-500';
        };

        const getProgressWidth = () => {
            if (settingKey === 'readPage') {
                return isSpeaking ? 'w-full' : 'w-0';
            }
            if (isFontControl) {
                return value === 'default' ? 'w-1/3' : 
                       value === 'high' ? 'w-full' : 
                       'w-1/6';
            }
            return value === 'on' ? 'w-full' : 'w-0';
        };

        const getProgressColor = () => {
            if (settingKey === 'readPage') {
                return isSpeaking ? 'bg-green-500' : 'bg-blue-500';
            }
            if (isFontControl) {
                return value === 'default' ? 'bg-blue-500' : 
                       value === 'high' ? 'bg-green-500' : 
                       'bg-orange-500';
            }
            return value === 'on' ? 'bg-green-500' : 'bg-red-500';
        };

        // Get display text for Read Page button
        const getDisplayText = () => {
            if (settingKey === 'readPage') {
                return isSpeaking ? 'Speaking...' : 'Click to Read';
            }
            if (!value) return '';
            return value.charAt(0).toUpperCase() + value.slice(1);
        };

        return (
            <button 
                onClick={() => toggleSetting(settingKey)}
                className="bg-gray-50 p-3 rounded-lg w-full text-left hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="flex justify-between mb-2">
                    <span className="text-gray-700">{icon}</span>
                    <span className="text-gray-500 text-sm">{title}</span>
                </div>
                <div className={`text-sm ${getStateColor()}`}>
                    {getDisplayText()}
                </div>
                <div className="mt-2 h-1 bg-gray-200 rounded">
                    <div 
                        className={`h-full rounded transition-all duration-300 ${getProgressWidth()} ${getProgressColor()}`}
                    />
                </div>
            </button>
        );
    };

    const handleReset = () => {
        setSettings({
            fontSize: 'default',
            textStyle: 'default',
            letterSpacing: 'default',
            lineSpacing: 'default',
            readingMask: 'off',
            readingGuide: 'off',
            contentMagnifier: 'off',
            stopAnimations: 'off',
            colorContrast: 'default',
            saturation: 'default',
            readPage: 'off',
            readingSpeed: 'default'
        });
    };

    // Add this helper function to split text into sentences
    const splitIntoSentences = (text) => {
        // Split on periods, exclamation marks, or question marks followed by spaces
        return text.match(/[^.!?]+[.!?]+/g) || [];
    };

    // Update the handleTextToSpeech function
    const handleTextToSpeech = () => {
        if (!window.speechSynthesis) {
            alert('Sorry, your browser does not support text to speech!');
            return;
        }

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCaption({ words: [], currentIndex: -1 });
            return;
        }

        // Get selected text or all readable content
        const selectedText = window.getSelection().toString();
        const content = selectedText || getReadableContent();
        
        if (!content) {
            alert('No content to read!');
            return;
        }

        const sentences = splitIntoSentences(content);
        if (sentences.length === 0) {
            alert('No readable sentences found!');
            return;
        }

        setCaption({ words: sentences, currentIndex: -1 });

        // Create utterance for each sentence
        const speakSentences = (index = 0) => {
            if (index >= sentences.length) {
                setIsSpeaking(false);
                setCaption({ words: [], currentIndex: -1 });
                return;
            }

            const utterance = new SpeechSynthesisUtterance(sentences[index].trim());
            
            // Get available voices
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            
            // Set speech rate based on settings
            switch(settings.readingSpeed) {
                case 'low':
                    utterance.rate = 0.7;
                    break;
                case 'high':
                    utterance.rate = 1.5;
                    break;
                default:
                    utterance.rate = 1;
            }

            utterance.onstart = () => {
                setCaption(prev => ({ ...prev, currentIndex: index }));
            };

            utterance.onend = () => {
                // Speak next sentence
                speakSentences(index + 1);
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                setIsSpeaking(false);
                setCaption({ words: [], currentIndex: -1 });
            };

            window.speechSynthesis.speak(utterance);
        };

        setIsSpeaking(true);
        speakSentences(0);
    };

    const getReadableContent = () => {
        // Get all text content while excluding the accessibility widget itself
        const accessibilityWidget = document.querySelector('.accessibility-widget');
        const clone = document.body.cloneNode(true);
        if (accessibilityWidget) {
            const widgetClone = clone.querySelector('.accessibility-widget');
            if (widgetClone) {
                widgetClone.remove();
            }
        }

        // Get text from specific content areas (adjust selectors based on your site structure)
        const contentAreas = clone.querySelectorAll('main, article, .content');
        if (contentAreas.length > 0) {
            return Array.from(contentAreas)
                .map(area => area.innerText)
                .join('\n');
        }

        // Fallback to body text
        return clone.innerText;
    };

    useEffect(() => {
        // Load voices when they become available
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };
        
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Cleanup speech synthesis when component unmounts
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Update the CaptionBox component to show only the current sentence
    const CaptionBox = () => {
        if (!isSpeaking || !caption.words || caption.words.length === 0) return null;
        
        const currentSentence = caption.words[caption.currentIndex];
        if (!currentSentence) return null;

        return (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-3xl w-full mx-auto">
                <div className="bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-blue-900/95 
                              backdrop-blur-sm rounded-xl shadow-2xl p-6 text-center 
                              border border-blue-700/30">
                    <div className="text-2xl tracking-wide leading-relaxed text-white">
                        {currentSentence.trim()}
                    </div>
                    <div className="mt-2 h-1 bg-gray-200/20 rounded">
                        <div 
                            className="h-full rounded bg-blue-500 transition-all duration-300"
                            style={{ width: `${((caption.currentIndex + 1) / caption.words.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // Add this function to handle text selection reading
    const handleTextSelection = () => {
        if (!window.speechSynthesis) {
            alert('Sorry, your browser does not support text to speech!');
            return;
        }

        setIsTextSelectionMode(!isTextSelectionMode);

        if (isTextSelectionMode) {
            window.speechSynthesis.cancel();
            document.removeEventListener('mouseup', handleSelectedText);
        } else {
            document.addEventListener('mouseup', handleSelectedText);
        }
    };

    // Function to handle selected text
    const handleSelectedText = () => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(selectedText);
            
            // Set voice and rate
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(voice => voice.lang.startsWith('en'));
            if (englishVoice) {
                utterance.voice = englishVoice;
            }
            utterance.rate = selectedTextSpeed;

            utterance.onstart = () => {
                setIsSelectedTextSpeaking(true);
            };

            utterance.onend = () => {
                setIsSelectedTextSpeaking(false);
            };

            utterance.onerror = () => {
                setIsSelectedTextSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    // Add function to stop speaking
    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSelectedTextSpeaking(false);
    };

    // Add cleanup in useEffect
    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            document.removeEventListener('mouseup', handleSelectedText);
        };
    }, []);

    return (
        <>
            <div className="fixed right-4 bottom-10 z-50 accessibility-widget">
                {isOpen && (
                    <div className="absolute right-0 bottom-full mb-2 w-80 bg-white rounded-xl shadow-xl overflow-hidden max-h-[480px] flex flex-col">
                        {/* Header */}
                        <div className="bg-blue-500 text-white p-3 flex justify-between items-center sticky top-0 z-10">
                            <span className="font-medium">Accessibility Menu</span>
                            <div className="flex gap-3">
                                <button onClick={handleReset}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button onClick={() => setIsOpen(false)}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1">
                            <div className="p-4 space-y-6">
                                {/* Font Control Section */}
                                <div>
                                    <h3 className="font-bold mb-3">Font Control</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <CardButton
                                            icon="A+"
                                            title="Font size"
                                            value={settings.fontSize}
                                            settingKey="fontSize"
                                        />
                                        <CardButton
                                            icon="T"
                                            title="Text Style"
                                            value={settings.textStyle}
                                            settingKey="textStyle"
                                        />
                                        <CardButton
                                            icon="A"
                                            title="Letter Spacing"
                                            value={settings.letterSpacing}
                                            settingKey="letterSpacing"
                                        />
                                        <CardButton
                                            icon="≡"
                                            title="Line Spacing"
                                            value={settings.lineSpacing}
                                            settingKey="lineSpacing"
                                        />
                                    </div>
                                </div>

                                {/* Navigation Section */}
                                <div>
                                    <h3 className="font-bold mb-3">Navigation</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <CardButton
                                            icon="📑"
                                            title="Reading Mask"
                                            value={settings.readingMask}
                                            settingKey="readingMask"
                                        />
                                        <CardButton
                                            icon="📖"
                                            title="Reading Guide"
                                            value={settings.readingGuide}
                                            settingKey="readingGuide"
                                        />
                                        <CardButton
                                            icon="🔍"
                                            title="Content Magnifier"
                                            value={settings.contentMagnifier}
                                            settingKey="contentMagnifier"
                                        />
                                        <CardButton
                                            icon="⏸"
                                            title="Stop Animations"
                                            value={settings.stopAnimations}
                                            settingKey="stopAnimations"
                                        />
                                        <CardButton
                                            icon="⚡"
                                            title="Reading Speed"
                                            value={settings.readingSpeed}
                                            settingKey="readingSpeed"
                                        />
                                        <CardButton
                                            icon="🔊"
                                            title="Read Page"
                                            value={settings.readPage}
                                            settingKey="readPage"
                                        />
                                        <button
                                            onClick={handleTextSelection}
                                            className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                                                isTextSelectionMode 
                                                    ? 'bg-blue-50 border-blue-200' 
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100">
                                                    {isSelectedTextSpeaking ? (
                                                        <VolumeX className="w-4 h-4 text-blue-600" />
                                                    ) : (
                                                        <Volume2 className="w-4 h-4 text-blue-600" />
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-gray-900">Text Selection</div>
                                                    <div className="text-xs text-gray-500">
                                                        {isSelectedTextSpeaking 
                                                            ? 'Speaking...' 
                                                            : isTextSelectionMode 
                                                                ? 'Mode Active' 
                                                                : 'Select text to read'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                                                isTextSelectionMode ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}>
                                                <div className={`w-4 h-4 mt-1 ml-1 bg-white rounded-full transition-transform duration-200 ${
                                                    isTextSelectionMode ? 'transform translate-x-5' : ''
                                                }`} />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Color Control Section */}
                                <div>
                                    <h3 className="font-bold mb-3">Color Control</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <CardButton
                                            icon="🌓"
                                            title="Color Contrast"
                                            value={settings.colorContrast}
                                            settingKey="colorContrast"
                                        />
                                        <CardButton
                                            icon="🌗"
                                            title="Saturation"
                                            value={settings.saturation}
                                            settingKey="saturation"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Accessibility Toggle Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600"
                    aria-label="Accessibility Options"
                >
                    <Accessibility className="h-6 w-6" />
                </button>
            </div>
            <CaptionBox />
            {isTextSelectionMode && (
                <div className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-xl shadow-lg flex items-center gap-4 p-2 z-50">
                    <div className="flex items-center gap-2 px-2">
                        <Volume2 className="w-4 h-4" />
                        <span className="text-sm">
                            {isSelectedTextSpeaking ? 'Speaking...' : 'Select text to read'}
                        </span>
                    </div>

                    {/* Speed Control */}
                    <select
                        value={selectedTextSpeed}
                        onChange={(e) => setSelectedTextSpeed(Number(e.target.value))}
                        className="text-xs bg-blue-700 text-white border border-blue-500 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                    </select>

                    {/* Control Buttons */}
                    <div className="flex items-center gap-2 border-l border-blue-500 pl-4">
                        {isSelectedTextSpeaking && (
                            <button
                                onClick={stopSpeaking}
                                className="p-1.5 hover:bg-blue-700 rounded-lg transition-colors"
                                title="Stop"
                            >
                                <VolumeX className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={handleTextSelection}
                            className="p-1.5 hover:bg-blue-700 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AccessibilityWidget; 