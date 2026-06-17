# PORMS Report 4 Sequence Diagrams

These diagrams follow the UML sequence-diagram structure used by the reference
Report 4 while keeping the number of lifelines readable on a US Letter page.

| Report figure | Source file | Scope |
| --- | --- | --- |
| Figure 9 | `figure-09-weather-ingestion.puml` | Scheduled OpenWeather ingestion, persistence, failure handling and risk trigger |
| Figure 11 | `figure-11-risk-evaluation.puml` | Threshold loading, factor evaluation, MAX aggregation and risk-change event |
| Figure 13 | `figure-13-sop-mode-alert-task.puml` | SOP matching, tasks, alert anti-spam, mode transition and audit |
| Figure 15 | `figure-15-port-decision-support.puml` | Authorized dashboard request and conservative operation recommendation |
| Figure 17 | `figure-17-simulation-execution.puml` | Scenario replay through isolated weather, risk and SOP records |

The `.puml` files are editable source files. The generated `.png` files are
intended for Word/Google Docs, while `.svg` files are suitable for further
vector editing or import into diagrams.net.
