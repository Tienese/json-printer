---
description: Query dev logs for anomalies and debug worksheet builder issues
---

# Check Dev Logs Workflow

This workflow queries the Dev Assertion Logger API to find anomalies and debug issues in the worksheet builder.

## Step 1: Check for Recent Anomalies

```bash
# turbo
curl -s http://localhost:8080/api/dev/logs/anomalies | head -100
```

## Step 2: Get Summary Statistics

```bash
# turbo
curl -s http://localhost:8080/api/dev/stats
```

## Step 3: Query by Time Range (Last Hour)

```bash
# Get timestamp from 1 hour ago
SINCE=$(node -e "console.log(new Date(Date.now() - 3600000).toISOString())")
curl -s "http://localhost:8080/api/dev/logs/since/$SINCE"
```

## Step 4: Analyze Findings

For each anomaly found:
1. Note the `expected` vs `actual` values
2. Review the `stateSnapshot` if present
3. Identify the `component` and `action` where it occurred

## Step 5: Reproduce in Browser (if needed)

Use the browser tool to:
1. Navigate to the worksheet builder
2. Attempt to reproduce the anomaly based on the action
3. Observe if the same anomaly occurs

## Step 6: Report Findings

Provide a summary with:
- Total number of anomalies found
- Most common assertion failures
- Recommended fixes or investigations
