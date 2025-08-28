
AI Speech Builder – Dialog TTS (README)

Overview
- This web app converts multi-speaker dialog into Text-to-Speech (TTS) using OpenAI voices and plays back each line person-by-person. It accepts dialog in a simple JSON format with fields: voice_name, input_text, dialog_prompt [1]. Supported voices: alloy, coral, echo, fable, nova, onyx, sage, shimmer [1].
- Core features include adding dialog entries, selecting samples, generating TTS for each entry via the OpenAI API, sequential playback, speaker avatars with active-state highlights, hide/show UI mode, fullscreen toggles, and deletion of entries [4][5].

Requirements
- An OpenAI API key (pay-as-you-go usage applies).
- A web server with PHP enabled (needed for listSample.php which lists sample JSON files from the samples/ directory) [6].
- A modern browser with JavaScript enabled and internet access to load CDN assets and avatar images [4][5].

Project structure
- index.html: Main UI layout with controls, dialog preview, and modal to add dialog [5].
- app.js: App logic: loading samples, TTS generation, playback sequence, UI interactions, avatars [4].
- style.css: Styling for layout, dialog bubbles, avatars, animations, buttons [3].
- listSample.php: Returns a JSON list of .json files in the samples/ folder [6].
- samples/: Put your dialog JSON files here. The app auto-lists these files and loads one by default [4][6].

Setup steps
1) Get the source files into a PHP-capable web root, preserving the structure above [5][6].
2) Create a folder named samples at the same level as index.html and place one or more JSON files in it (see JSON format below) [6].
3) Fix the CDN links in index.html (they are currently written in a markdown-like format). Use these URLs:
   - Bootstrap CSS: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css
   - Font Awesome CSS: https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
   - Bootstrap JS: https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js
   The rest of the local file references (style.css and app.js) can remain as-is [5].
4) Start a local PHP server from the project root. Example:
   - php -S localhost:8000
5) Open http://localhost:8000/ in your browser [5].
6) Enter your OpenAI API key in the UI field at the top (it is used directly in the browser to call the OpenAI TTS API) [5][4].

How it works
- On load, the app calls listSample.php to discover JSON files in samples/, then loads the first one found [4][6].
- When you click “Generate TTS,” the app iterates over each dialog entry, calls OpenAI’s audio/speech API using model tts-1, and stores the returned audio blobs for playback [4].
- “Play All” plays each line sequentially, highlighting the active dialog bubble and the corresponding speaker avatar based on voice_name [4].

Usage guide
- Select Sample: Choose a sample dialog JSON file from the dropdown. It’s populated dynamically from the samples/ directory via listSample.php [4][6].
- Generate TTS: Click “Generate TTS” after entering your API key. The app fetches and stores audio for each line [4][5].
- Playback:
  - Play All: Plays the full dialog in order [4][5].
  - Speed: Use the Playback Speed slider (0.5x to 2x) before playback starts. Speed changes during playback only apply on the next item (current code doesn’t live-update the playing audio) [4][5].
  - Stop: Stops playback and clears highlights [4].
- Add Dialog Entry: Use the modal (“Add Dialog Entry”) to add new lines. Then re-run “Generate TTS” to produce audio for the new entries [5][4].
- Hide UIs: Collapses controls for a clean presentation while continuing playback [4].
- Fullscreen: Each of the Speakers and Dialog panels can toggle fullscreen (app adds a fullscreen-mode class; you can add CSS for this if desired) [4][3].

JSON dialog format
- Each entry is an object with:
  - voice_name: One of alloy, coral, echo, fable, nova, onyx, sage, shimmer [1].
  - input_text: The text to convert to speech.
  - dialog_prompt: A short description or instructions for the TTS generation (used as “instructions” in API calls) [1][4].
- Example (corrected voice names):
  [
    { "voice_name": "onyx", "input_text": "What does sustainability mean in society?", "dialog_prompt": "Question about sustainability definition." },
    { "voice_name": "nova", "input_text": "Sustainability means meeting today’s needs...", "dialog_prompt": "Answer explaining sustainability." }
  ]
- Note: The provided sample includes entries with voice_name "onxy" (typo). Replace with "onyx" or it won’t match a valid voice [2][1].

OpenAI API details used by the app
- Endpoint: https://api.openai.com/v1/audio/speech
- Method: POST with JSON body containing model: "tts-1", voice: voice_name, input: input_text, instructions: dialog_prompt [4].
- The app runs this in the browser using the API key you enter.

Avatars
- Speaker avatars are mapped per voice in app.js and shown above the dialog. The active speaker is highlighted during playback [4].
- You can replace avatar URLs in app.js (initializeSpeakerAvatars) with your own hosted images [4].

Troubleshooting and known issues
- CDN links not loading: Correct the malformed CDN URLs in index.html as shown above [5].
- Sample voice “onxy”: Change to “onyx” in your samples for TTS to work with the listed voices [2][1].
- No samples listed: Ensure a samples/ folder exists next to index.html and contains one or more .json files. listSample.php will return only files with .json extension [6].
- Playback speed: Changing the slider while audio is playing won’t affect the current item; it applies to the next item played. This is due to how the code sets playbackRate when starting each audio [4].
- Fullscreen styling: The app toggles a fullscreen-mode class, but no CSS for that class is provided in style.css. If you want true fullscreen visuals, add CSS rules for .fullscreen-mode (e.g., position: fixed; inset: 0; z-index; background) [3][4].
- CORS or broken avatars: External avatar URLs might fail to load due to network or CORS policies. Host your own copies and change the URLs in app.js if needed [4].
- API errors: If “API Error” shows in alerts, verify your API key, usage limits, and that voice_name matches a supported voice [4][1].

Security notes
- Your API key is entered in the browser and used client-side to call OpenAI. Treat this as sensitive and do not commit it to source control or expose it on public sites. Consider moving the TTS call to a simple server endpoint if you need to keep the key secret [5][4].

Extending
- Add more sample files: Place additional .json files in samples/; they will appear in the Select Sample dropdown automatically [4][6].
- Customize styling: Edit style.css to tweak dialog bubbles, avatars, and effects [3].
- Add features: You can implement live playback speed changes by keeping a reference to the current Audio instance and updating its playbackRate in updatePlaybackSpeed [4].

Attribution
- UI structure and controls are defined in index.html [5].
- App logic and OpenAI integration are in app.js [4].
- Visual styling is defined in style.css [3].
- Sample listing endpoint is listSample.php [6].
- Voices and dialog JSON format per the OpenAI voices and app’s data contract [1][2].