/**
 * WYSIWYG Worksheet Editor Logic
 * Version: Section-Based Grid Layout
 */

let currentZoom = 1.0;
let activeSelection = null; // { id: string, type: string }

function formatDoc(command, value = null) {
    document.execCommand(command, false, value);
}

function setSelection(element, event) {
    if (event) event.stopPropagation();

    // Clear previous selection
    if (activeSelection) {
        const oldEl = document.getElementById(activeSelection.id);
        if (oldEl) oldEl.classList.remove('selected-section');
    }

    if (element) {
        const isSection = element.classList.contains('grid-section');
        activeSelection = {
            id: element.id,
            type: isSection ? 'GRID_SECTION' : element.dataset.type
        };
        
        if (isSection) {
            element.classList.add('selected-section');
        }
        console.log('Selected:', activeSelection);

        // Context-aware tab switching
        const toolsTab = document.querySelector('[data-tab="tools"]');
        if (toolsTab && !toolsTab.classList.contains('active')) {
            toolsTab.click();
        }

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
        case 'TEXT_FIELD':
            const textFieldElement = document.getElementById(activeSelection.id);
            const contentContainer = textFieldElement.querySelector('.text-field-content');
            const isTwoCol = contentContainer && contentContainer.children.length === 2;

            propertiesHtml = `
                <div class="prop-group">
                    <h4>Text Properties</h4>
                    <label class="prop-label">Layout</label>
                    <button onclick="setTextFieldColumns(document.getElementById('${activeSelection.id}'), 1)">1 Col</button>
                    <button onclick="setTextFieldColumns(document.getElementById('${activeSelection.id}'), 2)">2 Cols</button>
                </div>
                <div class="prop-group">
                    <h4>Formatting</h4>
                    <label class="prop-label">Style</label>
                    <button onclick="formatDoc('formatBlock', 'h1')">H1</button>
                    <button onclick="formatDoc('formatBlock', 'h2')">H2</button>
                    <button onclick="formatDoc('formatBlock', 'h3')">H3</button>
                    <button onclick="formatDoc('formatBlock', 'p')">Body</button>
                    <br>
                    <label class="prop-label">Emphasis</label>
                    <button onclick="formatDoc('bold')"><b>B</b></button>
                    <button onclick="formatDoc('italic')"><i>I</i></button>
                    <button onclick="formatDoc('underline')"><u>U</u></button>
                    <button onclick="formatDoc('strikeThrough')"><s>S</s></button>
                    <br>
                    <label class="prop-label">Lists</label>
                    <button onclick="formatDoc('insertOrderedList')">1. List</button>
                    <button onclick="formatDoc('insertUnorderedList')">&#8226; List</button>
                    <br>
                    <label class="prop-label">Alignment</label>
                    <button onclick="formatDoc('justifyLeft')">Left</button>
                    <button onclick="formatDoc('justifyCenter')">Center</button>
                    <button onclick="formatDoc('justifyRight')">Right</button>
                    <button onclick="formatDoc('justifyFull')">Justify</button>
                     <br>
                    <label class="prop-label">Indent</label>
                    <button onclick="formatDoc('indent')">Indent</button>
                    <button onclick="formatDoc('outdent')">Outdent</button>
                </div>
            `;
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
            paginate(); // Re-paginate the content after reordering
            renderLayersPanel(); // Re-render to fix numbering
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // Client-side migration of old block types
    document.querySelectorAll('[data-type="HEADER"], [data-type="TEXT"]').forEach(oldBlock => {
        const newTextField = document.createElement('div');
        newTextField.className = 'text-field-content';
        newTextField.contentEditable = true;

        if (oldBlock.dataset.type === 'HEADER') {
            const headerRow = oldBlock.querySelector('.header-row');
            if(headerRow) newTextField.innerHTML = `<h1>${headerRow.innerText.replace(/\n/g, ' ')}</h1>`;
        } else { // TEXT
            const textRow = oldBlock.querySelector('.text-row');
            if(textRow) newTextField.innerHTML = `<p>${textRow.innerText}</p>`;
        }

        oldBlock.dataset.type = 'TEXT_FIELD';
        const oldContent = oldBlock.querySelector('.header-row, .text-row');
        if(oldContent) oldContent.replaceWith(newTextField);
    });

    // Sidebar Toggle
    const sidebar = document.querySelector('.editor-sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        document.querySelector('.editor-container').style.gridTemplateColumns = sidebar.classList.contains('collapsed') ? '1fr 40px' : '1fr 300px';
    });

    // Tab Switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const sidebarPanels = document.querySelectorAll('.sidebar-panel');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            sidebarPanels.forEach(p => p.classList.remove('active'));
            document.getElementById(`${tab}-panel`).classList.add('active');
        });
    });

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
            draggable: '.row-wrapper',
            onEnd: paginate
        });
    }

    // Global Click Listener for Deselecting
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.grid-section') && !e.target.closest('.section-toolbar')) {
            setSelection(null, e); // Centralize deselection logic
        }
    });

    // Debounced pagination for text input
    const debouncedPaginate = debounce(paginate, 500);
    canvas.addEventListener('input', (e) => {
        if (e.target.closest('.text-col')) {
            debouncedPaginate();
        }
    });

    // Hotkeys for Box Count
    document.addEventListener('keydown', (e) => {
        if (!activeSelection || activeSelection.type !== 'GRID_SECTION') return;

        const section = document.getElementById(activeSelection.id);
        if (!section) return;

        if (e.ctrlKey && e.key === '[') {
            e.preventDefault();
            const boxes = JSON.parse(section.dataset.boxes);
            if (boxes.length > 1) {
                modifyBoxCount(section, -1);
            }
        } else if (e.ctrlKey && e.key === ']') {
            e.preventDefault();
            modifyBoxCount(section, 1);
        } else if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            addSectionToGridLine(section, 'after');
        } else if (e.ctrlKey && (e.key === ',' || e.key === '.')) {
            e.preventDefault();
            const sizes = ['box-8mm', 'box-10mm', 'box-12mm'];
            const currentSize = section.dataset.size;
            const currentIndex = sizes.indexOf(currentSize);
            let newIndex;
            if (e.key === ',') { // Cycle down
                newIndex = (currentIndex - 1 + sizes.length) % sizes.length;
            } else { // Cycle up
                newIndex = (currentIndex + 1) % sizes.length;
            }
            changeSectionSize(section, sizes[newIndex]);
        }
    });

    renderLayersPanel(); // Initial render
    paginate();
});

/**
 * Add a new block
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
    const editable = rowWrapper.querySelector('[contenteditable="true"]');
    if (editable) editable.focus({ preventScroll: true });
    renderLayersPanel();
    paginate();
}

/**
 * Delete a whole row/line
 */
function deleteRow(element) {
    if (confirm('Delete this entire line?')) {
        element.remove();
        renderLayersPanel();
        setSelection(null); // Deselect after deleting
        paginate();
    }
}

/**
 * Delete a grid section
 */
function deleteSection(section) {
    if (confirm('Delete this grid section?')) {
        section.remove();
        setSelection(null); // Deselect after deleting
        paginate();
    }
}

/**
 * Add a new Section to a Grid Line
 */
function addSection(btn) {
    const gridLine = btn.previousElementSibling; // The .grid-line container
    // Add default section (5 boxes, 10mm)
    const newSection = addSectionToLine(gridLine, 5, 'box-10mm');
    newSection.id = `section-${Date.now()}`;
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

    section.style.display = 'flex';
    section.style.flexDirection = 'column';
    section.style.position = 'relative';

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

    const toolbar = section.querySelector('.section-toolbar');
    section.innerHTML = '';

    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${count}, ${sizeMm})`;
    
    gridContainer.addEventListener('keydown', handleGridNavKeydown);

    boxes.forEach((boxData, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'grid-box-wrapper';

        
        const furigana = document.createElement('div');
        furigana.className = 'grid-furigana';
        furigana.contentEditable = true;
        furigana.onblur = function(e) { handleInputBlur(e, this, i, 'furigana'); };
        furigana.innerText = boxData.furigana;
        
        const box = document.createElement('div');
        box.className = `grid-box ${sizeClass}`;
        if (i === 0) { box.classList.add('gb-left-border'); }
        box.contentEditable = true;
        box.dataset.fullText = boxData.text;
        box.innerText = boxData.text ? String(boxData.text).charAt(0) : '';

        box.onfocus = handleBoxFocus;
        box.onblur = function(e) { handleInputBlur(e, this, i, 'text'); };
        
        wrapper.appendChild(furigana);
        wrapper.appendChild(box);
        gridContainer.appendChild(wrapper);
    });
    
    section.appendChild(gridContainer);

    if(toolbar) {
    
    }
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
    renderBoxes(section);
    paginate();
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
    paginate();
}

function setTextFieldColumns(element, columns) {
    const content = element.querySelector('.text-field-content');
    if (!content) return;

    const currentColCount = content.children.length;
    if (columns === currentColCount) return;

    if (columns === 2) {
        // From 1 to 2
        content.dataset.columns = '2';
        const newCol = document.createElement('div');
        newCol.className = 'text-col';
        newCol.contentEditable = true;
        newCol.innerHTML = '<p><br></p>'; // Add a blank paragraph
        content.appendChild(newCol);
    } else if (columns === 1) {
        // From 2 to 1
        if (confirm('Merging to one column will append the content of the second column to the first. Continue?')) {
            content.dataset.columns = '1';
            const firstCol = content.children[0];
            const secondCol = content.children[1];
            if (firstCol && secondCol) {
                const secondColContent = secondCol.innerHTML;
                // Don't merge if the second column is empty
                if (secondColContent !== '<p><br></p>' && secondColContent !== '<p></p>' && secondColContent !== '') {
                    firstCol.innerHTML += secondColContent;
                }
                secondCol.remove();
            }
        }
    }
    paginate();
}

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

function setCaretToEnd(el) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function adjustZoom(delta) {
    currentZoom += delta;

    if (currentZoom < 0.5) currentZoom = 0.5;
    if (currentZoom > 2.0) currentZoom = 2.0;

    const canvas = document.getElementById('editorCanvas');
    canvas.style.transform = `scale(${currentZoom})`;

    document.getElementById('zoomDisplay').innerText = Math.round(currentZoom * 100) + '%';
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
    paginate();
}

function removeLastVocabTerm(vocabularyElement) {
    const vocabularyContainer = vocabularyElement.querySelector('.vocabulary-container');
    if (vocabularyContainer.children.length > 1) { // Keep at least one term
        vocabularyContainer.lastElementChild.remove();
        paginate();
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

/**
 * Handles keyboard navigation for grid inputs.
 * Requirements:
 * 1. Arrow Left/Right: Move to the adjacent column (same input type).
 * 2. Tab: Move from Furigana -> Box (Down).
 * 3. Shift+Tab: Move from Box -> Furigana (Up).
 */
function handleGridNavKeydown(event) {
    const currentInput = event.target;
    
    const isFurigana = currentInput.classList.contains('grid-furigana'); 
    const isBox  = currentInput.classList.contains('grid-box');

    if (!isFurigana && !isBox) return;

    const currentColumn = currentInput.closest('.grid-box-wrapper'); 
    
    if (!currentColumn) return;

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        
        let targetColumn = null;
        
        if (event.key === 'ArrowLeft') {
            targetColumn = currentColumn.previousElementSibling;
        } else {
            targetColumn = currentColumn.nextElementSibling;
        }

        if (targetColumn) {
            const selector = isFurigana ? '.grid-furigana' : '.grid-box';
            const targetInput = targetColumn.querySelector(selector);
            if (targetInput) targetInput.focus();
        }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        if (event.key === 'ArrowUp' && isBox) {
            const furiganaSibling = currentColumn.querySelector('.grid-furigana');
            if (furiganaSibling) furiganaSibling.focus();
        } else if (event.key === 'ArrowDown' && isFurigana) {
            const boxSibling = currentColumn.querySelector('.grid-box');
            if (boxSibling) boxSibling.focus();
        }
    }
}

// ===== PAGINATION LOGIC =====

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

const MAX_USABLE_HEIGHT_MM = 271.6;
const MM_TO_PX = 3.7795275591; // Standard 96 DPI
const MAX_USABLE_HEIGHT_PX = MAX_USABLE_HEIGHT_MM * MM_TO_PX;

function createNewPage() {
    const page = document.createElement('div');
    page.className = 'sheet'; // Keep worksheet-container for compatibility
    return page;
}

function paginate() {
    const canvas = document.getElementById('editorCanvas');
    if (!canvas) return;

    // 0. Reset any previous oversized states and markers
    document.querySelectorAll('.sheet.has-oversized-content').forEach(sheet => {
        sheet.classList.remove('has-oversized-content');
        sheet.querySelector('.page-break-marker')?.remove();
        sheet.querySelector('.cut-line-warning')?.remove(); 
    });
    document.querySelectorAll('.row-wrapper.is-oversized-row').forEach(row => row.classList.remove('is-oversized-row'));


    // 1. Gather all rows and the title from all pages
    const allRows = Array.from(canvas.querySelectorAll('.row-wrapper'));
    const title = document.querySelector('.worksheet-title'); // Assume only one title

    // Detach them to preserve state and event listeners
    allRows.forEach(row => row.remove());
    if (title) title.remove();

    // 2. Clear all pages from the canvas
    canvas.innerHTML = '';

    // 3. Create the first page
    let currentPage = createNewPage();
    canvas.appendChild(currentPage);

    // 4. Add title to the first page and account for its height
    let currentHeight = 0;
    if (title) {
        currentPage.appendChild(title);
        currentHeight += title.offsetHeight;
    }

    // 5. Distribute rows one by one
    allRows.forEach(row => {
        // Temporarily append to measure height (will be moved if it overflows)
        currentPage.appendChild(row);
        const rowHeight = row.offsetHeight;
        row.remove(); // Remove after measurement to correctly place


        if (rowHeight > MAX_USABLE_HEIGHT_PX) { // FR-01: Detect "Super-Tall" Rows
            // Case: Oversized Row
            currentPage.appendChild(row); // Keep on current page
            currentPage.classList.add('has-oversized-content'); // CSS to remove bottom margin/gap
            row.classList.add('is-oversized-row'); // Flag row for print CSS

            // Add visual marker
            const marker = document.createElement('div');
            marker.className = 'page-break-marker';
            currentPage.appendChild(marker);

            // Add warning icon as per FR
            const warning = document.createElement('div');
            warning.className = 'cut-line-warning'; 
            warning.innerHTML = '&#9888; Content splits here'; // Warning symbol
            currentPage.appendChild(warning);

            // Force creation of next page for subsequent items (if any remain)
            currentPage = createNewPage(); 
            canvas.appendChild(currentPage);
            currentHeight = 0; // Reset height for the next (empty) page.
        }
        else if (currentHeight + rowHeight > MAX_USABLE_HEIGHT_PX) { // Case: Standard Page Break
            currentPage = createNewPage();
            canvas.appendChild(currentPage);
            currentPage.appendChild(row);
            currentHeight = rowHeight;
        } else { // Case: Fits
            currentPage.appendChild(row);
            currentHeight += rowHeight;
        }
    });

    // 6. Clean up any empty pages
    Array.from(canvas.querySelectorAll('.sheet')).forEach(page => {
        // A page is empty if it has no rows and no title element
        if (page.children.length === 0 || (page.children.length === 1 && page.querySelector('.worksheet-title'))) {
             // Don't remove the very last page if it's the only one
            if (canvas.children.length > 1) {
                page.remove();
            }
        }
    });
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

            <label class="prop-label" style="margin-top: 10px;">Actions</label>
            <button class="prop-button-danger" onclick="deleteSection(document.getElementById('${section.id}'))">Delete Section</button>
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