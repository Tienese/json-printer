# Database & Persistence Audit Report

This report documents the storage technology and data recovery mechanisms implemented in the `json-printer` (QTI Helper) codebase.

## 1. Primary Database Technology
The application uses **SQLite** as its primary relational data store.

*   **Type**: Embedded SQL Database.
*   **Storage**: File-based (`./data/app.db`).
*   **Driver**: `org.xerial:sqlite-jdbc` (v3.45.0.0).
*   **Dialect**: `org.hibernate.community.dialect.SQLiteDialect`.
*   **ORM**: Spring Data JPA with Hibernate.

### Technical Configuration
Verified in `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:sqlite:./data/app.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
```

---

## 2. Data Persistence & Recovery
The system implements a multi-layered persistence strategy to prevent data loss during browser refreshes or crashes.

### Layer 1: Server-Side Storage (SQLite)
*   **Mechanism**: Explicitly saving a worksheet (via "Save to Cloud") writes the full JSON representation to the `worksheets` table in SQLite.
*   **Autosave History**: The backend maintains up to **10 historical autosaves** per worksheet.
    *   **Implementation**: `WorksheetStorageController.java` captures snapshots and prunes older versions.

### Layer 2: Client-Side Persistence (LocalStorage)
*   **Autosave Trigger**: The `useAutoSave.ts` hook automatically synchronizes state to `localStorage`.
    *   **Interval**: Long-running interval (25 mins) when focused.
    *   **Background Save**: Automatically triggers **once** whenever the tab is hidden or blurred.
*   **Timeline Feature**: If a refresh occurs on an unsaved draft, the user can recover versions from the `worksheet_history_v2` key in `localStorage` via the "Timeline" menu.

---

## 3. Audit Findings Summary

| Feature | Implementation | Details |
| :--- | :--- | :--- |
| **Database Engine** | SQLite | Zero-config, stored in `/data/app.db`. |
| **Refresh Safety** | High | Data is preserved via LocalStorage and Server snapshots. |
| **Concurrency** | Single-user | SQLite is optimized for the local-user desktop model. |
| **Recovery UI** | Version Timeline | Users can browse and restore previous auto/manual saves. |

> [!NOTE]
> The application follows a "Local-First" architectural pattern, ensuring that work is never lost even if the backend is temporarily unreachable or the page is refreshed without a manual save.
