<img width="755" height="469" alt="image" src="https://github.com/user-attachments/assets/89ab5f05-f37f-400c-9d5d-988ea0d96047" />




# LTX2-Master-Loader
 multi-LoRa loader for ComfyUI, specifically designed for LTX-2. It provides a sleek, space-saving dashboard to manage up to 10 LoRAs with built-in audio-weight filtering.


 🚀 Key Features
10-Slot Dashboard: Manage a massive stack of LoRAs in a single, compact node.

Integrated Search: Click the LoRA name to open a searchable menu—no more scrolling through hundreds of files.

Audio Guard (Mute Logic):

🔇 (Muted): Automatically strips audio-related weights (speech, vocoder, etc.) from the LoRa to prevent visual artifacts and "crunchy" video.

🔊 (Unmuted): Allows all weights to pass through for full cross-modal generations.

Stealth UI: The complex JSON data is handled via "stealth widgets" and internal properties, keeping the node clean and preventing overlapping text boxes.

Precise Control: Individual toggle (ON/OFF) and granular strength sliders (increments of 0.05) for every slot.

🛠️ Technical Breakdown
1. The Frontend (JavaScript)
The node uses a custom LiteGraph implementation to override the standard widget drawing:

onDrawForeground: Manually renders the UI using HTML5 Canvas, creating the rows, buttons, and status icons you see.

onMouseDown: Calculates the exact coordinates of your clicks to toggle switches or adjust strength values without needing standard buttons.

DOM Injection Search: When you click a LoRA slot, the script injects a real HTML <input> element into the context menu. This allows for real-time filtering of the LoRA list as you type.

Property-to-Widget Bridge: To satisfy ComfyUI's backend requirements while keeping the UI pretty, the script "shadows" the data into a hidden widget that Python can read but the user never sees.

2. The Backend (Python)
The Python class LTX2MasterLoaderLD handles the heavy lifting:

JSON Parsing: It receives a single string of serialized data from the frontend and converts it back into a Python list.

Audio Keyword Filtering: It scans the LoRa state-dict for specific keywords (audio, vocoder, speech, etc.). If a slot is "Muted," it deletes those keys from the weights before applying them to the model.

Efficient Loading: It chains the LoRAs sequentially, applying the strengths to both the Model and CLIP in one pass.
