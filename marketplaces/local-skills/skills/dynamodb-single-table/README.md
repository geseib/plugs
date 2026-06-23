# DynamoDB Single Table Design

A skill for designing efficient DynamoDB single table schemas that eliminate the need for multiple tables or database types.

## Purpose

Guides Claude through a structured methodology for DynamoDB data modeling: access patterns first, then key design, then GSIs. Produces complete, deployable table designs.

## Key principles

- **Access patterns drive everything** — define every read/write before designing keys
- **Single table, multiple entity types** — co-locate related data under shared partition keys
- **GSI overloading** — reuse 2-3 GSIs across entity types instead of one per pattern
- **Denormalize aggressively** — duplicate data to avoid extra reads
- **No scans** — every access pattern must map to GetItem or Query

## Sources and influences

- Alex DeBrie's single table design methodology (The DynamoDB Book, dynamodbguide.com)
- AWS official best practices for DynamoDB data modeling
- Patterns from geseib/engagement repo (game/session entity model, WebSocket connections, hierarchical content)
- AWS 2024 feature updates: zero-ETL, warm throughput, resource-based policies, 50% on-demand pricing reduction

## Usage

Load this skill when:
- Designing a new DynamoDB table
- Adding entities or access patterns to an existing table
- Reviewing or refactoring a DynamoDB schema
- Building a serverless app that needs a database

## Example prompt

> "I need a DynamoDB table for a task management app. Users can create projects, add tasks to projects, assign tasks to team members, and filter tasks by status. Each project belongs to an organization."

The skill will walk through access patterns, design PK/SK structures, set up GSIs, and output the full design with IaC.
