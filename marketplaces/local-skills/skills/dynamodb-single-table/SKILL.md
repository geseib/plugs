---
name: dynamodb-single-table
description: Designs DynamoDB tables using single table design. One table, generic keys, co-located entities, GSI overloading. Use when designing or reviewing DynamoDB data models, key design, or GSI strategy.
---
<!-- skill-version: v3 -->
<!-- version-notes: v1=Initial skill with core patterns and examples; v2=Added feed fanout, migration guidance, denormalization tradeoffs; v3=Condensed for smaller models — rules over examples, removed verbose patterns -->
# DynamoDB Single Table Design

Design DynamoDB tables using single table design. One table, generic keys, co-located entities.

## When to use

TRIGGER: Designing or reviewing DynamoDB data models, key design, or GSI strategy.
SKIP: Relational databases, non-AWS databases, or explicit multi-table requests.

## Methodology (follow in order, never skip step 1)

### Step 1: List ALL access patterns FIRST

Before any key design, enumerate every read/write as a table:

| Access Pattern | Operation | Key Condition |
|---|---|---|
| (fill in every query the app needs) | GetItem/Query | PK=..., SK=... |

**Every pattern must map to GetItem or Query. If it requires Scan, redesign.**

### Step 2: Design keys

- **Base table:** `PK` (String), `SK` (String) — always generic names
- **Key format:** `ENTITY#value` with `#` delimiter (e.g., `USER#alice`, `ORDER#2024-001`)
- **PK** = high-cardinality partition (e.g., user ID, org ID, game ID)
- **SK** = enables range queries via `begins_with`, `between`
- **Co-locate** related items under same PK for single-Query retrieval
- **Composite SK** for hierarchy: `DEPT#eng#TEAM#backend#EMP#alice`

### Step 2b: Flag patterns that DON'T fit DynamoDB

State explicitly which patterns need other services:
- Full-text/fuzzy search → **OpenSearch** (zero-ETL integration)
- Aggregations/analytics/trending → **OpenSearch or Redshift** (zero-ETL)
- Social feeds with unbounded fan-out → **DynamoDB Streams + fan-out-on-write** (discuss tradeoff: fan-out-on-write vs fan-out-on-read vs hybrid)
- Hot-read caching → **ElastiCache/DAX**

Don't force everything into DynamoDB. Say what goes where.

### Step 3: Design GSIs (max 2-3)

- **Generic names:** `GSI1PK`/`GSI1SK`, `GSI2PK`/`GSI2SK`
- **Overload GSIs:** different entity types use same GSI attributes with different prefixes
- **Sparse indexes:** items that don't need a GSI omit the attributes entirely
- **Key patterns:**
  - Inverted index: `GSI1PK=SK, GSI1SK=PK` (query relationships from either direction)
  - Status/type index: `GSI1PK=STATUS#OPEN, GSI1SK=<date>` (sparse — only matching items appear)
  - Connection index: GSI on ConnectionId for WebSocket disconnect cleanup
- **Each GSI doubles write cost** for items that populate it. Fewer is better.

### Step 4: Output the design

Always deliver:
1. **Access pattern table** — filled in with key conditions for every pattern
2. **Entity chart** — table showing each entity's PK, SK, GSI keys, key attributes
3. **IaC definition** — CDK, SAM, or CloudFormation (match project toolchain)
4. **Rationale** — brief explanation of key decisions and tradeoffs

## Key patterns (use as needed)

- **One-to-many:** Parent PK, child items with `SK=CHILD#id`. Query with `begins_with`.
- **Many-to-many:** Adjacency list. Inverted GSI (`GSI1PK=SK, GSI1SK=PK`) for both directions.
- **Time-series:** Bucket PKs by time period (e.g., `SENSOR#id#2024-03`). Prevents unbounded partition growth. Use TTL for auto-cleanup.
- **WebSocket/real-time:** All entities under `GAME#id` PK. GSI on ConnectionId for disconnect lookup. TTL for session data.
- **Hierarchical:** Composite SK encodes hierarchy. Query with `begins_with` at any level.

## Denormalization rules

- Duplicate data to avoid extra reads — storage is cheap ($0.25/GB/month), reads are not
- **Warn about update cost:** if duplicated field changes, all copies must update (use Streams + Lambda)
- **Don't denormalize** frequently-changing data — do an extra read instead
- State the consistency tradeoff explicitly when recommending denormalization

## Migration from SQL

- Don't map SQL tables 1:1 — collapse related tables into one DynamoDB table
- Every JOIN becomes co-location (same PK) or a GSI
- No more ad-hoc queries — every access pattern must be planned
- Run in parallel during transition, validate completeness before cutover

## Table defaults

```yaml
BillingMode: PAY_PER_REQUEST
TimeToLiveSpecification: { AttributeName: ttl, Enabled: true }
PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true }
DeletionProtectionEnabled: true
```

## Anti-patterns (never do these)

1. **Scan** — redesign keys if any pattern requires Scan
2. **Hot partitions** — avoid low-cardinality PKs. Use write sharding if needed
3. **Unbounded collections** — bucket or paginate. No unlimited items per PK
4. **One GSI per access pattern** — overload GSIs instead
5. **Filter as primary filtering** — filters still consume read capacity. Push into key conditions
6. **Skipping step 1** — access patterns must come before key design, always
