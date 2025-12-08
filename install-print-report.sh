#!/bin/bash

# Print Report Feature Installation Script
# Run this from the project root directory

echo "=========================================="
echo "Installing Print Report Feature"
echo "=========================================="

# Create directories
echo "Creating directory structure..."
mkdir -p src/main/java/com/qtihelper/demo/dto/canvas
mkdir -p src/main/java/com/qtihelper/demo/model
mkdir -p src/main/java/com/qtihelper/demo/service
mkdir -p src/main/java/com/qtihelper/demo/controller
mkdir -p src/main/resources/templates

# Copy DTOs
echo "Copying Canvas DTO files..."
cp /home/claude/CanvasQuizDto.java src/main/java/com/qtihelper/demo/dto/canvas/
cp /home/claude/CanvasQuestionDto.java src/main/java/com/qtihelper/demo/dto/canvas/
cp /home/claude/CanvasAnswerDto.java src/main/java/com/qtihelper/demo/dto/canvas/
cp /home/claude/CanvasMatchDto.java src/main/java/com/qtihelper/demo/dto/canvas/

# Copy Models
echo "Copying model files..."
cp /home/claude/StudentSubmission.java src/main/java/com/qtihelper/demo/model/
cp /home/claude/PrintReport.java src/main/java/com/qtihelper/demo/model/

# Copy Services
echo "Copying service files..."
cp /home/claude/CsvSubmissionParser.java src/main/java/com/qtihelper/demo/service/
cp /home/claude/CanvasQuizFetcher.java src/main/java/com/qtihelper/demo/service/
cp /home/claude/PrintReportGenerator.java src/main/java/com/qtihelper/demo/service/

# Copy Controller
echo "Copying controller file..."
cp /home/claude/PrintReportController.java src/main/java/com/qtihelper/demo/controller/

# Copy Templates
echo "Copying template files..."
cp /home/claude/print-report-upload.html src/main/resources/templates/
cp /home/claude/print-report-view.html src/main/resources/templates/

# Copy documentation
echo "Copying documentation..."
cp /home/claude/IMPLEMENTATION_GUIDE.md ./PRINT_REPORT_GUIDE.md

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Add Apache Commons CSV dependency to pom.xml:"
echo "   <dependency>"
echo "       <groupId>org.apache.commons</groupId>"
echo "       <artifactId>commons-csv</artifactId>"
echo "       <version>1.10.0</version>"
echo "   </dependency>"
echo ""
echo "2. Add navigation link to index.html (optional)"
echo "3. Run: mvn clean install"
echo "4. Start application and visit: http://localhost:8080/print-report"
echo ""
echo "See PRINT_REPORT_GUIDE.md for detailed documentation"
echo "=========================================="
