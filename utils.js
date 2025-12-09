// Toast Notification System with Icons
export function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        info: '<i class="fas fa-info-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-title">${icons[type] || ''} ${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <span class="toast-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="toast-body">${message}</div>
    `;

    container.appendChild(toast);

    // Animation in
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4500);
}

// Enhanced Markdown Parser with more features
export function parseMarkdown(text) {
    let html = text
        // Escape HTML first to prevent XSS
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Headers (# text)
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold (**text** or __text__)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        // Italic (*text* or _text_)
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Strikethrough (~~text~~)
        .replace(/~~(.*?)~~/g, '<del>$1</del>')
        // Code (`text`)
        .replace(/`(.*?)`/g, '<code>$1</code>')
        // Links ([text](url))
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Line breaks
        .replace(/\n/g, '<br>');

    return html;
}

// Debounce Function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle Function (for performance optimization)
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Format timestamp to relative time (e.g., "2 minutes ago")
export function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
}

// Sanitize user input (additional XSS prevention)
export function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Copy text to clipboard
export function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy', 'error');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showToast('Copied to clipboard!', 'success');
        } catch (err) {
            showToast('Failed to copy', 'error');
        }
        document.body.removeChild(textarea);
    }
}

// Validate email format
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Generate random color for user avatars
export function getRandomColor() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#00f2fe', '#43e97b', '#fa709a', '#fee140',
        '#30cfd0', '#a8edea', '#ff6b9d', '#c471f5'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Format file size (for future file upload feature)
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Detect mobile device
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Play notification sound (placeholder)
export function playNotificationSound() {
    // Can be enhanced with actual audio file
    const audio = new Audio('data:audio/wav;base64,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');
    audio.volume = 0.3;
    audio.play().catch(() => {
        // Silently fail if audio playback is blocked
    });
}

// Local storage helpers
export const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Storage error:', e);
        }
    },
    clear: () => {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
};
