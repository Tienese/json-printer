# J-Dialogue Builder (React to PPTX)

A specialized "low-code" presentation engine designed to rapidly create Japanese conversation scenarios. 

Unlike general-purpose tools (like PowerPoint), this application enforces strict constraints—fixed positions, specific templates, and pre-fabricated assets—to maximize speed and consistency. The final output is a native `.pptx` file generated entirely via JavaScript.

## 🚀 Key Features

* **Script-Based Slide Generation:** Write a dialogue flow (Speaker A -> Speaker B), and the app automatically generates a unique slide for every line of text.
* **Prefab System:** Drag-and-drop characters into fixed "slots" (Left, Center, Right). No pixel-pushing required.
* **Asset Constraints:** Supports "2-frame" loop assets (GIFs) to add life to characters without complex animation timelines.
* **Native PPTX Export:** Uses `PptxGenJS` to compile the React state into an editable PowerPoint file.

## 🛠 Tech Stack

* **Frontend:** React (Vite)
* **PPTX Engine:** `pptxgenjs` (The bridge between DOM and PowerPoint)
* **State Management:** React Context API (Manages the "Script" and "Scene" state)
* **Drag & Drop:** `@dnd-kit/core` (For placing prefabs into slots)
* **Styling:** Tailwind CSS

---

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/j-dialogue-builder.git](https://github.com/your-username/j-dialogue-builder.git)
    cd j-dialogue-builder
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

---

## 🧩 Architecture & Data Structure

This tool treats a presentation as a structured JSON object rather than a canvas. 

### The Scene State
The application state is divided into **Configuration** (Visuals) and **Script** (Content).

```json
{
  "meta": {
    "title": "Lesson 01: Introductions",
    "background": "classroom_day"
  },
  "slots": {
    "left": { "charId": "tanaka", "emotion": "neutral" },
    "right": { "charId": "smith", "emotion": "happy" }
  },
  "script": [
    { 
      "id": 1, 
      "speakerSlot": "left", 
      "japanese": "こんにちは、元気ですか？", 
      "english": "Hello, how are you?",
      "emotionOverride": "bowing" 
    },
    { 
      "id": 2, 
      "speakerSlot": "right", 
      "japanese": "はい、元気です！", 
      "english": "Yes, I am fine!",
      "emotionOverride": null 
    }
  ]
}