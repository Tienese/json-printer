/**
 * WYSIWYG Worksheet Editor Logic
 * Version: Section-Based Grid Layout
 */

let activeSelection = null; // { id: string, type: string }

function setSelection(element, event) {
    if (event) event.stopPropagation();

    // Clear previous selection
    if (activeSelection) {
        const oldEl = document.getElementById(activeSelection.id);
        if (oldEl) oldEl.classList.remove('selected-row', 'selected-section');
    }

    if (element) {
        const isSection = element.classList.contains('grid-section');
        activeSelection = {
            id: element.id,
            type: isSection ? 'GRID_SECTION' : element.dataset.type
        };
        const selectionClass = isSection ? 'selected-section' : 'selected-row';
        element.classList.add(selectionClass);
        console.log('Selected:', activeSelection);
    } else {
        activeSelection = null;
        console.log('Selection cleared');
    }
    renderLayersPanel(); // Re-render layers to show selection
    renderPropertiesPanel();
}

function renderPropertiesPanel() {
    const panel = document.getElementById('properties-panel');
    panel.innerHTML = ''; // Clear previous properties

    if (!activeSelection) {
        panel.innerHTML = '<p>Select an item to edit its properties.</p>';
        return;
    }

    const element = document.getElementById(activeSelection.id);
    if (!element) return;

    let propertiesHtml = '';

    switch (activeSelection.type) {
        case 'GRID':
            propertiesHtml = `
                <div class="prop-group">
                    <h4>Grid Line Properties</h4>
                    <button onclick="addSectionToGridLine(document.getElementById('${activeSelection.id}'))">+ Add Section</button>
                </div>
            `;
            break;
        case 'GRID_SECTION':
            const gridSectionElement = document.getElementById(activeSelection.id);
            propertiesHtml = renderGridProperties(gridSectionElement);
            break;
        case 'VOCABULARY':
            propertiesHtml = renderVocabProperties(element);
            break;
        // Add cases for other types like TEXT, HEADER etc.
        default:
            propertiesHtml = '<p>No properties to edit for this item.</p>';
            break;
    }

    panel.innerHTML = propertiesHtml + `
        <div class="prop-group" style="margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px;">
            <button class="prop-button-danger" onclick="deleteRow(document.getElementById('${activeSelection.id}'))">Delete Row</button>
        </div>
    `;
}


function renderLayersPanel() {
    const panel = document.getElementById('layers-panel');
    panel.innerHTML = '<h3>Layers</h3>';
    const list = document.createElement('ul');
    list.className = 'layer-list';

    const rows = document.querySelectorAll('#editorCanvas .row-wrapper');
    rows.forEach((row, index) => {
        const item = document.createElement('li');
        item.className = 'layer-item';
        item.innerText = `${index + 1}. ${row.dataset.type || 'Untitled'}`;
        item.dataset.id = row.id;        if (activeSelection && activeSelection.id === row.id) {
            item.classList.add('selected-layer');
        }
        item.onclick = (e) => setSelection(document.getElementById(row.id), e);
        list.appendChild(item);
    });
    panel.appendChild(list);

    new Sortable(list, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function (evt) {
            const canvas = document.getElementById('editorCanvas');
            const layers = Array.from(evt.target.children);
            layers.forEach(layer => {
                const canvasElement = document.getElementById(layer.dataset.id);
                if(canvasElement) canvas.appendChild(canvasElement);
            });
            renderLayersPanel(); // Re-render to fix numbering
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // Assign IDs to any initial rows that don't have one
    document.querySelectorAll('.row-wrapper').forEach(row => {
        if (!row.id) {
            row.id = `row-${Date.now()}-${Math.random()}`;
            row.onclick = (e) => setSelection(row, e);
        }
    });

    // Initialize Drag & Drop for Rows
    const canvas = document.getElementById('editorCanvas');
    if (typeof Sortable !== 'undefined' && canvas) {
        new Sortable(canvas, {
            animation: 150,
            handle: '.handle',
            ghostClass: 'sortable-ghost',
            draggable: '.row-wrapper'
        });
    }

    // Global Click Listener for Deselecting
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.grid-section') && !e.target.closest('.section-toolbar')) {
            deselectAllSections();
        }
    });
    renderLayersPanel(); // Initial render
});

/**
 * Add a new block (Header, Text, or Grid Line)
 */
function addBlock(type) {
    const tplId = 'tpl-' + type.toLowerCase();
    const template = document.getElementById(tplId);
    if (!template) return;

    const clone = template.content.cloneNode(true);
    const rowWrapper = clone.querySelector('.row-wrapper');
    rowWrapper.id = `row-${Date.now()}`;
    rowWrapper.onclick = (e) => setSelection(rowWrapper, e);

    const canvas = document.getElementById('editorCanvas');

    if (type === 'GRID') {
        // Initialize with one default section (10mm, 5 boxes)
        const gridLine = rowWrapper.querySelector('.grid-line');
        const section = addSectionToLine(gridLine, 5, 'box-10mm');
        section.id = `section-${Date.now()}`;
    }

    canvas.appendChild(rowWrapper);
    
    // Focus editable content if Text
    const editable = rowWrapper.querySelector('.text-row');
    if(editable) editable.focus();
    renderLayersPanel();
}

/**
 * Delete a whole row/line
 */
function deleteRow(element) {
    if (confirm('Delete this entire line?')) {
        element.remove();
        renderLayersPanel();
        setSelection(null); // Deselect after deleting
    }
}

/**
 * Add a new Section to a Grid Line
 */
function addSection(btn) {
    const gridLine = btn.previousElementSibling; // The .grid-line container
    // Add default section (5 boxes, 10mm)
    addSectionToLine(gridLine, 5, 'box-10mm');
}

/**
 * Helper: Create and append a grid section DOM element
 */
function addSectionToLine(lineContainer, boxCount, sizeClass) {
    const section = document.createElement('div');
    section.className = 'grid-section show-guides'; // Default to showing guides
    section.setAttribute('onclick', 'setSelection(this, event)');
    
    // Store state in data attributes
    section.dataset.size = sizeClass;
    const initialBoxes = Array.from({ length: boxCount }, () => ({ furigana: '', text: '' }));
    section.dataset.boxes = JSON.stringify(initialBoxes);

    // Create a container for the grid part (boxes) separate from the furigana input
    // This allows the input to span the full width easily
    // We will use absolute positioning or a flex column layout for the section itself
    section.style.display = 'flex';
    section.style.flexDirection = 'column';
    section.style.position = 'relative';

    // Render Boxes and Input
    renderBoxes(section);

    lineContainer.appendChild(section);
    return section;
}

/**
 * Render the grid boxes based on dataset state
 */
function renderBoxes(section) {
    const boxes = JSON.parse(section.dataset.boxes);
    const count = boxes.length;
    const sizeClass = section.dataset.size;
    let sizeMm = '10mm';
    if(sizeClass === 'box-12mm') sizeMm = '12mm';
    if(sizeClass === 'box-8mm') sizeMm = '8mm';

    // Clear section content (except toolbar which we will re-append)
    const toolbar = section.querySelector('.section-toolbar');
    section.innerHTML = '';

    // Create the Main Grid Container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${count}, ${sizeMm})`;
    
    boxes.forEach((boxData, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'grid-box-wrapper';

        
        const furigana = document.createElement('div');
        furigana.className = 'grid-furigana';
        furigana.contentEditable = true;
        furigana.onkeydown = function(e) { handleGridNavKeydown(e, this); };
        furigana.onblur = function(e) { handleInputBlur(e, this, i, 'furigana'); };
        furigana.innerText = boxData.furigana;
        
        const box = document.createElement('div');
        box.className = `grid-box ${sizeClass}`;
        if (i === 0) { box.classList.add('gb-left-border'); }
        box.contentEditable = true;
        box.dataset.fullText = boxData.text;
        box.innerText = boxData.text ? String(boxData.text).charAt(0) : '';

        box.onkeydown = function(e) { handleGridNavKeydown(e, this); };
        box.onfocus = handleBoxFocus;
        box.onblur = function(e) { handleInputBlur(e, this, i, 'text'); };
        
        wrapper.appendChild(furigana);
        wrapper.appendChild(box);
        gridContainer.appendChild(wrapper);
    });
    
    section.appendChild(gridContainer);

    // Re-append toolbar
    if(toolbar) {
    
    }
}

/**
 * Adjust margin based on furigana content
 * (Deprecated in new single-input model, but kept if needed for other logic)
 */
function adjustFuriganaMargin(el) {
    // No-op for new design
}

/**
 * Interaction: Select a Section
 */
function selectSection(event, section) {
    event.stopPropagation(); // Stop bubbling so document click doesn't deselect immediately
    deselectAllSections();
    section.classList.add('selected');
}

function deselectAllSections() {
    document.querySelectorAll('.grid-section.selected').forEach(el => el.classList.remove('selected'));
}

function addSectionToGridLine(currentSection, position) {
    const gridLine = currentSection.closest('.grid-line');
    const newSection = addSectionToLine(gridLine, 5, 'box-10mm'); // Default to 5 boxes, 10mm
    newSection.id = `section-${Date.now()}`;

    if (position === 'before') {
        gridLine.insertBefore(newSection, currentSection);
    } else if (position === 'after') {
        currentSection.after(newSection);
    } else { // This case handles adding to a GRID row, not a section
        const gridRowElement = currentSection;
        const gridLineContainer = gridRowElement.querySelector('.grid-line');
        gridLineContainer.appendChild(newSection);
    }

    setSelection(newSection, null);
}

/**
 * Interaction: Modify Box Count (+/-)
 */
function changeSectionSize(section, size) {
    if(!section) return;
    section.dataset.size = size;
    const gridLine = section.closest('.grid-line');
    renderBoxes(section);
}

function modifyBoxCount(section, change) {
    if(!section) return;
    let boxes = JSON.parse(section.dataset.boxes);

    if (change > 0) {
        for(let i = 0; i < change; i++) {
            boxes.push({ furigana: '', text: '' });
        }
    } else if (change < 0) {
        boxes.splice(boxes.length + change, -change);
    }

    if (boxes.length < 1) boxes = [{ furigana: '', text: '' }]; // Ensure at least one box
    if (boxes.length > 50) boxes.length = 50; // Max limit

    section.dataset.boxes = JSON.stringify(boxes);
    renderBoxes(section);
}

/**
 * Interaction: Delete Section
 */
function deleteSection(btn) {
    event.stopPropagation();
    if (confirm('Remove this section?')) {
        btn.closest('.grid-section').remove();
    }
}

/**
 * Insert or delete a box at a specific index
 */
function insertBox(section, index) {
    let boxes = JSON.parse(section.dataset.boxes);
    boxes.splice(index, 0, { furigana: '', text: '' });
    section.dataset.boxes = JSON.stringify(boxes);
    renderBoxes(section);
}

function deleteBox(section, index) {
    let boxes = JSON.parse(section.dataset.boxes);
    if (boxes.length > 1) {
        boxes.splice(index, 1);
        section.dataset.boxes = JSON.stringify(boxes);
        renderBoxes(section);
    }
}

/**
 * Toggle Guidelines Globally
 */
function toggleGuideLines() {
    const sections = document.querySelectorAll('.grid-section');
    sections.forEach(s => {
        s.classList.toggle('show-guides');
    });
}

/**
 * Grid Box Input Handling (Stateful)
 */
function handleInputBlur(e, el, index, field) {
    const section = el.closest('.grid-section');
    if (!section) return;

    let boxes = JSON.parse(section.dataset.boxes);
    const text = el.innerText.trim();

    if (field === 'text') {
        boxes[index].text = text;
        el.dataset.fullText = text;
        el.innerText = text.length > 0 ? text.charAt(0) : '';
    } else if (field === 'furigana') {
        boxes[index].furigana = text;
    }

    section.dataset.boxes = JSON.stringify(boxes);
}

function handleBoxFocus(e) {
    const el = e.target;
    if (el.dataset.fullText) {
        el.innerText = el.dataset.fullText;
        setCaretToEnd(el); // Move cursor to end for better UX
    }
}

/**
 * Grid Box Keydown Handling (Nav & Enter)
 */
function handleGridNavKeydown(e, el) {
    const isBox = el.classList.contains('grid-box');
    const isFurigana = el.classList.contains('grid-furigana');

    if (!isBox && !isFurigana) return; // Should not happen

    const wrapper = el.closest('.grid-box-wrapper');

    if (e.key === 'Backspace' && el.innerText.length === 0) {
        e.preventDefault();
        const prevWrapper = wrapper.previousElementSibling;
        if (prevWrapper) {
            const targetClass = isBox ? '.grid-box' : '.grid-furigana';
            const prevEl = prevWrapper.querySelector(targetClass);
            if (prevEl) prevEl.focus();
        }
    } else if (e.key === 'Enter') {
        e.preventDefault(); // Prevent new lines
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevWrapper = wrapper.previousElementSibling;
        if (prevWrapper) {
            const targetClass = isBox ? '.grid-box' : '.grid-furigana';
            const prevEl = prevWrapper.querySelector(targetClass);
            if (prevEl) prevEl.focus();
        }
    } else if (e.key === 'ArrowRight') {
        const nextWrapper = wrapper.nextElementSibling;
        if (nextWrapper) {
            const targetClass = isBox ? '.grid-box' : '.grid-furigana';
            const nextEl = nextWrapper.querySelector(targetClass);
            if (nextEl) nextEl.focus();
        }
    } else if (e.key === 'ArrowDown' && isFurigana) {
        e.preventDefault();
        const box = wrapper.querySelector('.grid-box');
        if(box) box.focus();
    } else if (e.key === 'ArrowUp' && isBox) {
        const furigana = wrapper.querySelector('.grid-furigana');
        if(furigana) furigana.focus();
    }
}

function setCaretToEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function addVocabTerm(vocabularyElement) {
    const vocabularyContainer = vocabularyElement.querySelector('.vocabulary-container');
    const newVocabRow = document.createElement('div');
    newVocabRow.className = 'vocabulary-row';
    newVocabRow.innerHTML = `
        <span class="vocab-term" contenteditable="true">Term</span>
        <span class="vocab-line"></span>
    `;
    vocabularyContainer.appendChild(newVocabRow);
}

function removeLastVocabTerm(vocabularyElement) {
    const vocabularyContainer = vocabularyElement.querySelector('.vocabulary-container');
    if (vocabularyContainer.children.length > 1) { // Keep at least one term
        vocabularyContainer.lastElementChild.remove();
    }
}

function changeVocabColumns(element, columns) {
    const container = element.querySelector('.vocabulary-container');
    if(container) container.style.setProperty('--vocab-columns', columns);
}

function changeVocabLine(element, style) {
    const container = element.querySelector('.vocabulary-container');
    if (!container) return;
    if (style === 'solid') {
        container.classList.add('solid-lines');
    } else {
        container.classList.remove('solid-lines');
    }
}

// --- SIDEBAR PROPERTIES RENDERERS ---

function renderGridProperties(section) {
    const sizeClass = section.dataset.size;
    return `
        <div class="prop-group">
            <h4>Grid Section Properties</h4>
            <label class="prop-label">Box Size</label>
            <select class="prop-select" onchange="changeSectionSize(document.getElementById('${section.id}'), this.value)">
                <option value="box-8mm" ${sizeClass === 'box-8mm' ? 'selected' : ''}>Small (8mm)</option>
                <option value="box-10mm" ${sizeClass === 'box-10mm' ? 'selected' : ''}>Med (10mm)</option>
                <option value="box-12mm" ${sizeClass === 'box-12mm' ? 'selected' : ''}>Large (12mm)</option>
            </select>
             <label class="prop-label">Box Count</label>
            <button onclick="modifyBoxCount(document.getElementById('${section.id}'), -1)">-</button>
            <span>${JSON.parse(section.dataset.boxes).length}</span>
            <button onclick="modifyBoxCount(document.getElementById('${section.id}'), 1)">+</button>

            <label class="prop-label" style="margin-top: 10px;">Add New Section</label>
            <button onclick="addSectionToGridLine(document.getElementById('${section.id}'), 'before')">+ Left</button>
            <button onclick="addSectionToGridLine(document.getElementById('${section.id}'), 'after')">+ Right</button>
        </div>
    `;
}

function renderVocabProperties(element) {
    return `
        <div class="prop-group">
            <h4>Vocabulary Properties</h4>
            <label class="prop-label">Columns</label>
            <button onclick="changeVocabColumns(document.getElementById('${element.id}'), 1)">1</button>
            <button onclick="changeVocabColumns(document.getElementById('${element.id}'), 2)">2</button>
            <button onclick="changeVocabColumns(document.getElementById('${element.id}'), 3)">3</button>
            <br>
            <label class="prop-label">Line Style</label>
            <button onclick="changeVocabLine(document.getElementById('${element.id}'), 'dashed')">Dashed</button>
            <button onclick="changeVocabLine(document.getElementById('${element.id}'), 'solid')">Solid</button>
            <br>
            <label class="prop-label" style="margin-top: 10px;">Term Count</label>
            <button class="prop-button" onclick="addVocabTerm(document.getElementById('${element.id}'))">+ Add Term</button>
            <button class="prop-button" onclick="removeLastVocabTerm(document.getElementById('${element.id}'))">- Remove Last</button>
        </div>
    `;
}
