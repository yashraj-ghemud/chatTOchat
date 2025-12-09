import { auth, database, storage } from './firebase-config.js';
import { onAuthStateChanged, signOut, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    ref, push, onChildAdded, off, set, onDisconnect, onValue, remove, query, limitToLast, get
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { showToast, parseMarkdown, debounce } from './utils.js';

// DOM Elements
const currentUserSpan = document.getElementById('current-user');
const currentUserAvatar = document.getElementById('current-user-avatar');
const logoutBtn = document.getElementById('logout-btn');
const profileUploadInput = document.getElementById('profile-upload');
const roomList = document.getElementById('room-list');
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const currentRoomNameSpan = document.getElementById('current-room-name');
const newRoomInput = document.getElementById('new-room-input');
const createRoomBtn = document.getElementById('create-room-btn');
const typingIndicator = document.getElementById('typing-indicator');
const onlineUsersList = document.getElementById('online-users-list');
const emojiBtn = document.getElementById('emoji-btn');
const searchBtn = document.getElementById('search-btn');
const roomInfoBtn = document.getElementById('room-info-btn');
const userCountBadge = document.getElementById('user-count');
const secretToggleBtn = document.getElementById('secret-toggle-btn');

let currentUser = null;
let currentRoom = 'general';
let messagesRef = null;
let typingRef = null;
let typingTimeout = null;
let isSecretMode = false;
let secretScanner = null;
let onlineUsersCache = [];

function renderCurrentUserAvatar(user) {
    if (!currentUserAvatar) return;
    const fallback = (user.displayName || user.email || 'Anonymous').charAt(0).toUpperCase();
    if (user.photoURL) {
        currentUserAvatar.innerHTML = `<img src="${user.photoURL}" alt="avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">`;
    } else {
        currentUserAvatar.textContent = fallback;
    }
}

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        const displayName = user.displayName || user.email || "Anonymous";
        currentUserSpan.textContent = displayName;
        renderCurrentUserAvatar(user);

        // Check Email Verification
        if (user.email && !user.emailVerified) {
            showToast('Please verify your email address.', 'info');
        }

        // Setup Presence System
        setupPresence(user);

        // Load Initial Data
        loadMessages(currentRoom);
        setupTypingListener(currentRoom);
        setupOnlineUsersListener();

        // Initialize secret scanner
        if (!secretScanner) {
            secretScanner = new window.SecretScanner();
        }

        showToast(`Welcome, ${displayName}`, 'success');
    } else {
        window.location.href = 'index.html';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    });
});

if (profileUploadInput) {
    profileUploadInput.addEventListener('change', handleProfileUpload);
}

// Secret Message Toggle
if (secretToggleBtn) {
    secretToggleBtn.addEventListener('click', () => {
        isSecretMode = !isSecretMode;
        secretToggleBtn.classList.toggle('active', isSecretMode);

        if (isSecretMode) {
            messageInput.placeholder = '🔒 Type your secret message...';
            showToast('Secret mode enabled', 'info');
        } else {
            messageInput.placeholder = 'Type a message... (Markdown supported)';
        }
    });
}

// Room Switching
roomList.addEventListener('click', (e) => {
    if (e.target.classList.contains('room-item')) {
        // Update UI
        document.querySelectorAll('.room-item').forEach(item => item.classList.remove('active'));
        e.target.classList.add('active');

        // Switch Room
        const newRoom = e.target.dataset.room;
        if (newRoom !== currentRoom) {
            currentRoom = newRoom;
            currentRoomNameSpan.textContent = currentRoom;

            // Cleanup old listeners
            if (messagesRef) off(messagesRef);
            if (typingRef) off(typingRef);

            // Load new room
            loadMessages(currentRoom);
            setupTypingListener(currentRoom);

            showToast(`Joined room: ${newRoom}`, 'info');
        }
    }
});

// Create Room
createRoomBtn.addEventListener('click', () => {
    const roomName = newRoomInput.value.trim().toLowerCase().replace(/\s+/g, '-');
    if (roomName) {
        const li = document.createElement('li');
        li.className = 'room-item';
        li.dataset.room = roomName;
        li.innerHTML = `<i class="fas fa-hashtag"></i> ${roomName}`;
        roomList.appendChild(li);
        newRoomInput.value = '';
        showToast(`Room created: ${roomName}`, 'success');

        // Cyber click effect
        createRoomBtn.classList.add('cyber-click');
        setTimeout(() => createRoomBtn.classList.remove('cyber-click'), 600);
        playCyberSound('click');
    }
});

// Emoji Picker Logic
const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🔥', '⭐', '🎉', '💯', '👋', '🙏', '💪', '🚀', '✨', '💡', '📱', '💻', '👻', '👽', '🤖', '👾', '🎃', '😺', '🙈', '🙉', '🙊', '💥', '💫', '💦', '💤', '💢', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭'];
const emojiPicker = document.getElementById('emoji-picker');

// Populate Emoji Picker
if (emojiPicker) {
    emojis.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.className = 'emoji-item';
        span.addEventListener('click', () => {
            messageInput.value += emoji;
            messageInput.focus();
            playCyberSound('click');
        });
        emojiPicker.appendChild(span);
    });
}

if (emojiBtn && emojiPicker) {
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing immediately
        emojiPicker.classList.toggle('hidden');
        
        // Cyber click effect
        emojiBtn.classList.add('cyber-click');
        setTimeout(() => emojiBtn.classList.remove('cyber-click'), 600);
        playCyberSound('click');
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
            emojiPicker.classList.add('hidden');
        }
    });
}

// Search functionality (placeholder)
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        showToast('Search feature coming soon!', 'info');
    });
}

// Room info functionality (placeholder)
if (roomInfoBtn) {
    roomInfoBtn.addEventListener('click', () => {
        showToast(`Room: ${currentRoom}\nCreated: General rooms\nMembers: See online list`, 'info');
    });
}

// Send Message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();

    if (text && currentUser) {
        if (isSecretMode) {
            // Show recipient selector for secret message
            const selector = new window.RecipientSelector(onlineUsersCache, (recipients) => {
                sendSecretMessage(text, recipients);
            });
            selector.show();
        } else {
            // Send normal message
            const roomRef = ref(database, `messages/${currentRoom}`);
            push(roomRef, {
                userId: currentUser.uid,
                username: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
                text: text,
                timestamp: Date.now(),
                photoURL: currentUser.photoURL || null
            });
            messageInput.value = '';

            // Cyber effect on send button
            const sendBtn = messageForm.querySelector('button[type="submit"]');
            if (sendBtn) {
                sendBtn.classList.add('cyber-click');
                setTimeout(() => sendBtn.classList.remove('cyber-click'), 600);
            }

            // Play send sound
            playCyberSound('send');

            // Clear typing status immediately
            const userTypingRef = ref(database, `typing/${currentRoom}/${currentUser.uid}`);
            remove(userTypingRef);
        }
    }
});

function sendSecretMessage(text, recipientIds) {
    const roomRef = ref(database, `messages/${currentRoom}`);
    push(roomRef, {
        userId: currentUser.uid,
        username: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
        text: text,
        timestamp: Date.now(),
        photoURL: currentUser.photoURL || null,
        isSecret: true,
        recipients: recipientIds
    });

    messageInput.value = '';
    isSecretMode = false;
    secretToggleBtn.classList.remove('active');
    messageInput.placeholder = 'Type a message... (Markdown supported)';

    showToast('Secret message sent! 🔒', 'success');
    playCyberSound('send');

    const userTypingRef = ref(database, `typing/${currentRoom}/${currentUser.uid}`);
    remove(userTypingRef);
}

// Typing Indicator Logic
messageInput.addEventListener('input', () => {
    if (!currentUser) return;

    const userTypingRef = ref(database, `typing/${currentRoom}/${currentUser.uid}`);
    set(userTypingRef, {
        username: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
        timestamp: Date.now()
    });

    // Clear typing status after 2 seconds of inactivity
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        remove(userTypingRef);
    }, 2000);
});

async function handleProfileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file.', 'error');
        event.target.value = '';
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        showToast('Image must be under 2MB.', 'error');
        event.target.value = '';
        return;
    }
    if (!currentUser) {
        showToast('You must be logged in to change photo.', 'error');
        return;
    }

    const uploadPath = `profile-photos/${currentUser.uid}/${Date.now()}-${file.name}`;
    const fileRef = storageRef(storage, uploadPath);

    try {
        showToast('Uploading photo...', 'info');
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        await updateProfile(currentUser, { photoURL: downloadURL });
        renderCurrentUserAvatar(currentUser);
        await refreshPresencePhoto(downloadURL);
        showToast('Profile photo updated.', 'success');
    } catch (error) {
        console.error('Profile photo update failed', error);
        showToast('Failed to update profile photo. Try again.', 'error');
    } finally {
        event.target.value = '';
    }
}

async function refreshPresencePhoto(photoURL) {
    if (!currentUser) return;
    const statusRef = ref(database, `status/${currentUser.uid}`);
    const snapshot = await get(statusRef);
    if (!snapshot.exists()) return;
    const entries = snapshot.val();
    const updates = Object.keys(entries).map(key => {
        const entry = { ...entries[key], photoURL };
        return set(ref(database, `status/${currentUser.uid}/${key}`), entry);
    });
    await Promise.all(updates);
}

function setupTypingListener(room) {
    typingRef = ref(database, `typing/${room}`);
    onValue(typingRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const typers = Object.values(data).filter(t => t.username !== (currentUser.displayName || currentUser.email?.split('@')[0]));
            if (typers.length > 0) {
                const names = typers.slice(0, 2).map(t => t.username).join(', ');
                const extra = typers.length > 2 ? ` and ${typers.length - 2} more` : '';
                typingIndicator.innerHTML = `<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span> ${names}${extra} typing`;
                typingIndicator.classList.add('visible');
            } else {
                typingIndicator.classList.remove('visible');
            }
        } else {
            typingIndicator.classList.remove('visible');
        }
    });
}

// Load Messages (Pagination: Last 50)
function loadMessages(room) {
    messagesContainer.innerHTML = '';

    messagesRef = query(ref(database, `messages/${room}`), limitToLast(50));

    onChildAdded(messagesRef, (snapshot) => {
        const message = snapshot.val();
        displayMessage(message);
    });
}

function displayMessage(message) {
    const div = document.createElement('div');
    const isOwn = message.userId === currentUser.uid;

    // Add cyber animation classes
    div.className = `message ${isOwn ? 'own-message cyber-send' : 'cyber-receive'}`;

    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const username = message.username || 'Anonymous';
    const avatar = username.charAt(0).toUpperCase();
    const photoURL = message.photoURL;

    // Check if it's a secret message
    if (message.isSecret) {
        const canView = message.recipients && (message.recipients.includes(currentUser.uid) || isOwn);

        if (!canView) {
            // Show locked message for non-recipients
            div.innerHTML = `
                ${!isOwn ? `<div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.85rem; margin-right: 8px; position: absolute; left: -40px; top: 0; overflow: hidden;">${photoURL ? `<img src="${photoURL}" alt="${username}" style="width: 100%; height: 100%; object-fit: cover;">` : avatar}</div>` : ''}
                <div class="message-header">
                    <span class="message-sender">${username}</span>
                    <span class="secret-badge"><i class="fas fa-lock"></i> Secret</span>
                    <span class="timestamp" style="opacity: 0.6; font-size: 0.7rem;">${time}</span>
                </div>
                <div class="message-content">
                    <div class="secret-message-blur locked"></div>
                </div>
            `;
        } else {
            // Show clickable secret message for recipients
            const formattedText = parseMarkdown(message.text);
            div.innerHTML = `
                ${!isOwn ? `<div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.85rem; margin-right: 8px; position: absolute; left: -40px; top: 0; overflow: hidden;">${photoURL ? `<img src="${photoURL}" alt="${username}" style="width: 100%; height: 100%; object-fit: cover;">` : avatar}</div>` : ''}
                <div class="message-header">
                    <span class="message-sender">${username}</span>
                    <span class="secret-badge"><i class="fas fa-unlock"></i> For You</span>
                    <span class="timestamp" style="opacity: 0.6; font-size: 0.7rem;">${time}</span>
                </div>
                <div class="message-content">
                    <div class="secret-message-container">
                        <div class="secret-message-blur locked" data-secret-text="${message.text}"></div>
                    </div>
                </div>
            `;

            // Add click handler to reveal
            const secretBlur = div.querySelector('.secret-message-blur');
            secretBlur.addEventListener('click', () => {
                if (secretScanner) {
                    secretScanner.reveal(message.text);
                }
            });
        }
    } else {
        // Normal message
        const formattedText = parseMarkdown(message.text);
        div.innerHTML = `
            ${!isOwn ? `<div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.85rem; margin-right: 8px; position: absolute; left: -40px; top: 0; overflow: hidden;">${photoURL ? `<img src="${photoURL}" alt="${username}" style="width: 100%; height: 100%; object-fit: cover;">` : avatar}</div>` : ''}
            <div class="message-header">
                <span class="message-sender">${username}</span>
                <span class="timestamp" style="opacity: 0.6; font-size: 0.7rem;">${time}</span>
            </div>
            <div class="message-content">${formattedText}</div>
        `;
    }

    messagesContainer.appendChild(div);

    // Add cyber glow effect to own messages
    if (isOwn) {
        setTimeout(() => {
            div.classList.add('cyber-glow');
            setTimeout(() => div.classList.remove('cyber-glow'), 800);
        }, 500);
    }

    // Play receive sound for other users' messages
    if (!isOwn) {
        playCyberSound('receive');
    }

    // Smooth scroll to bottom
    messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
    });
}

// Presence System
function setupPresence(user) {
    const connectedRef = ref(database, '.info/connected');
    const userStatusRef = ref(database, `status/${user.uid}`);

    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            const con = push(userStatusRef);

            // When I disconnect, remove this device
            onDisconnect(con).remove();

            // Add this device to my connections list
            set(con, {
                username: user.displayName || user.email?.split('@')[0] || "Anonymous",
                photoURL: user.photoURL || null,
                state: 'online',
                last_changed: Date.now()
            });
        }
    });
}

function setupOnlineUsersListener() {
    const statusRef = ref(database, 'status');
    onValue(statusRef, (snapshot) => {
        onlineUsersList.innerHTML = '';
        onlineUsersCache = []; // Clear cache
        const users = snapshot.val();
        let userCount = 0;

        if (users) {
            Object.keys(users).forEach(uid => {
                // Get the first connection for the user to get their name
                const connections = users[uid];
                const firstConnectionKey = Object.keys(connections)[0];
                const userData = connections[firstConnectionKey];

                if (userData && userData.state === 'online') {
                    userCount++;
                    const username = userData.username || 'Anonymous';
                    const avatar = username.charAt(0).toUpperCase();
                    const photoURL = userData.photoURL;

                    // Add to cache for recipient selection
                    if (uid !== currentUser?.uid) {
                        onlineUsersCache.push({ uid, username, photoURL });
                    }

                    const li = document.createElement('li');
                    li.className = 'user-item';
                    li.innerHTML = `
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.85rem; overflow: hidden;">
                            ${photoURL ? `<img src="${photoURL}" alt="${username}" style="width: 100%; height: 100%; object-fit: cover;">` : avatar}
                        </div>
                        <div class="user-info">
                            <div class="user-name">${username}</div>
                        </div>
                        <span class="status-dot"></span>
                    `;
                    onlineUsersList.appendChild(li);
                }
            });
        }

        // Update user count badge
        if (userCountBadge) {
            userCountBadge.textContent = userCount;
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus message input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        messageInput.focus();
    }
});

// Auto-resize message input on multiline (future enhancement placeholder)
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        messageForm.dispatchEvent(new Event('submit'));
    }
});

// Cyberpunk Sound Effects
function playCyberSound(type) {
    const soundMap = {
        'send': [200, 250, 300],
        'receive': [300, 250, 200],
        'click': [400, 450]
    };

    const frequencies = soundMap[type] || [300];
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = 'square';

        const startTime = audioContext.currentTime + (index * 0.05);
        gainNode.gain.setValueAtTime(0.05, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.1);
    });
}
