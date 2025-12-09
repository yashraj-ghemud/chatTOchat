// Secret Message Scanner Animation System

class SecretScanner {
    constructor() {
        this.modal = null;
        this.particleSystem = null;
        this.particleScanner = null;
        this.isScanning = false;
        this.currentMessage = '';
        this.scanProgress = 0;

        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'scanner-modal';
        modal.innerHTML = `
      <canvas id="secret-particle-canvas"></canvas>
      <canvas id="secret-scanner-canvas"></canvas>
      
      <div class="scanner-modal-content">
        <div class="scanner-card-wrapper">
          <div class="scanner-card scanner-card-normal" id="secret-card-normal">
            <div id="secret-message-text"></div>
          </div>
          <div class="scanner-card scanner-card-ascii">
            <div class="scanner-ascii-content" id="secret-ascii-content"></div>
          </div>
        </div>
      </div>
      
      <button class="scanner-close-btn" id="scanner-close">×</button>
      <div class="scanner-status" id="scanner-status">INITIALIZING SCAN...</div>
    `;

        document.body.appendChild(modal);
        this.modal = modal;

        document.getElementById('scanner-close').addEventListener('click', () => this.close());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
    }

    generateCode(width, height) {
        const codeChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?";
        const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const pick = (arr) => arr[randInt(0, arr.length - 1)];

        const library = [
            "// encrypted message decoder",
            "const DECRYPT_KEY = 0x" + Math.random().toString(16).substring(2, 10),
            "function decode(msg) { return atob(msg); }",
            "const verify = (hash) => sha256(hash);",
            "class SecureChannel { constructor() { this.key = genKey(); } }",
            "const timestamp = Date.now();",
            "if (authenticated) { reveal(message); }",
            "const cipher = AES.encrypt(data, key);",
            "function unlock() { state.locked = false; }",
        ];

        let flow = library.join(" ");
        const totalChars = width * height;
        while (flow.length < totalChars + width) {
            flow += " " + pick(library);
        }

        let out = "";
        let offset = 0;
        for (let row = 0; row < height; row++) {
            let line = flow.slice(offset, offset + width);
            if (line.length < width) line = line + " ".repeat(width - line.length);
            out += line + (row < height - 1 ? "\n" : "");
            offset += width;
        }
        return out;
    }

    generateScrambledMessage(message) {
        // Create a scrambled version that will be revealed
        const scrambleChars = "█▓▒░╬╫╪┼┴┬┤├╚╔╩╦╠═║╗╝░▒▓█!@#$%^&*(){}[]<>?";
        let scrambled = '';

        for (let i = 0; i < message.length; i++) {
            if (message[i] === ' ' || message[i] === '\n') {
                scrambled += message[i];
            } else {
                const randChar = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                scrambled += randChar;
            }
        }

        return scrambled;
    }

    updateDecryptionEffect(progress) {
        const asciiContent = document.getElementById('secret-ascii-content');
        const message = this.currentMessage;
        const revealCount = Math.floor(message.length * progress);
        const scrambleChars = "█▓▒░╬╫╪┼┴┬┤├╚╔╩╦╠═║╗╝░▒▓█!@#$%^&*(){}[]<>?";

        let html = '';

        // 1. Revealed Part
        const revealedText = message.substring(0, revealCount);
        if (revealedText) {
            html += `<span class="decoded-text">${revealedText}</span>`;
        }

        // 2. Decoding Edge (Flux)
        // A small window of characters right after the revealed part that changes rapidly
        const fluxWindow = 3;
        for (let i = revealCount; i < Math.min(revealCount + fluxWindow, message.length); i++) {
            if (message[i] === ' ' || message[i] === '\n') {
                html += message[i];
            } else {
                const randChar = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                html += `<span class="flux-text">${randChar}</span>`;
            }
        }

        // 3. Scrambled Part
        for (let i = revealCount + fluxWindow; i < message.length; i++) {
            if (message[i] === ' ' || message[i] === '\n') {
                html += message[i];
            } else {
                // Occasionally change a character to make it look alive
                if (Math.random() < 0.1) {
                    const randChar = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    html += `<span class="encrypted-text">${randChar}</span>`;
                } else {
                    // We need to maintain state if we want stability, but for now random is okay if it's fast enough
                    // Or we can just use a deterministic random based on index + time if we want "stable but glitchy"
                    // For simplicity, let's just pick a random char, it will look like noise
                    const randChar = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
                    html += `<span class="encrypted-text">${randChar}</span>`;
                }
            }
        }

        asciiContent.innerHTML = html;
    }

    initParticleSystem() {
        const canvas = document.getElementById('secret-particle-canvas');
        const scene = new THREE.Scene();

        const camera = new THREE.OrthographicCamera(
            -window.innerWidth / 2,
            window.innerWidth / 2,
            150,
            -150,
            1,
            1000
        );
        camera.position.z = 100;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
        });
        renderer.setSize(window.innerWidth, 300);
        renderer.setClearColor(0x000000, 0);

        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
            positions[i * 3 + 2] = 0;

            colors[i * 3] = 1;
            colors[i * 3 + 1] = 1;
            colors[i * 3 + 2] = 1;

            sizes[i] = Math.random() * 15 + 5;
            velocities[i] = Math.random() * 80 + 40;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const alphas = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
            alphas[i] = (Math.random() * 6 + 4) / 10;
        }
        geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

        const canvas2d = document.createElement('canvas');
        canvas2d.width = 100;
        canvas2d.height = 100;
        const ctx = canvas2d.getContext('2d');
        const half = 50;
        const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
        gradient.addColorStop(0.025, '#fff');
        gradient.addColorStop(0.1, 'hsl(217, 61%, 33%)');
        gradient.addColorStop(0.25, 'hsl(217, 64%, 6%)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(half, half, half, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(canvas2d);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                pointTexture: { value: texture },
                size: { value: 15.0 },
            },
            vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        varying vec3 vColor;
        uniform float size;
        
        void main() {
          vAlpha = alpha;
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform sampler2D pointTexture;
        varying float vAlpha;
        varying vec3 vColor;
        
        void main() {
          gl_FragColor = vec4(vColor, vAlpha) * texture2D(pointTexture, gl_PointCoord);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        this.particleSystem = {
            scene,
            camera,
            renderer,
            particles,
            velocities,
            alphas,
            particleCount,
            animate: function () {
                if (!this.particles) return;

                const positions = this.particles.geometry.attributes.position.array;
                const alphas = this.particles.geometry.attributes.alpha.array;

                for (let i = 0; i < this.particleCount; i++) {
                    positions[i * 3] += this.velocities[i] * 0.016;

                    if (positions[i * 3] > window.innerWidth / 2 + 100) {
                        positions[i * 3] = -window.innerWidth / 2 - 100;
                        positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
                    }
                }

                this.particles.geometry.attributes.position.needsUpdate = true;
                this.renderer.render(this.scene, this.camera);
            }
        };
    }

    initScannerBeam() {
        const canvas = document.getElementById('secret-scanner-canvas');
        const ctx = canvas.getContext('2d');
        const w = window.innerWidth;
        const h = 350;

        canvas.width = w;
        canvas.height = h;

        const particles = [];
        let particleCount = 0;
        const maxParticles = 2500;
        const lightBarX = w / 2;
        const lightBarWidth = 3;
        const fadeZone = 35;

        const gradientCanvas = document.createElement('canvas');
        const gradientCtx = gradientCanvas.getContext('2d');
        gradientCanvas.width = 16;
        gradientCanvas.height = 16;

        const half = 8;
        const gradient = gradientCtx.createRadialGradient(half, half, 0, half, half, half);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(196, 181, 253, 0.8)');
        gradient.addColorStop(0.7, 'rgba(139, 92, 246, 0.4)');
        gradient.addColorStop(1, 'transparent');

        gradientCtx.fillStyle = gradient;
        gradientCtx.arc(half, half, half, 0, Math.PI * 2);
        gradientCtx.fill();

        const createParticle = () => ({
            x: lightBarX + (Math.random() - 0.5) * lightBarWidth,
            y: Math.random() * h,
            vx: Math.random() * 1.5 + 0.5,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.2 + 0.5,
            alpha: Math.random() * 0.4 + 0.6,
            life: 1.0,
            decay: Math.random() * 0.015 + 0.01,
        });

        for (let i = 0; i < maxParticles; i++) {
            particles.push(createParticle());
            particleCount++;
        }

        this.particleScanner = {
            canvas,
            ctx,
            w,
            h,
            particles,
            particleCount,
            maxParticles,
            lightBarX,
            lightBarWidth,
            fadeZone,
            gradientCanvas,
            createParticle,
            render: function () {
                this.ctx.clearRect(0, 0, this.w, this.h);

                // Draw light bar
                const verticalGradient = this.ctx.createLinearGradient(0, 0, 0, this.h);
                verticalGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                verticalGradient.addColorStop(this.fadeZone / this.h, 'rgba(255, 255, 255, 1)');
                verticalGradient.addColorStop(1 - this.fadeZone / this.h, 'rgba(255, 255, 255, 1)');
                verticalGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                this.ctx.globalCompositeOperation = 'lighter';
                this.ctx.globalAlpha = 1;
                this.ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                this.ctx.fillRect(this.lightBarX - this.lightBarWidth / 2, 0, this.lightBarWidth, this.h);

                const glowGradient = this.ctx.createLinearGradient(this.lightBarX - 20, 0, this.lightBarX + 20, 0);
                glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
                glowGradient.addColorStop(0.5, 'rgba(196, 181, 253, 0.8)');
                glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

                this.ctx.fillStyle = glowGradient;
                this.ctx.fillRect(this.lightBarX - 20, 0, 40, this.h);

                this.ctx.globalCompositeOperation = 'destination-in';
                this.ctx.fillStyle = verticalGradient;
                this.ctx.fillRect(0, 0, this.w, this.h);

                // Draw particles
                this.ctx.globalCompositeOperation = 'lighter';
                for (let i = 0; i < this.particleCount; i++) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= p.decay;

                    if (p.x > this.w + 10 || p.life <= 0) {
                        Object.assign(p, this.createParticle());
                    }

                    let fadeAlpha = 1;
                    if (p.y < this.fadeZone) fadeAlpha = p.y / this.fadeZone;
                    else if (p.y > this.h - this.fadeZone) fadeAlpha = (this.h - p.y) / this.fadeZone;

                    this.ctx.globalAlpha = p.alpha * p.life * Math.max(0, Math.min(1, fadeAlpha));
                    this.ctx.drawImage(this.gradientCanvas, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);
                }
            }
        };
    }

    async reveal(message) {
        this.currentMessage = message;
        this.modal.classList.add('active');
        this.isScanning = true;
        this.scanProgress = 0;

        // Set final message
        document.getElementById('secret-message-text').textContent = message;

        // Initialize ASCII content with scrambled message
        const asciiContent = document.getElementById('secret-ascii-content');
        asciiContent.textContent = this.generateScrambledMessage(message);

        // Initialize systems
        this.initParticleSystem();
        this.initScannerBeam();

        // Start animation
        this.startScanAnimation();
    }

    startScanAnimation() {
        const wrapper = document.querySelector('.scanner-card-wrapper');
        const normalCard = document.getElementById('secret-card-normal');
        const asciiCard = normalCard.nextElementSibling;
        const status = document.getElementById('scanner-status');

        const duration = 4000; // 4 seconds for full pass
        const startTime = Date.now();

        // Movement configuration
        const cardWidth = 500;
        const startX = 400; // Start offset (right)
        const endX = -400;  // End offset (left)
        const totalDistance = startX - endX;

        const animate = () => {
            if (!this.isScanning) return;

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.scanProgress = progress;

            // 1. Animate Card Position (Right to Left)
            const currentX = startX - (totalDistance * progress);
            wrapper.style.transform = `translateX(${currentX}px)`;

            // 2. Calculate Intersection with Center Laser
            // Laser is at 0 relative to the centered wrapper's coordinate system
            // Card Left Edge = currentX - cardWidth/2
            // Card Right Edge = currentX + cardWidth/2
            // We want the percentage of the card that has passed the laser (is to the left of 0)

            // If currentX = cardWidth/2 (Right edge at 0), 0% passed
            // If currentX = -cardWidth/2 (Left edge at 0), 100% passed

            // Let's map currentX from [cardWidth/2] to [-cardWidth/2] -> 0 to 1
            // Actually, let's use a wider range to ensure full scan
            // The visual "cut" is at X=0.
            // The part of the card where x < 0 (relative to center) is "passed".
            // Card local x goes from -250 to 250.
            // Global X of a point P on card = currentX + P_local.
            // We want P_local such that Global X < 0.
            // currentX + P_local < 0  =>  P_local < -currentX.
            // So the cut line on the card is at P_local = -currentX.
            // Map P_local (-250 to 250) to 0% to 100%.
            // percent = (P_local - (-250)) / 500 = (P_local + 250) / 500.
            // percent = (-currentX + 250) / 500.

            let clipPercent = (-currentX + (cardWidth / 2)) / cardWidth;
            clipPercent = Math.max(0, Math.min(1, clipPercent));

            // 3. Update Clipping
            const percentage = clipPercent * 100;
            // Normal card reveals from left to right (unclipping right side)
            normalCard.style.setProperty('--reveal-right', `${100 - percentage}%`);
            // ASCII card hides from left to right (clipping left side)
            asciiCard.style.setProperty('--hide-left', `${percentage}%`);

            // 4. Update Decryption Effect
            this.updateDecryptionEffect(clipPercent);

            // Update status
            if (progress < 0.2) {
                status.textContent = 'ALIGNING...';
            } else if (progress < 0.8) {
                status.textContent = 'DECRYPTING...';
            } else {
                status.textContent = 'SCAN COMPLETE';
            }

            // Animate particles
            if (this.particleSystem) {
                this.particleSystem.animate();
            }

            if (this.particleScanner) {
                this.particleScanner.render();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    close() {
        this.isScanning = false;
        this.modal.classList.remove('active');

        // Cleanup
        if (this.particleSystem && this.particleSystem.renderer) {
            this.particleSystem.renderer.dispose();
            this.particleSystem = null;
        }
        this.particleScanner = null;
    }
}

// Recipient Selector
class RecipientSelector {
    constructor(onlineUsers, onSend) {
        this.onlineUsers = onlineUsers;
        this.onSend = onSend;
        this.selectedRecipients = new Set();
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'recipient-selector-modal';
        modal.innerHTML = `
      <div class="recipient-selector-content">
        <h3>🔒 Select Recipients for Secret Message</h3>
        <div class="recipient-list" id="recipient-list"></div>
        <div class="recipient-actions">
          <button class="btn-cancel" id="recipient-cancel">Cancel</button>
          <button class="btn-send" id="recipient-send">Send Secret</button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);
        this.modal = modal;

        document.getElementById('recipient-cancel').addEventListener('click', () => this.close());
        document.getElementById('recipient-send').addEventListener('click', () => this.send());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
    }

    show() {
        this.selectedRecipients.clear();
        this.renderRecipients();
        this.modal.classList.add('active');
    }

    renderRecipients() {
        const list = document.getElementById('recipient-list');
        list.innerHTML = '';

        this.onlineUsers.forEach(user => {
            const item = document.createElement('div');
            item.className = 'recipient-item';
            item.innerHTML = `
        <input type="checkbox" id="user-${user.uid}" value="${user.uid}">
        <label for="user-${user.uid}" style="cursor: pointer; flex: 1;">${user.username}</label>
      `;

            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedRecipients.add(user.uid);
                } else {
                    this.selectedRecipients.delete(user.uid);
                }
            });

            list.appendChild(item);
        });
    }

    send() {
        if (this.selectedRecipients.size === 0) {
            alert('Please select at least one recipient');
            return;
        }

        this.onSend(Array.from(this.selectedRecipients));
        this.close();
    }

    close() {
        this.modal.classList.remove('active');
    }
}

// Export for use
window.SecretScanner = SecretScanner;
window.RecipientSelector = RecipientSelector;
