
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const voiceSelect = document.getElementById('voiceSelect');
    const dialogPrompt = document.getElementById('dialogPrompt');
    const inputText = document.getElementById('inputText');
    const addDialogBtn = document.getElementById('addDialogBtn');
    const dialogContainer = document.getElementById('dialogContainer');
    const clearDialogBtn = document.getElementById('clearDialogBtn');
    const generateBtn = document.getElementById('generateBtn');
    const playAllBtn = document.getElementById('playAllBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playbackSpeed = document.getElementById('playbackSpeed');
    
    // Dialog data storage
    let dialogData = [];
    let currentPlayingIndex = -1;
    let audioElements = [];
    
    // Load sample dialog
    loadSampleDialog();
    
    // Event Listeners
    addDialogBtn.addEventListener('click', addDialogEntry);
    clearDialogBtn.addEventListener('click', clearDialog);
    generateBtn.addEventListener('click', generateTTS);
    playAllBtn.addEventListener('click', playAllDialog);
    pauseBtn.addEventListener('click', pausePlayback);
    stopBtn.addEventListener('click', stopPlayback);
    playbackSpeed.addEventListener('input', updatePlaybackSpeed);
    
    // Functions
    async function loadSampleDialog() {
        const timestamp = new Date().getTime();
        
        try {
            // Fetch the sample.json file
            const response = await fetch(`sample.json?t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const sampleDialog = await response.json();
            
            // Clear the container and update dialog data
            dialogContainer.innerHTML = '';
            dialogData = [...sampleDialog];
            
            // Add each dialog entry to the container
            dialogData.forEach((entry, index) => {
                addDialogToContainer(entry, index);
            });
            
        } catch (error) {
            console.error('Error loading sample dialog:', error);
            // Fallback to hardcoded sample or show error message
            dialogContainer.innerHTML = '<p class="text-center text-danger">Error loading sample dialog. Please check if sample.json exists.</p>';
        }
    }
    
    function addDialogEntry() {
        const voice = voiceSelect.value;
        const prompt = dialogPrompt.value;
        const text = inputText.value;
        
        if (!text.trim()) {
            alert('Please enter some text for the dialog.');
            return;
        }
        
        const newEntry = {
            voice_name: voice,
            input_text: text,
            dialog_prompt: prompt || `Dialog entry ${dialogData.length + 1}`
        };
        
        dialogData.push(newEntry);
        addDialogToContainer(newEntry, dialogData.length - 1);
        
        // Clear input fields
        inputText.value = '';
        dialogPrompt.value = '';
    }
    
    function addDialogToContainer(entry, index) {
        const dialogElement = document.createElement('div');
        dialogElement.className = `dialog-bubble ${index % 2 === 0 ? 'user' : 'ai'}`;
        dialogElement.dataset.index = index;
        
        dialogElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${entry.dialog_prompt}</strong>
                    <p class="mb-1">${entry.input_text}</p>
                    <small class="text-muted">Voice: ${entry.voice_name}</small>
                </div>
                <i class="fas fa-play-circle fa-lg play-btn" data-index="${index}"></i>
            </div>
        `;
        
        if (dialogContainer.querySelector('.text-center')) {
            dialogContainer.innerHTML = '';
        }
        
        dialogContainer.appendChild(dialogElement);
        
        // Add event listener to the play button
        dialogElement.querySelector('.play-btn').addEventListener('click', function() {
            playDialogItem(index);
        });
    }
    
    function clearDialog() {
        if (confirm('Are you sure you want to clear all dialog entries?')) {
            dialogData = [];
            dialogContainer.innerHTML = '<p class="text-center text-muted mt-4">Your dialog will appear here</p>';
            stopPlayback();
        }
    }
    
    async function generateTTS() {
        const apiKey = document.getElementById('apiKey').value;
        
        if (!apiKey) {
            alert('Please enter your OpenAI API key.');
            return;
        }
        
        if (dialogData.length === 0) {
            alert('Please add at least one dialog entry.');
            return;
        }
        
        try {
            // Generate TTS for each dialog entry
            audioElements = [];
            
            for (let i = 0; i < dialogData.length; i++) {
                const entry = dialogData[i];
                const audioBlob = await generateSingleTTS(entry, apiKey);
                audioElements.push({
                    blob: audioBlob,
                    url: URL.createObjectURL(audioBlob)
                });
            }
            
            alert('TTS generation complete! Ready to play.');
            playAllBtn.disabled = false;
            
        } catch (error) {
            console.error('TTS Generation Error:', error);
            alert('Error generating TTS: ' + error.message);
        }
    }

    async function generateSingleTTS(entry, apiKey) {
        console.log(entry.dialog_prompt);
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: entry.voice_name,
                input: entry.input_text,
                instructions: entry.dialog_prompt
            })
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.blob();
    }
    
    async function playDialogItem(index) {
        stopPlayback();
        
        if (index >= audioElements.length) {
            stopPlayback();
            return;
        }
        
        // Highlight the playing item
        const items = dialogContainer.querySelectorAll('.dialog-bubble');
        items.forEach(item => item.classList.remove('highlight'));
        items[index].classList.add('highlight');
        items[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Create and play audio
        const audio = new Audio(audioElements[index].url);
        currentPlayingIndex = index;
        
        audio.onended = () => {
            if (currentPlayingIndex === index) {
                playDialogItem(index + 1);
            }
        };
        
        audio.playbackRate = parseFloat(playbackSpeed.value);
        await audio.play();
    }
    
    function playAllDialog() {
        if (audioElements.length === 0) {
            alert('Please generate TTS first.');
            return;
        }
        
        playDialogItem(0);
    }
    
    function pausePlayback() {
        // This would need additional audio control implementation
        alert('Pause functionality requires additional audio control implementation');
        currentPlayingIndex = -1;
        const items = dialogContainer.querySelectorAll('.dialog-bubble');
        items.forEach(item => item.classList.remove('highlight'));
    }

    function stopPlayback() {
        currentPlayingIndex = -1;
        const items = dialogContainer.querySelectorAll('.dialog-bubble');
        items.forEach(item => item.classList.remove('highlight'));
        // Additional audio stopping logic would be needed
    }
    
    function updatePlaybackSpeed() {
        const speed = playbackSpeed.value;
        // In a real implementation, this would update the playback rate of audio elements
        console.log(`Playback speed set to: ${speed}x`);
    }
});