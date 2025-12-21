package com.qtihelper.demo.service;

import com.qtihelper.demo.dto.worksheet.*;
import com.qtihelper.demo.model.GridRowViewModel;
import com.qtihelper.demo.model.HeaderRowViewModel;
import com.qtihelper.demo.model.TextRowViewModel;
import com.qtihelper.demo.model.WorksheetViewModel;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WorksheetGeneratorServiceTest {

    private WorksheetGeneratorService service;

    @BeforeEach
    void setUp() {
        service = new WorksheetGeneratorService();
    }

    @Test
    void generateWorksheet_ValidConfig_ReturnsViewModel() {
        WorksheetConfigDto config = new WorksheetConfigDto();
        config.setTitle("Test Worksheet");
        config.setShowGuideLines(true);
        
        List<WorksheetRow> rows = new ArrayList<>();
        
        HeaderRow header = new HeaderRow();
        header.setShowDate(true);
        header.setShowName(true);
        rows.add(header);
        
        TextRow text = new TextRow();
        text.setText("Practice your kanji");
        text.setFontSize(12);
        rows.add(text);
        
        GridRow grid = new GridRow();
        grid.setContent("漢");
        grid.setBoxCount(5);
        grid.setBoxSize(BoxSize.SIZE_10MM);
        grid.setShowGuideLines(true);
        rows.add(grid);
        
        config.setRows(rows);

        WorksheetViewModel result = service.generateWorksheet(config);

        assertNotNull(result);
        assertEquals("Test Worksheet", result.title());
        assertEquals(3, result.rows().size());
        
        assertTrue(result.rows().get(0) instanceof HeaderRowViewModel);
        assertTrue(result.rows().get(1) instanceof TextRowViewModel);
        assertTrue(result.rows().get(2) instanceof GridRowViewModel);
        
        GridRowViewModel gridVm = (GridRowViewModel) result.rows().get(2);
        assertEquals(5, gridVm.characters().size());
        assertEquals("漢", gridVm.characters().get(0));
        assertEquals("", gridVm.characters().get(1));
    }

    @Test
    void generateWorksheet_EmptyRows_ThrowsException() {
        WorksheetConfigDto config = new WorksheetConfigDto();
        config.setRows(new ArrayList<>());

        assertThrows(IllegalArgumentException.class, () -> 
            service.generateWorksheet(config)
        );
    }

    @Test
    void generateWorksheet_TooManyRows_ThrowsException() {
        WorksheetConfigDto config = new WorksheetConfigDto();
        List<WorksheetRow> rows = new ArrayList<>();
        for (int i = 0; i < 51; i++) {
            rows.add(new TextRow());
        }
        config.setRows(rows);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> 
            service.generateWorksheet(config)
        );
        assertTrue(exception.getMessage().contains("cannot have more than 50 rows"));
    }

    @Test
    void processGridContent_UnicodeAware() {
        // Emoji 🍣 is a surrogate pair in UTF-16
        WorksheetConfigDto config = new WorksheetConfigDto();
        GridRow grid = new GridRow();
        grid.setContent("🍣🍺");
        grid.setBoxCount(2);
        grid.setBoxSize(BoxSize.SIZE_08MM);
        config.setRows(List.of(grid));

        WorksheetViewModel result = service.generateWorksheet(config);
        GridRowViewModel gridVm = (GridRowViewModel) result.rows().get(0);
        
        assertEquals(2, gridVm.characters().size());
        assertEquals("🍣", gridVm.characters().get(0));
        assertEquals("🍺", gridVm.characters().get(1));
    }
}
