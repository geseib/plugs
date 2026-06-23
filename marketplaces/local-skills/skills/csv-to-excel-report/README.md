# CSV to Excel Report Generator

Generates professional Excel reports from CSV data — merges sales transactions with quarterly targets, calculates KPIs, and outputs a styled .xlsx workbook.

## Purpose

Sales managers frequently receive raw CSV exports from CRMs and need polished Excel reports for executives. This skill automates the merge-calculate-format pipeline, producing a two-sheet workbook with an executive summary and filterable data.

## Key Principles

- Validate inputs before processing — catch column mismatches early
- Left join preserves all data — never silently drop rows without targets
- Style consistently — define constants once, apply everywhere
- Handle missing data gracefully — blank cells, not `nan` or errors
- Validate output — reopen and verify before declaring success

## What It Covers

- CSV column validation with fuzzy matching for misnamed columns
- Pandas merge with quarter derivation from dates
- KPI calculation (revenue, units, deal size, rep count)
- Regional breakdown with achievement % and variance
- Top N performer rankings
- openpyxl styling: fills, fonts, borders, number formats
- Frozen panes, auto-filters, alternating row colors
- Output validation

## Skill Structure

```
scripts/
  generate_report.py    # Main script (~250 lines)
  requirements.txt      # pandas, openpyxl
assets/
  sample_sales_data.csv     # 50 rows, 5 regions, 20 reps
  sample_sales_targets.csv  # 80 rows (5 regions × 4 reps × 4 quarters)
```

## Eval Cases

| ID | Type | Criteria | Focus |
|----|------|----------|-------|
| happy-path-basic | happy-path | 10 | Correct merge, both sheets, valid output |
| happy-path-formatting | happy-path | 11 | Professional styling, number formats, filters |
| edge-case-missing-targets | edge-case | 8 | Graceful handling of reps without targets |
| edge-case-large-dataset | edge-case | 7 | Performance with 10K+ rows |
| adversarial-wrong-columns | adversarial | 8 | Column mismatch detection and recovery |

## Sources

- [openpyxl documentation](https://openpyxl.readthedocs.io/)
- [pandas merge documentation](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.merge.html)
- Excel business report formatting best practices
