// ==UserScript==
// @name         Enable Right Click - Pinnacle
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Enables right-click and copy functionality on Pinnacle website
// @match        *://ebooks.ssccglpinnacle.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    
    // Override contextmenu event prevention
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        // Block contextmenu event listeners that prevent right-click
        if (type === 'contextmenu') {
            console.log('Blocked contextmenu event listener');
            return;
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Override document.addEventListener specifically for contextmenu
    const originalDocumentAddEventListener = document.addEventListener;
    document.addEventListener = function(type, listener, options) {
        if (type === 'contextmenu') {
            console.log('Blocked document contextmenu event listener');
            return;
        }
        return originalDocumentAddEventListener.call(this, type, listener, options);
    };
    
    // Override window.addEventListener for contextmenu
    const originalWindowAddEventListener = window.addEventListener;
    window.addEventListener = function(type, listener, options) {
        if (type === 'contextmenu') {
            console.log('Blocked window contextmenu event listener');
            return;
        }
        return originalWindowAddEventListener.call(this, type, listener, options);
    };
    
    // Override document.oncontextmenu
    Object.defineProperty(document, 'oncontextmenu', {
        get: function() {
            return null;
        },
        set: function() {
            // Do nothing - ignore attempts to set contextmenu handler
        },
        configurable: true
    });
    
    // Override window.oncontextmenu
    Object.defineProperty(window, 'oncontextmenu', {
        get: function() {
            return null;
        },
        set: function() {
            // Do nothing - ignore attempts to set contextmenu handler
        },
        configurable: true
    });
    
    // Override preventDefault on contextmenu events
    const originalPreventDefault = Event.prototype.preventDefault;
    Event.prototype.preventDefault = function() {
        if (this.type === 'contextmenu') {
            console.log('Blocked contextmenu preventDefault');
            return; // Don't prevent default for contextmenu
        }
        return originalPreventDefault.call(this);
    };
    
    // Override returnValue to prevent contextmenu blocking
    Object.defineProperty(Event.prototype, 'returnValue', {
        get: function() {
            return true; // Always allow contextmenu
        },
        set: function(value) {
            if (this.type === 'contextmenu') {
                console.log('Blocked contextmenu returnValue override');
                return; // Don't allow setting returnValue for contextmenu
            }
        },
        configurable: true
    });
    
    // Override copy protection
    const originalQuerySelector = document.querySelector;
    document.querySelector = function(selector) {
        // Block queries that might be looking for copy protection elements
        if (typeof selector === 'string' && (
            selector.includes('copy') || 
            selector.includes('select') || 
            selector.includes('text') ||
            selector.includes('content')
        )) {
            return null;
        }
        return originalQuerySelector.call(this, selector);
    };
    
    // Override document.querySelectorAll for copy protection
    const originalQuerySelectorAll = document.querySelectorAll;
    document.querySelectorAll = function(selector) {
        // Block queries that might be looking for copy protection elements
        if (typeof selector === 'string' && (
            selector.includes('copy') || 
            selector.includes('select') || 
            selector.includes('text') ||
            selector.includes('content')
        )) {
            return [];
        }
        return originalQuerySelectorAll.call(this, selector);
    };
    
    // Remove copy protection styles
    function removeCopyProtection() {
        // Remove user-select: none styles
        const styleSheets = document.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.style && rule.style.userSelect === 'none') {
                        rule.style.userSelect = 'text';
                        console.log('Removed user-select: none');
                    }
                }
            } catch (e) {
                // Cross-origin stylesheets will throw errors
            }
        }
        
        // Remove inline styles that prevent selection
        const elements = document.querySelectorAll('*');
        elements.forEach(function(element) {
            if (element.style.userSelect === 'none' || 
                element.style.webkitUserSelect === 'none' || 
                element.style.mozUserSelect === 'none' || 
                element.style.msUserSelect === 'none') {
                element.style.userSelect = 'text';
                element.style.webkitUserSelect = 'text';
                element.style.mozUserSelect = 'text';
                element.style.msUserSelect = 'text';
                console.log('Removed inline user-select: none');
            }
        });
    }
    
    // Remove copy protection periodically
    setInterval(removeCopyProtection, 2000);
    
    // Override clipboard events
    const originalClipboardData = Object.getOwnPropertyDescriptor(Event.prototype, 'clipboardData');
    if (originalClipboardData) {
        Object.defineProperty(Event.prototype, 'clipboardData', {
            get: function() {
                return {
                    setData: function(type, data) {
                        // Allow clipboard operations
                        return true;
                    },
                    getData: function(type) {
                        return '';
                    },
                    clearData: function(type) {
                        return true;
                    }
                };
            },
            configurable: true
        });
    }
    
    // Override document.execCommand to allow copy
    const originalExecCommand = document.execCommand;
    document.execCommand = function(command, showUI, value) {
        if (command === 'copy' || command === 'cut') {
            console.log('Allowing copy/cut command');
            return true; // Always allow copy/cut
        }
        return originalExecCommand.call(this, command, showUI, value);
    };
    
    // Override window.getSelection to always return a valid selection
    const originalGetSelection = window.getSelection;
    window.getSelection = function() {
        const selection = originalGetSelection.call(this);
        if (!selection || selection.rangeCount === 0) {
            // Create a fake selection if none exists
            const range = document.createRange();
            range.selectNodeContents(document.body);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        return selection;
    };
    
    // Override document.getSelection as well
    document.getSelection = window.getSelection;
    
    // Remove any existing copy protection overlays
    setInterval(function() {
        const protectionElements = document.querySelectorAll('[class*="copy"], [class*="select"], [class*="text"], [class*="content"]');
        protectionElements.forEach(function(element) {
            const text = element.textContent || element.innerText || '';
            if (text.includes('copy') || text.includes('select') || text.includes('text')) {
                element.style.display = 'none';
                element.remove();
            }
        });
    }, 1000);
    
    // Override console.log to prevent debugging
    const originalConsoleLog = console.log;
    console.log = function(...args) {
        const message = args.join(' ');
        if (message.includes('contextmenu') || message.includes('copy') || message.includes('select')) {
            return; // Don't log copy protection related messages
        }
        return originalConsoleLog.apply(console, args);
    };
    
    // Add a visual indicator that right-click is enabled
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #4CAF50;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 999999;
        opacity: 0.8;
    `;
    indicator.textContent = 'Right-click enabled';
    document.body.appendChild(indicator);
    
    // Remove indicator after 3 seconds
    setTimeout(function() {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 3000);
    
    console.log('Right-click enable script loaded successfully!');
    
})(); 