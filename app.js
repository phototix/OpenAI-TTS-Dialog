
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
    const hideBtn = document.getElementById('hideBtn');
    const showBtn = document.getElementById('showBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playbackSpeed = document.getElementById('playbackSpeed');
    const addDialogModalBtn = document.getElementById('addDialogModalBtn');

    const leftColumn = document.getElementById('leftColumn');
    const rightColumn = document.getElementById('rightColumn');

    const openaiTTSHeader = document.getElementById('openaiTTSHeader');
    const openaiAPIConfig = document.getElementById('openaiAPIConfig');

    const fullscreenSpeakersBtn = document.getElementById('fullscreenSpeakersBtn');
    const fullscreenDialogBtn = document.getElementById('fullscreenDialogBtn');
    const speakersCard = document.querySelector('.card:has(#speakersRow)');
    const dialogCard = document.querySelector('.card:has(#dialogContainer)');
    
    // Dialog data storage
    let dialogData = [];
    let currentPlayingIndex = -1;
    let audioElements = [];
    
    // Load sample dialog
    loadSampleDialog();
    initializeSpeakerAvatars();
    
    // Event Listeners
    clearDialogBtn.addEventListener('click', clearDialog);
    generateBtn.addEventListener('click', generateTTS);
    playAllBtn.addEventListener('click', playAllDialog);
    hideBtn.addEventListener('click', hideWebUI);
    showBtn.addEventListener('click', showWebUI);
    stopBtn.addEventListener('click', stopPlayback);
    playbackSpeed.addEventListener('input', updatePlaybackSpeed);

    // Add event listeners
    fullscreenSpeakersBtn.addEventListener('click', () => toggleFullscreen(speakersCard, 'speakers'));
    fullscreenDialogBtn.addEventListener('click', () => toggleFullscreen(dialogCard, 'dialog'));
    
    // Functions
    async function loadSampleDialog() {
        try {
            const response = await fetch('listSample.php');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const sampleFiles = await response.json();
            
            if (sampleFiles.length === 0) {
                dialogContainer.innerHTML = '<p class="text-center text-muted">No sample files found in /samples/ directory</p>';
                return;
            }
            
            // Load the first sample file by default
            await loadSpecificSample(sampleFiles[0]);
            
        } catch (error) {
            console.error('Error loading sample list:', error);
            dialogContainer.innerHTML = '<p class="text-center text-danger">Error loading sample files</p>';
        }
    }

    async function loadSpecificSample(filename) {
        try {
            const response = await fetch(`samples/${filename}`);
            
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
            dialogContainer.innerHTML = '<p class="text-center text-danger">Error loading sample file</p>';
        }
    }

    // Add these functions to handle local storage
    function saveApiKeyToLocalStorage(apiKey) {
        localStorage.setItem('openai_api_key', apiKey);
    }

    function loadApiKeyFromLocalStorage() {
        return localStorage.getItem('openai_api_key');
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
    
    // Modify the addDialogToContainer function to include delete button event listener
    function addDialogToContainer(entry, index) {
        const dialogElement = document.createElement('div');
        dialogElement.className = `dialog-bubble ${index % 2 === 0 ? 'user' : 'ai'}`;
        dialogElement.dataset.index = index;
        
        dialogElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong class="dialog_prompt">${entry.dialog_prompt}</strong>
                    <p class="mb-1">${entry.input_text}</p>
                    <small class="text-muted">${entry.voice_name}</small>
                </div>
                <div class="d-flex align-items-center gap-2 btnWebUIItems">
                    <i class="fas fa-play-circle fa-lg play-btn" data-index="${index}"></i>
                    <i class="fas fa-trash-alt fa-lg delete-btn text-danger" data-index="${index}"></i>
                </div>
            </div>
        `;
        
        if (dialogContainer.querySelector('.text-center')) {
            dialogContainer.innerHTML = '';
        }
        
        dialogContainer.appendChild(dialogElement);
        
        // Add event listeners
        dialogElement.querySelector('.play-btn').addEventListener('click', function() {
            playDialogItem(index);
        });
        
        // Add delete button event listener
        dialogElement.querySelector('.delete-btn').addEventListener('click', function() {
            deleteDialogItem(index);
        });
    }

    // Add this function to initialize speaker avatars
    function initializeSpeakerAvatars() {
        // Map voice names to avatar images (you can replace with actual images)
        speakerAvatars = {
            'alloy': 'https://cloud.webbypage.com/index.php/s/X2xjA3LT3sL4iHr/download',
            'coral': 'https://cloud.webbypage.com/index.php/s/yJ39RYEB7F6qRd7/download',
            'echo': 'https://cloud.webbypage.com/index.php/s/cjJXnWLPWeGPHRG/download',
            'fable': 'https://cloud.webbypage.com/index.php/s/MWQN2y77jKznAiD/download',
            'nova': 'https://cloud.webbypage.com/index.php/s/bJrD6MCfzjLEaBN/download',
            'onyx': 'https://cloud.i-dc.institute/index.php/avatar/Brandon%20Chong/512/dark?v=3',
            'sage': 'https://cloud.webbypage.com/index.php/s/yr9aAJSmgEmDNnB/download',
            'shimmer': 'https://cloud.webbypage.com/index.php/s/4e6B9EKjrfT94cK/download'
        };
        
        renderSpeakerAvatars();
    }

    // Function to render all speaker avatars
    function renderSpeakerAvatars() {
        const speakersRow = document.getElementById('speakersRow');
        speakersRow.innerHTML = '';
        
        Object.entries(speakerAvatars).forEach(([voiceName, avatarUrl]) => {
            const speakerItem = document.createElement('div');
            speakerItem.className = 'speaker-item';
            speakerItem.innerHTML = `
                <img src="${avatarUrl}" 
                    alt="${voiceName}" 
                    class="speaker-avatar"
                    data-voice="${voiceName}"
                    title="${voiceName}">
                <div class="speaker-name">${voiceName}</div>
            `;
            speakersRow.appendChild(speakerItem);
        });
    }

    // Function to update active speaker during playback
    function updateActiveSpeaker(voiceName) {
        // Remove active class from all avatars
        document.querySelectorAll('.speaker-avatar').forEach(avatar => {
            avatar.classList.remove('active', 'playing', 'wave-animation');
        });
        
        // Add active class to current speaker
        const currentAvatar = document.querySelector(`.speaker-avatar[data-voice="${voiceName}"]`);
        if (currentAvatar) {
            currentAvatar.classList.add('active', 'playing', 'wave-animation');
        }
    }

    function clearDialog() {
        if (confirm('Are you sure you want to clear all dialog entries?')) {
            dialogData = [];
            dialogContainer.innerHTML = '<p class="text-center text-muted mt-4">Your dialog will appear here</p>';
            stopPlayback();
            audioElements = [];
            playAllBtn.disabled = true;
        }
    }

    // Fullscreen toggle function
    function toggleFullscreen(element, type) {
        if (element.classList.contains('fullscreen-mode')) {
            // Exit fullscreen
            element.classList.remove('fullscreen-mode');
            document.querySelector(`.exit-fullscreen-${type}`)?.remove();
            
            // Update button icon
            const btn = type === 'speakers' ? fullscreenSpeakersBtn : fullscreenDialogBtn;
            btn.innerHTML = '<i class="fas fa-expand"></i>';
            
        } else {
            // Enter fullscreen
            element.classList.add('fullscreen-mode');
            
            // Create exit button
            const exitBtn = document.createElement('button');
            exitBtn.className = `btn btn-danger exit-fullscreen-btn exit-fullscreen-${type}`;
            exitBtn.innerHTML = '<i class="fas fa-compress"></i>';
            exitBtn.onclick = () => toggleFullscreen(element, type);
            
            element.appendChild(exitBtn);
            
            // Update button icon
            const btn = type === 'speakers' ? fullscreenSpeakersBtn : fullscreenDialogBtn;
            btn.innerHTML = '<i class="fas fa-compress"></i>';
        }
    }

    // Handle ESC key to exit fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (speakersCard.classList.contains('fullscreen-mode')) {
                toggleFullscreen(speakersCard, 'speakers');
            }
            if (dialogCard.classList.contains('fullscreen-mode')) {
                toggleFullscreen(dialogCard, 'dialog');
            }
        }
    });

    // Load API key from local storage on page load
    const savedApiKey = loadApiKeyFromLocalStorage();
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }
    
    // Add event listener to save API key when changed
    document.getElementById('apiKey').addEventListener('input', function() {
        saveApiKeyToLocalStorage(this.value);
    });

    // Add this to your JavaScript
    async function populateSampleDropdown() {
        try {
            const response = await fetch('listSample.php');
            const sampleFiles = await response.json();
            
            const select = document.getElementById('sampleSelect');
            select.innerHTML = '';
            
            sampleFiles.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file.replace('.json', '');
                select.appendChild(option);
            });
            
            select.addEventListener('change', function() {
                if (this.value) {
                    loadSpecificSample(this.value);
                }
            });
            
        } catch (error) {
            console.error('Error loading sample list:', error);
        }
    }
    populateSampleDropdown();
    
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
    
        const currentEntry = dialogData[index];
        
        // Update active speaker avatar
        updateActiveSpeaker(currentEntry.voice_name);
        
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
    
    function hideWebUI() {
        leftColumn.style.display = 'none';
        rightColumn.style.width = '100%';
        clearDialogBtn.style.display = 'none';
        openaiAPIConfig.style.display = 'none';
        openaiTTSHeader.style.display = 'none';
        showBtn.style.display = '';
        playAllDialog();
        document.querySelectorAll('.btnWebUIItems').forEach(el => {
            el.style.setProperty('display', 'none', 'important');
        });
        document.querySelectorAll('.dialog_prompt').forEach(el => {
            el.style.setProperty('display', 'none', 'important');
        });
    }
    
    function showWebUI() {
        leftColumn.style.display = '';
        rightColumn.style.width = '50%';
        clearDialogBtn.style.display = '';
        openaiAPIConfig.style.display = '';
        openaiTTSHeader.style.display = '';
        showBtn.style.display = 'none';
        document.querySelectorAll('.btnWebUIItems').forEach(el => {
            el.style.setProperty('display', '', '');
        });
        document.querySelectorAll('.dialog_prompt').forEach(el => {
            el.style.setProperty('display', '', '');
        });
    }

    function stopPlayback() {
        currentPlayingIndex = -1;
        const items = dialogContainer.querySelectorAll('.dialog-bubble');
        items.forEach(item => item.classList.remove('highlight'));
        // Additional audio stopping logic would be needed
    
        // Remove active classes from avatars
        document.querySelectorAll('.speaker-avatar').forEach(avatar => {
            avatar.classList.remove('active', 'playing', 'wave-animation');
        });
    }
    
    function updatePlaybackSpeed() {
        const speed = playbackSpeed.value;
        // In a real implementation, this would update the playback rate of audio elements
        console.log(`Playback speed set to: ${speed}x`);
    }

    // Add this function to handle dialog deletion
    function deleteDialogItem(index) {
        if (confirm('Are you sure you want to delete this dialog entry?')) {
            // Remove from dialogData array
            dialogData.splice(index, 1);
            
            // Rebuild the dialog container
            rebuildDialogContainer();
            
            // Reset audio elements if they exist
            if (audioElements.length > 0) {
                audioElements = [];
                playAllBtn.disabled = true;
            }
        }
    }

    // Add this function to rebuild the dialog container
    function rebuildDialogContainer() {
        dialogContainer.innerHTML = '';
        if (dialogData.length === 0) {
            dialogContainer.innerHTML = '<p class="text-center text-muted mt-4">Your dialog will appear here</p>';
            return;
        }
        
        dialogData.forEach((entry, index) => {
            addDialogToContainer(entry, index);
        });
    }

    addDialogModalBtn.addEventListener('click', function() {
        const voice = document.getElementById('voiceSelectModal').value;
        const prompt = document.getElementById('dialogPromptModal').value;
        const text = document.getElementById('inputTextModal').value;
        
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
        
        // Clear modal fields and close
        document.getElementById('dialogPromptModal').value = '';
        document.getElementById('inputTextModal').value = '';
        var modal = bootstrap.Modal.getInstance(document.getElementById('addDialogModal'));
        modal.hide();
    });
});
