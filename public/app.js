class JarvisHUD {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isListening = false;
    this.isSpeaking = false;
    this.isRecording = false;
    this.responses = [];
    this.memories = [];
    this.diagnostics = {};
    this.currentState = 'idle';
    this.conversationHistory = [];
    
    this.init();
  }

  /**
   * Initialize HUD
   */
  init() {
    this.render();
    this.connectWebSocket();
    this.attachEventListeners();
    this.loadMemories();
    this.checkHealth();
  }

  /**
   * Render HUD interface
   */
  render() {
    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="hud-container">
        <div class="hud-header">
          <div class="hud-title">◆ J.A.R.V.I.S. ◆</div>
          <div class="status-indicator">
            <div class="status-dot" id="statusDot"></div>
            <div class="status-text" id="statusText">INITIALIZING</div>
            <div class="state-indicator" id="stateIndicator">IDLE</div>
          </div>
        </div>

        <div class="hud-main">
          <div class="panel left-panel">
            <div class="panel-title">► ASSISTANT OUTPUT</div>
            <div id="responseContainer"></div>
          </div>

          <div class="panel right-panel">
            <div class="panel-title">► SYSTEM DIAGNOSTICS</div>
            <div id="diagnosticContainer"></div>
            <div class="panel-title" style="margin-top: 20px;">► MEMORY</div>
            <div id="memoryContainer"></div>
          </div>
        </div>

        <div class="input-section">
          <input 
            type="text" 
            id="userInput" 
            class="input-field" 
            placeholder="Enter command or say 'Hey JARVIS'..."
            autocomplete="off"
          >
          <button id="sendBtn" class="btn">SEND</button>
          <button id="voiceBtn" class="btn">VOICE</button>
        </div>
      </div>
    `;
  }

  /**
   * Connect to WebSocket server
   */
  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}`;
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      this.isConnected = true;
      this.updateStatus('ONLINE', false);
      this.addResponse('JARVIS', 'Systems initializing, sir.');
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onerror = (error) => {
      this.updateStatus('ERROR', true);
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      this.updateStatus('OFFLINE', true);
      console.log('WebSocket disconnected');
      setTimeout(() => this.connectWebSocket(), 3000);
    };
  }

  /**
   * Handle WebSocket messages
   */
  handleMessage(message) {
    switch (message.type) {
      case 'assistant_response':
        this.handleAssistantResponse(message);
        break;
      case 'system_status':
        this.handleSystemStatus(message);
        break;
      case 'state_change':
        this.updateState(message.state);
        break;
      case 'alert':
        this.handleAlert(message);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  /**
   * Handle assistant response
   */
  handleAssistantResponse(message) {
    this.addResponse('JARVIS', message.text);
    this.isSpeaking = true;
    this.updateState('speaking');

    if (message.audio) {
      this.playAudio(message.audio);
    }

    // Simulate speech duration
    const duration = message.text.split(' ').length * 150;
    setTimeout(() => {
      this.isSpeaking = false;
      this.updateState('idle');
    }, duration);
  }

  /**
   * Handle system status
   */
  handleSystemStatus(message) {
    this.diagnostics = message.diagnostics || {};
    this.updateDiagnostics();
    if (message.message) {
      this.addResponse('SYSTEM', message.message);
    }
  }

  /**
   * Handle alert
   */
  handleAlert(message) {
    this.addResponse('ALERT', message.message, 'alert');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const sendBtn = document.getElementById('sendBtn');
    const voiceBtn = document.getElementById('voiceBtn');
    const userInput = document.getElementById('userInput');

    sendBtn.addEventListener('click', () => this.sendMessage());
    voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
    
    userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  /**
   * Send message to backend
   */
  sendMessage() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();

    if (!text) return;

    this.addResponse('USER', text);
    this.updateState('processing');

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'voice_input',
        text: text,
      }));
    }

    input.value = '';
    input.focus();
  }

  /**
   * Toggle voice input
   */
  toggleVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (this.isRecording) {
      this.stopVoiceInput();
    } else {
      this.startVoiceInput();
    }
  }

  /**
   * Start voice input
   */
  startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    this.isRecording = true;
    this.updateVoiceButton();
    this.updateState('listening');

    recognition.onstart = () => {
      console.log('Listening...');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        document.getElementById('userInput').value = finalTranscript;
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.updateState('error');
    };

    recognition.onend = () => {
      this.isRecording = false;
      this.updateVoiceButton();
      
      const input = document.getElementById('userInput');
      if (input.value.trim()) {
        this.sendMessage();
      }
    };

    recognition.start();
  }

  /**
   * Stop voice input
   */
  stopVoiceInput() {
    this.isRecording = false;
    this.updateVoiceButton();
  }

  /**
   * Update voice button state
   */
  updateVoiceButton() {
    const btn = document.getElementById('voiceBtn');
    if (this.isRecording) {
      btn.classList.add('recording');
      btn.textContent = 'STOP';
    } else {
      btn.classList.remove('recording');
      btn.textContent = 'VOICE';
    }
  }

  /**
   * Play audio response
   */
  playAudio(audioData) {
    if (!audioData) return;

    // Create audio element and play
    const audio = new Audio();
    
    if (typeof audioData === 'string') {
      audio.src = `data:audio/wav;base64,${audioData}`;
    } else {
      const blob = new Blob([audioData], { type: 'audio/wav' });
      audio.src = URL.createObjectURL(blob);
    }
    
    audio.play().catch(err => {
      console.error('Failed to play audio:', err);
    });
  }

  /**
   * Add response to interface
   */
  addResponse(sender, text, type = 'normal') {
    const container = document.getElementById('responseContainer');
    
    const responseBox = document.createElement('div');
    responseBox.className = 'response-box';
    if (type === 'alert') responseBox.style.borderLeftColor = '#f00';
    
    responseBox.innerHTML = `
      <div class="response-label">${sender}</div>
      <div class="response-text">${this.escapeHtml(text)}</div>
    `;

    container.appendChild(responseBox);
    container.scrollTop = container.scrollHeight;

    this.responses.push({ sender, text, timestamp: new Date() });
  }

  /**
   * Update state indicator
   */
  updateState(state) {
    this.currentState = state;
    const indicator = document.getElementById('stateIndicator');
    indicator.textContent = state.toUpperCase();
    indicator.className = `state-indicator ${state}`;
  }

  /**
   * Update status indicator
   */
  updateStatus(text, isError = false) {
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    
    statusText.textContent = text;
    if (isError) {
      statusDot.classList.add('offline');
    } else {
      statusDot.classList.remove('offline');
    }
  }

  /**
   * Update diagnostics display
   */
  updateDiagnostics() {
    const container = document.getElementById('diagnosticContainer');
    container.innerHTML = '';

    for (const [component, status] of Object.entries(this.diagnostics)) {
      const item = document.createElement('div');
      item.className = 'diagnostic-item';
      
      if (status.status === 'offline') {
        item.classList.add('offline');
      }

      item.innerHTML = `
        <div style="text-transform: uppercase; font-weight: bold;">
          ${component}: ${status.status.toUpperCase()}
        </div>
        ${status.error ? `<div style="opacity: 0.7; font-size: 11px;">${status.error}</div>` : ''}
        ${status.toolCount ? `<div style="opacity: 0.7; font-size: 11px;">Tools: ${status.toolCount}</div>` : ''}
      `;

      container.appendChild(item);
    }
  }

  /**
   * Load and display memories
   */
  async loadMemories() {
    try {
      const response = await fetch('/api/memory');
      const memories = await response.json();
      this.memories = memories;
      this.updateMemoriesDisplay();
    } catch (error) {
      console.error('Failed to load memories:', error);
    }
  }

  /**
   * Update memories display
   */
  updateMemoriesDisplay() {
    const container = document.getElementById('memoryContainer');
    container.innerHTML = '';

    if (this.memories.length === 0) {
      container.innerHTML = '<div class="diagnostic-item">No memories recorded yet.</div>';
      return;
    }

    this.memories.slice(0, 5).forEach(memory => {
      const item = document.createElement('div');
      item.className = 'memory-item';
      
      const content = typeof memory.content === 'string' 
        ? memory.content 
        : JSON.stringify(memory.content);

      item.innerHTML = `
        <div class="memory-category">${memory.category}</div>
        <div class="memory-content">${this.escapeHtml(content.substring(0, 60))}</div>
      `;

      container.appendChild(item);
    });
  }

  /**
   * Check system health
   */
  async checkHealth() {
    try {
      const response = await fetch('/api/health');
      const health = await response.json();
      
      if (health.status === 'healthy') {
        this.updateStatus('ONLINE', false);
      } else {
        this.updateStatus('DEGRADED', false);
      }

      this.diagnostics = health.components || {};
      this.updateDiagnostics();
    } catch (error) {
      this.updateStatus('OFFLINE', true);
      console.error('Health check failed:', error);
    }

    // Check again every 10 seconds
    setTimeout(() => this.checkHealth(), 10000);
  }

  /**
   * Escape HTML for safe display
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize HUD when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new JarvisHUD();
});