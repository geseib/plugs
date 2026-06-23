---
name: csv-to-excel-report
description: Generates styled Excel reports from CSV data. Merges sales transactions with targets, calculates KPIs, and outputs a formatted .xlsx workbook with executive summary and filterable data sheets. Use when converting CSV exports into polished Excel reports.
user-invocable: false
---
<!-- skill-version: v1 -->
<!-- version-notes: v1=Initial skill with 7-step methodology, openpyxl styling, sample data -->
# CSV to Excel Report Generator

Generate professional Excel reports from CSV data. Merge datasets, calculate KPIs, and output styled .xlsx workbooks with executive summaries and filterable data sheets.

## When to use

TRIGGER when:
- User asks to generate a report from CSV files
- User mentions merging CSVs into Excel
- User needs a sales, performance, or financial report from tabular data
- User has transaction data and targets/budgets to combine
- User asks for an Excel workbook with formatting, styling, or filters

DO NOT TRIGGER when:
- User wants CSV-to-CSV transformation with no Excel output
- User needs a dashboard in a BI tool (Tableau, Power BI, Looker)
- User wants PDF output, not Excel
- User explicitly asks for raw data without formatting
- User is working with non-tabular data (images, text documents)

## Methodology (follow in order, never skip step 1)

### Step 1: Validate input CSVs

Before any processing, check that both files exist and contain the required columns.

**Sales data CSV must have:** date, region, sales_rep, product_category, units_sold, unit_price, revenue

**Targets CSV must have:** region, sales_rep, quarter, target_revenue

If columns are missing or renamed:
- Normalize column names to lowercase and strip whitespace
- Report WHICH columns are missing vs. found
- Suggest corrections for close matches (e.g., "Revenue" → "revenue")
- Halt and explain — do not silently proceed with wrong columns

### Step 2: Install dependencies

Check if `openpyxl` is available. If not, install it:

```bash
pip install openpyxl
```

The script requires `pandas>=2.2.2` and `openpyxl>=3.1.0`. A `requirements.txt` is provided in `scripts/`.

### Step 3: Load and merge data

1. Read both CSVs with pandas
2. Derive a `quarter` column from the date (format: "2024-Q1", "2024-Q2", etc.)
3. Left-join sales data onto targets on `(region, sales_rep, quarter)`
4. Calculate: `achievement_pct = revenue / target_revenue`, `variance = revenue - target_revenue`
5. Handle missing targets gracefully — keep the row, show blank/N/A for target-dependent fields

**CORRECT — left join preserves all sales rows:**
```python
merged = sales_df.merge(targets_df, on=["region", "sales_rep", "quarter"], how="left")
```

**WRONG — inner join drops rows without targets:**
```python
merged = sales_df.merge(targets_df, on=["region", "sales_rep", "quarter"], how="inner")
```

### Step 4: Calculate executive summary KPIs

Compute from the merged data:
- **Total Revenue:** sum of all revenue
- **Total Units Sold:** sum of units_sold
- **Average Deal Size:** total revenue / number of transactions
- **Active Sales Reps:** distinct count of sales_rep
- **Regional breakdown:** group by region → revenue, target, achievement %, variance
- **Top 5 performers:** group by sales_rep → sum revenue, rank descending

### Step 5: Generate Executive Summary sheet

Build the first sheet with openpyxl:

1. **Header area** (rows 1-2): Report title, date range derived from data
2. **KPI cards** (rows 4-6): 2×2 layout with labels and values, light blue background
3. **Regional breakdown table** (rows 9+): Headers with dark blue fill, white text. Currency/percentage formatting. Conditional fill: green for positive variance, red for negative
4. **Top 5 performers table**: Rank, name, revenue, deal count

**Style constants to define once:**
- Header fill: dark blue `#1F4E79` with white bold text
- KPI cards: light blue `#D6E4F0` background
- Currency: `$#,##0.00`
- Percentage: `0.0%`
- Borders on all table cells

### Step 6: Generate Sales Data sheet

Build the second sheet with the full merged dataset:

1. **Write headers** in row 1 with dark blue fill and white bold text
2. **Write all data rows** with proper formatting per column type
3. **Freeze header row:** `ws.freeze_panes = "A2"`
4. **Enable auto-filters:** `ws.auto_filter.ref = "A1:<last_col><last_row>"`
5. **Alternating row colors:** light gray `#F2F2F2` / white
6. **Number formatting:** currency for dollar columns, `0.0%` for achievement, `#,##0` for integers
7. **Column widths:** set reasonable widths (12-18 chars) — do not leave defaults
8. **Replace NaN with blank** — no Python `nan` visible in cells

### Step 7: Validate output

After saving, reopen the file with openpyxl in read mode and verify:
- Both sheets exist ("Executive Summary", "Sales Data")
- Data row count matches expected
- Print summary to stdout: file path, row count, any warnings

## Running the script

```bash
python3 scripts/generate_report.py <sales.csv> <targets.csv> <output.xlsx>
```

Sample data for testing is in `assets/`:
```bash
python3 scripts/generate_report.py assets/sample_sales_data.csv assets/sample_sales_targets.csv report.xlsx
```

## Anti-patterns (never do these)

1. **Using xlsxwriter** — openpyxl is required for read-back validation in Step 7
2. **Hardcoding date ranges** — always derive from the actual data
3. **Inner join** — drops sales rows without targets; use left join
4. **Silently dropping rows** — missing targets should show as blank, not be removed
5. **Skipping column validation** — catch mismatches early with clear messages
6. **Default column widths** — always set widths; narrow columns make reports unreadable
7. **Showing raw Python types** — no `nan`, `Timestamp(...)`, or `None` in cells
8. **Row-by-row styling loops for large datasets** — define styles once, apply efficiently
