class QRScanner {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.scanning = false;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Mode buttons
        this.cameraBtn = document.getElementById('cameraBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        
        // Sections
        this.cameraSection = document.getElementById('cameraSection');
        this.uploadSection = document.getElementById('uploadSection');
        
        // Camera controls
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.captureBtn = document.getElementById('captureBtn');
        
        // Upload elements
        this.fileInput = document.getElementById('fileInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.uploadedImage = document.getElementById('uploadedImage');
        
        // Results
        this.resultContent = document.getElementById('resultContent');
        this.copyBtn = document.getElementById('copyBtn');
        this.status = document.getElementById('status');
    }

    bindEvents() {
        // Mode switching
        this.cameraBtn.addEventListener('click', () => this.switchMode('camera'));
        this.uploadBtn.addEventListener('click', () => this.switchMode('upload'));
        
        // Camera controls
        this.startBtn.addEventListener('click', () => this.startCamera());
        this.stopBtn.addEventListener('click', () => this.stopCamera());
        this.captureBtn.addEventListener('click', () => this.captureAndScan());
        
        // Upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Copy button
        this.copyBtn.addEventListener('click', () => this.copyResult());
    }

    switchMode(mode) {
        if (mode === 'camera') {
            this.cameraBtn.classList.add('active');
            this.uploadBtn.classList.remove('active');
            this.cameraSection.classList.add('active');
            this.uploadSection.classList.remove('active');
        } else {
            this.uploadBtn.classList.add('active');
            this.cameraBtn.classList.remove('active');
            this.uploadSection.classList.add('active');
            this.cameraSection.classList.remove('active');
            this.stopCamera(); // Stop camera when switching to upload mode
        }
        this.clearStatus();
    }

    async startCamera() {
        try {
            this.showStatus('Starting camera...', 'info');
            
            const constraints = {
                video: {
                    facingMode: 'environment', // Use back camera if available
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
            };

            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.captureBtn.disabled = false;
            
            this.showStatus('Camera started successfully!', 'success');
            
            // Start continuous scanning
            this.startContinuousScanning();
            
        } catch (error) {
            console.error('Error starting camera:', error);
            this.showStatus('Error starting camera: ' + error.message, 'error');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.video.srcObject = null;
        this.scanning = false;
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.captureBtn.disabled = true;
        
        this.showStatus('Camera stopped', 'info');
    }

    startContinuousScanning() {
        this.scanning = true;