# QTI Helper - Quiz to Canvas Converter

A modern Spring Boot + React application for creating, converting, and printing educational quizzes for Canvas LMS.

## 🚀 Quick Start

```bash
# Build and run
mvn clean install
mvn spring-boot:run

# Development mode (separate terminal for React hot reload)
cd worksheet-ui && npm run dev
```

**Access:** `http://localhost:8080`

---

## 📋 Features

### 🎨 Worksheet Builder (`/#worksheet`)
- Visual WYSIWYG worksheet editor
- Grid boxes for handwriting practice
- Header rows with date/name fields
- Text rows with customizable formatting
- Print-optimized A4 output

### 📚 Quiz Import & QTI Converter (`/#dashboard`)
- Import JSON quiz definitions
- Convert to QTI 1.2 format
- Direct Canvas LMS migration
- Support for multiple question types:
  - Multiple Choice
  - Multiple Answer
  - True/False
  - Multiple Dropdowns
  - Matching

### 🖨️ Print Report Generator (`/#print-report`)
- Generate printable student reports
- Combine Canvas quiz data with CSV exports
- Automatic correctness evaluation
- Comprehensive feedback display
- B&W-optimized A4 output

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)               │
│  worksheet-ui/                                          │
│  - Hash Router (#dashboard, #worksheet, #print-report)  │
│  - Tailwind CSS                                         │
│  - TypeScript                                           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (Spring Boot 3.5)               │
├─────────────────────────────────────────────────────────┤
│  Controllers:                                           │
│  - DashboardController    /api/courses, /api/quizzes    │
│  - PrintReportController  /api/print-report/*           │
│  - QuizImportController   /quiz/api/*                   │
│  - SpaController          SPA routing support           │
├─────────────────────────────────────────────────────────┤
│  Services:                                              │
│  - CanvasQuizFetcher      Canvas API integration        │
│  - CanvasMigrationService QTI upload to Canvas          │
│  - QtiContentGeneratorService   QTI 1.2 XML generation  │
│  - PrintReportGenerator   Student report generation     │
│  - WorksheetGeneratorService    Worksheet PDF generation│
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints

### Dashboard API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List Canvas courses |
| GET | `/api/courses/{courseId}/quizzes` | List quizzes in course |
| POST | `/api/cache/refresh` | Clear and refresh cache |

### Print Report API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/print-report/blank-quiz` | Get blank quiz template |
| POST | `/api/print-report/generate` | Generate student reports |

### Quiz Import API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quiz/api/parse` | Parse JSON quiz |
| POST | `/quiz/api/process` | Convert to QTI & upload |
| POST | `/quiz/validate` | Validate quiz structure |

---

## ⚙️ Configuration

### Canvas API Settings (`application.properties`)

```properties
app.canvas.url=https://your-canvas-instance.com
app.canvas.token=your_api_token_here
```

### Environment Requirements

| Component | Version |
|-----------|---------|
| Java | 21 LTS |
| Node.js | 22.x |
| Maven | 3.9+ |
| Spring Boot | 3.5.x |

---

## 📦 Project Structure

```
json-printer/
├── src/main/java/com/qtihelper/demo/
│   ├── config/          # Configuration (CanvasProperties)
│   ├── controller/      # REST controllers
│   ├── dto/             # Data Transfer Objects (Records)
│   │   ├── canvas/      # Canvas API DTOs
│   │   ├── quiz/        # Quiz import DTOs
│   │   └── worksheet/   # Worksheet DTOs
│   ├── exception/       # Custom exceptions
│   ├── model/           # Domain models
│   └── service/         # Business logic
├── worksheet-ui/        # React frontend (Vite + Tailwind)
├── pom.xml              # Maven configuration
└── README.md            # This file
```

---

## 🛠️ Development

### Build Commands

```bash
# Full build (backend + frontend)
mvn clean install

# Backend only
mvn compile

# Frontend only
cd worksheet-ui && npm run build

# Run tests
mvn test
```

### Code Quality

The codebase follows modern Java practices:
- **Java 21 Records** for DTOs (no Lombok)
- **SonarLint compliant** code
- **Null-safe** with `Objects.requireNonNull()`
- **Custom exceptions** for error handling

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to fetch quiz" | Check Canvas API token permissions |
| "No questions found" | Ensure quiz has published questions |
| CSV parsing errors | Verify CSV matches Canvas export format |
| Build fails | Ensure Java 21 and Node 22 are installed |

---

## 📝 License

MIT License - See LICENSE file for details.

---

**Ready to use!** 🎉 Visit `http://localhost:8080` after starting the application.
