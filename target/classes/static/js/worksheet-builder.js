/**
 * Japanese Writing Worksheet Builder
 * Handles dynamic row composition and worksheet generation.
 */

const MAX_ROWS = 50;

/**
 * Add a new row of the specified type.
 * @param {string} type - HEADER, TEXT, or GRID
 */
function addRow(type) {
    const container = document.getElementById('rowsContainer');
    const emptyState = document.getElementById('emptyState');

    // Check row limit
    const currentRows = container.querySelectorAll('.row-block').length;
    if (currentRows >= MAX_ROWS) {
        alert(`Maximum ${MAX_ROWS} rows allowed.`);
        return;
    }

    // Get the appropriate template
    const templateId = type.toLowerCase() + 'RowTemplate';
    const template = document.getElementById(templateId);
    if (!template) {
        console.error('Template not found:', templateId);
        return;
    }

    // Clone template content
    const clone = template.content.cloneNode(true);

    // Hide empty state if visible
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // Append to container
    container.appendChild(clone);

    // Update row numbers and count
    updateRowNumbers();

    // Initialize box size max if it's a grid row
    if (type === 'GRID') {
        const rows = container.querySelectorAll('.row-block');
        const lastRow = rows[rows.length - 1];
        const boxSizeSelect = lastRow.querySelector('.grid-boxSize');
        if (boxSizeSelect) {
            updateMaxBoxes(boxSizeSelect);
        }
    }
}

/**
 * Remove a row from the container.
 * @param {HTMLElement} button - The remove button clicked
 */
function removeRow(button) {
    const rowBlock = button.closest('.row-block');
    if (rowBlock) {
        rowBlock.remove();
        updateRowNumbers();

        // Show empty state if no rows remain
        const container = document.getElementById('rowsContainer');
        const emptyState = document.getElementById('emptyState');
        const currentRows = container.querySelectorAll('.row-block').length;

        if (currentRows === 0 && emptyState) {
            emptyState.style.display = 'block';
        }
    }
}

/**
 * Update row numbers and the total count display.
 */
function updateRowNumbers() {
    const container = document.getElementById('rowsContainer');
    const rows = container.querySelectorAll('.row-block');
    const countBadge = document.getElementById('rowCount');

    rows.forEach((row, index) => {
        const numberSpan = row.querySelector('.row-number');
        if (numberSpan) {
            numberSpan.textContent = `#${index + 1}`;
        }
    });

    if (countBadge) {
        countBadge.textContent = rows.length;
    }
}

/**
 * Update the max boxes hint when box size changes.
 * @param {HTMLSelectElement} select - The box size select element
 */
function updateMaxBoxes(select) {
    const rowBlock = select.closest('.row-block');
    if (!rowBlock) return;

    const selectedOption = select.options[select.selectedIndex];
    const maxBoxes = selectedOption.dataset.max || 15;

    // Update the hint text
    const maxBoxesSpan = rowBlock.querySelector('.max-boxes');
    if (maxBoxesSpan) {
        maxBoxesSpan.textContent = maxBoxes;
    }

    // Update the box count input max attribute
    const boxCountInput = rowBlock.querySelector('.grid-boxCount');
    if (boxCountInput) {
        boxCountInput.max = maxBoxes;
        // Clamp current value if exceeds new max
        if (parseInt(boxCountInput.value) > parseInt(maxBoxes)) {
            boxCountInput.value = maxBoxes;
        }
    }
}

/**
 * Collect worksheet data from the DOM.
 * @returns {Object} Worksheet configuration object
 */
function collectWorksheetData() {
    const title = document.getElementById('worksheetTitle').value.trim() || 'Japanese Writing Practice';
    const showGuideLines = document.getElementById('showGuideLines').checked;

    const container = document.getElementById('rowsContainer');
    const rowElements = container.querySelectorAll('.row-block');

    const rows = [];

    rowElements.forEach(rowEl => {
        const type = rowEl.dataset.type;

        switch (type) {
            case 'HEADER':
                rows.push({
                    type: 'HEADER',
                    showName: rowEl.querySelector('.header-showName').checked,
                    nameLabel: rowEl.querySelector('.header-nameLabel').value.trim() || 'Name:',
                    showDate: rowEl.querySelector('.header-showDate').checked,
                    dateLabel: rowEl.querySelector('.header-dateLabel').value.trim() || 'Date:'
                });
                break;

            case 'TEXT':
                rows.push({
                    type: 'TEXT',
                    text: rowEl.querySelector('.text-content').value.trim(),
                    fontSize: parseInt(rowEl.querySelector('.text-fontSize').value) || 12,
                    bold: rowEl.querySelector('.text-bold').checked,
                    alignment: rowEl.querySelector('.text-alignment').value || 'left'
                });
                break;

            case 'GRID':
                rows.push({
                    type: 'GRID',
                    boxSize: rowEl.querySelector('.grid-boxSize').value,
                    boxCount: parseInt(rowEl.querySelector('.grid-boxCount').value) || 10,
                    content: rowEl.querySelector('.grid-content').value || '',
                    showGuideLines: rowEl.querySelector('.grid-showGuideLines').checked
                });
                break;
        }
    });

    return {
        title: title,
        showGuideLines: showGuideLines,
        rows: rows
    };
}

/**
 * Validate the worksheet configuration via AJAX.
 */
async function validateWorksheet() {
    const data = collectWorksheetData();
    const resultDiv = document.getElementById('validationResult');

    try {
        const response = await fetch('/worksheet/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        resultDiv.style.display = 'block';

        if (result.valid) {
            resultDiv.className = 'alert alert-success mt-20';
            resultDiv.innerHTML = '<strong>✓ Valid:</strong> ' + result.message;
        } else {
            resultDiv.className = 'alert alert-error mt-20';
            resultDiv.innerHTML = '<strong>✗ Invalid:</strong> ' + result.message;
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
            resultDiv.style.display = 'none';
        }, 5000);

    } catch (error) {
        resultDiv.style.display = 'block';
        resultDiv.className = 'alert alert-error mt-20';
        resultDiv.innerHTML = '<strong>Error:</strong> ' + error.message;
    }
}

/**
 * Generate the worksheet and open in a new window for printing.
 */
async function generateWorksheet() {
    const data = collectWorksheetData();

    // Basic client-side validation
    if (data.rows.length === 0) {
        alert('Please add at least one row to the worksheet.');
        return;
    }

    try {
        const response = await fetch('/worksheet/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error('Server error: ' + response.status);
        }

        const html = await response.text();

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();

        // Trigger print dialog after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 500);

    } catch (error) {
        alert('Error generating worksheet: ' + error.message);
        console.error('Generation error:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add a default header and grid row for convenience
    addRow('HEADER');
    addRow('TEXT');
    addRow('GRID');

    // Pre-fill the text row with a sample prompt
    const textRows = document.querySelectorAll('.row-text');
    if (textRows.length > 0) {
        const textInput = textRows[0].querySelector('.text-content');
        if (textInput) {
            textInput.value = 'Practice writing:';
        }
        const boldCheckbox = textRows[0].querySelector('.text-bold');
        if (boldCheckbox) {
            boldCheckbox.checked = true;
        }
    }
});
