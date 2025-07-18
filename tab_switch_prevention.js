// ==UserScript==
// @name         Tab Switch Prevention - Pinnacle
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Prevents websites from detecting tab switching and browser focus changes
// @match        *://ebooks.ssccglpinnacle.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    // Override Page Visibility API
    Object.defineProperty(document, 'hidden', {
        get: function() {
            return false; // Always return false to indicate page is visible
        },
        configurable: true
    });
    
    Object.defineProperty(document, 'visibilityState', {
        get: function() {
            return 'visible'; // Always return visible
        },
        configurable: true
    });
    
    // Override document.hasFocus()
    const originalHasFocus = document.hasFocus;
    document.hasFocus = function() {
        return true; // Always return true to indicate document has focus
    };
    
    // Override window.onblur and window.onfocus
    const originalOnBlur = window.onblur;
    const originalOnFocus = window.onfocus;
    
    window.onblur = null;
    window.onfocus = null;
    
    // Prevent visibilitychange events
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        // Block visibilitychange, blur, and focus events
        if (type === 'visibilitychange' || type === 'blur' || type === 'focus') {
            console.log(`Blocked ${type} event listener`);
            return;
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Override document.addEventListener specifically for visibilitychange
    const originalDocumentAddEventListener = document.addEventListener;
    document.addEventListener = function(type, listener, options) {
        if (type === 'visibilitychange' || type === 'blur' || type === 'focus') {
            console.log(`Blocked document ${type} event listener`);
            return;
        }
        return originalDocumentAddEventListener.call(this, type, listener, options);
    };
    
    // Override window.addEventListener for focus/blur
    const originalWindowAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'blur' || type === 'focus') {
            console.log(`Blocked window ${type} event listener`);
            return;
        }
        return originalWindowAddEventListener.call(this, type, listener, options);
    };
    
    // Override document.onvisibilitychange
    Object.defineProperty(document, 'onvisibilitychange', {
        get: function() {
            return null;
        },
        set: function() {
            // Do nothing - ignore attempts to set visibility change handler
        },
        configurable: true
    });
    
    // Override window.onblur and window.onfocus properties
    Object.defineProperty(window, 'onblur', {
        get: function() {
            return null;
        },
        set: function() {
            // Do nothing - ignore attempts to set blur handler
        },
        configurable: true
    });
    
    Object.defineProperty(window, 'onfocus', {
        get: function() {
            return null;
        },
        set: function() {
            // Do nothing - ignore attempts to set focus handler
        },
        configurable: true
    });
    
    // Override document.onblur and document.onfocus
    Object.defineProperty(document, 'onblur', {
        get: function() {
            return null;
        },
        set: function() {
            // Do nothing - ignore attempts to set blur handler
        },
        configurable: true
    });
    
    Object.defineProperty(document, 'onfocus', {
        get: function() {
            return null;
        },
        set: function() {
            // Do nothing - ignore attempts to set focus handler
        },
        configurable: true
    });
    
    // Override requestAnimationFrame to prevent timing-based detection
    const originalRequestAnimationFrame = window.requestAnimationFrame;
    window.requestAnimationFrame = function(callback) {
        // Call the callback immediately to prevent timing-based detection
        return originalRequestAnimationFrame.call(this, function(timestamp) {
            callback(timestamp);
        });
    };
    
    // Override setTimeout to prevent timing-based detection
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = function(func, delay, ...args) {
        // If delay is very short (likely for focus detection), execute immediately
        if (delay < 100) {
            return originalSetTimeout.call(this, func, 0, ...args);
        }
        return originalSetTimeout.call(this, func, delay, ...args);
    };
    
    // Override setInterval to prevent timing-based detection
    const originalSetInterval = window.setInterval;
    window.setInterval = function(func, delay, ...args) {
        // If delay is very short (likely for focus detection), use longer delay
        if (delay < 100) {
            return originalSetInterval.call(this, func, 1000, ...args);
        }
        return originalSetInterval.call(this, func, delay, ...args);
    };
    
    // Override document.activeElement to always return a valid element
    Object.defineProperty(document, 'activeElement', {
        get: function() {
            return document.body; // Always return body as active element
        },
        configurable: true
    });
    
    // Override document.querySelector to prevent finding error messages
    const originalQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
        // Block queries that might be looking for error messages
        if (typeof selector === 'string' && (
            selector.includes('error') || 
            selector.includes('message') || 
            selector.includes('alert') ||
            selector.includes('warning')
        )) {
            return null;
        }
        return originalQuerySelector.call(this, selector);
    };
    
    // Override document.querySelectorAll for the same reason
    const originalQuerySelectorAll = document.querySelectorAll;
    document.querySelectorAll = function(selector) {
        // Block queries that might be looking for error messages
        if (typeof selector === 'string' && (
            selector.includes('error') || 
            selector.includes('message') || 
            selector.includes('alert') ||
            selector.includes('warning')
        )) {
            return [];
        }
        return originalQuerySelectorAll.call(this, selector);
    };
    
    // Remove any existing error messages periodically
    setInterval(function() {
        const errorElements = document.querySelectorAll('[class*="error"], [class*="message"], [class*="alert"], [class*="warning"]');
        errorElements.forEach(function(element) {
            const text = element.textContent || element.innerText || '';
            if (text.includes('switched tabs') || text.includes('browser focus') || text.includes('reload content')) {
                element.style.display = 'none';
                element.remove();
            }
        });
    }, 1000);
    
    // Override console.log to prevent debugging
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        const message = args.join(' ');
        if (message.includes('visibility') || message.includes('focus') || message.includes('blur')) {
            return; // Don't log visibility/focus related messages
        }
        return originalConsoleLog.apply(console, args);
    };
    
    console.log('Tab switch prevention script loaded successfully!');
    
})(); 