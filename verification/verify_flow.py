from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        # Step 1: Navigate to upload page
        page.goto("http://localhost:8080/print-report")
        page.screenshot(path="verification/01_upload_page.png")
        print("Captured upload page")

        # Step 2: Fill form
        page.fill("#courseId", "101")
        page.fill("#quizId", "1001")

        # Step 3: Upload CSV
        # We need a dummy CSV file. I'll create one in the verification folder or use the one in root.
        # Assuming student_answer.csv is in the root.
        page.set_input_files("#csvFile", "student_answer.csv")

        # Step 4: Submit
        with page.expect_navigation():
            page.click("button[type='submit']")

        # Step 5: Capture report
        page.screenshot(path="verification/02_report_desktop.png", full_page=True)
        print("Captured desktop report")

        # Step 6: Responsive check - Tablet
        page.set_viewport_size({"width": 768, "height": 1024})
        page.screenshot(path="verification/03_report_tablet.png", full_page=True)
        print("Captured tablet report")

        # Step 7: Responsive check - Mobile
        page.set_viewport_size({"width": 375, "height": 667})
        page.screenshot(path="verification/04_report_mobile.png", full_page=True)
        print("Captured mobile report")

        browser.close()

if __name__ == "__main__":
    run()
