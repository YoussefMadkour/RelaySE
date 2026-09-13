# Verified Discovery-to-Demo Agent

> An AI Solutions Engineer that turns a B2B discovery call into a verified, personalized product walkthrough, then executes the next technical sales step across real external apps.

## Project Overview

Enterprise discovery calls are highly personalized, but the follow-up usually is not. After every call, an AE or Solutions Engineer has to review requirements, check what the product really supports, decide what to demonstrate, prepare a tailored demo, send the follow-up, schedule the next meeting, and update the CRM.

This project automates that post-discovery work.

The agent:

1. Reads a discovery-call transcript.
2. Extracts buyer requirements, stakeholders, commitments, and next steps.
3. Reads CRM context for the account and opportunity.
4. Verifies every requested capability against authoritative product documentation.
5. Builds a demo plan using only verified capabilities.
6. Navigates a real seeded product environment and captures the relevant workflow.
7. Generates a short personalized walkthrough video.
8. Requests human approval in Slack.
9. After approval, sends the follow-up through Gmail, creates the agreed meeting in Google Calendar, and updates the CRM.
10. Verifies the resulting external state and records a trace for every decision and action.

The core principle is **verified personalization**: the agent may personalize aggressively, but it must never demonstrate or claim unsupported functionality.

---

## The Demo Scenario

A prospect, **Acme Corp**, has just finished a discovery call.

They say:

> “Incoming engineering requests are difficult to triage. We need better sprint planning and we want documentation connected to the work. SAP integration is also important. I’d like our VP Engineering involved in a technical demo next week.”

The CRM says:

- Company: Acme Corp
- Opportunity: $250,000
- Stage: Discovery
- Buyer: Jane Miller, Director of Engineering
- Stakeholder: Maya Chen, VP Engineering

The product capability matrix says:

| Capability | Status | Demo policy |
|---|---|---|
| Work intake / triage | GA | Allowed |
| Sprint / cycle planning | GA | Allowed |
| Product documentation | GA | Allowed |
| SAP integration | Roadmap | **Do not demonstrate as available** |

The agent therefore creates this demo plan:

1. Show an incoming engineering request.
2. Show triage and prioritization.
3. Show moving approved work into a cycle/sprint.
4. Show linked product documentation.
5. **Exclude SAP integration** and flag it to the AE because it is not currently supported.

This is the core reliability moment: **buyer intent does not override product truth**.

---

## External Apps Used

### 1. CRM, HubSpot
Used for account, opportunity, owner, contacts, deal value, current stage, and final activity/next-step updates.

### 2. Google Drive
Used as the authoritative product-knowledge source. It contains the capability matrix and customer-facing communication policy.

### 3. Plane
Used as the real software product being demonstrated. The workspace is seeded with realistic projects, issues, cycles, and pages.

### 4. HyperFrames
Used to turn captured product states into a polished, personalized walkthrough video.

### 5. Slack
Used for the human approval boundary before any customer-facing action.

### 6. Gmail
Used to send the approved personalized follow-up and walkthrough.

### 7. Google Calendar
Used to create the agreed technical follow-up meeting.

The hackathon requires at least three external apps. This project uses the apps because each contributes unique state or actions to the workflow, not simply to satisfy an integration count.

---

## Architecture

```text
Discovery transcript
        |
        v
Requirement extractor
        |
        +----------------------+
        |                      |
        v                      v
     HubSpot               Google Drive
 commercial context         product truth
        |                      |
        +----------+-----------+
                   |
                   v
          Capability verifier
                   |
                   v
              Demo planner
                   |
                   v
                 Plane
           real product state
                   |
               Playwright
                   |
                   v
              HyperFrames
                   |
                   v
        Personalized walkthrough
                   |
                   v
              Slack approval
                   |
            human approves
                   |
       +-----------+-----------+
       |           |           |
       v           v           v
     Gmail      Calendar     HubSpot
      send        create      update
       |           |           |
       +-----------+-----------+
                   |
                   v
            State verification
                   |
                   v
              Run trace
```

---

## Agent Workflow

### 1. Understand the call

The agent extracts:

- buyer pain points
- explicit requirements
- optional interests
- stakeholders
- commitments
- agreed next steps
- scheduling intent
- unsupported or uncertain requests that require verification

Every extracted item retains the transcript span that produced it.

### 2. Read commercial context

The agent reads the CRM and resolves:

- account
- opportunity
- opportunity value
- stage
- owner
- known contacts
- existing next step
- duplicate activities or meetings

### 3. Verify product capabilities

For every buyer requirement, the agent retrieves product evidence and assigns one of:

- `VERIFIED_GA`
- `VERIFIED_BETA`
- `UNSUPPORTED`
- `ROADMAP`
- `UNKNOWN`

Policy:

- GA can be demonstrated.
- Beta may be demonstrated only if explicitly labeled and approved.
- Roadmap and unsupported features must not be shown as available.
- Unknown capabilities require human review.
- The agent must preserve source evidence for every decision.

### 4. Build the personalized demo plan

Only the safe intersection of:

```text
buyer intent ∩ verified product capability
```

becomes the demo.

Each planned scene contains:

- buyer requirement
- transcript evidence
- product capability evidence
- product route or workflow
- scene objective
- allowed wording

### 5. Navigate the real product

Playwright opens the seeded Plane workspace and captures the relevant product states.

The demo is based on a real software environment, not generated screenshots.

### 6. Generate the personalized walkthrough

HyperFrames produces a 30–45 second video containing:

- prospect/company-specific intro
- only verified product workflows
- captured product UI
- concise narration/captions
- next-step CTA

### 7. Request human approval

Slack receives a summary:

```text
ACME FOLLOW-UP READY

Opportunity: $250k

Verified:
✓ Work intake / triage
✓ Sprint planning
✓ Product documentation

Excluded:
⚠ SAP integration, Roadmap

Prepared:
✓ Personalized walkthrough
✓ Follow-up email
✓ VP Engineering technical meeting

[Approve] [Reject]
```

No customer-facing action happens before approval.

### 8. Execute real actions

After approval:

- Gmail sends the follow-up.
- Google Calendar creates the agreed meeting.
- HubSpot records requirements, activity, next step, and walkthrough URL.

### 9. Verify side effects

The run is successful only if the external state confirms that the actions occurred.

Examples:

- Gmail message ID exists.
- Calendar event ID exists.
- CRM activity/next-step update exists.

A failed send must not be recorded as a completed follow-up.

---

## Traceability

Every decision and scene can be traced from buyer intent to product evidence to external action.

Example:

```text
Scene: Issue Triage

Buyer evidence:
Discovery transcript @ 08:42
"We need one place to triage incoming engineering requests."

Product evidence:
Capability Matrix / Work Intake
Status: GA

Product route:
/workspace/acme/inbox

Decision:
Allowed in personalized demo

Downstream:
Included in video scene 2
Included in CRM requirement record
Referenced in follow-up email
```

This makes the generated demo auditable instead of opaque.

---

## Reliability and Evaluation

The agent is evaluated on **outcomes and side effects**, not only generated text.

### Core evaluation cases

| Scenario | Expected behavior |
|---|---|
| Buyer requests a GA capability | Include it |
| Buyer requests a Roadmap capability | Exclude it and warn AE |
| Capability evidence is missing | Escalate for review |
| Buyer says “our VP may want to see this sometime” | Do not schedule |
| Buyer says “let’s get our VP on a technical call next week” | Prepare/schedule the next meeting |
| Existing meeting already exists | Do not create a duplicate |
| Walkthrough generation fails | Do not send the follow-up |
| Gmail send fails | Do not mark follow-up complete |
| CRM update fails after email send | Surface partial failure and retry/update separately |
| Prospect recipient is not verified | Block external send |
| Product docs contain conflicting capability status | Use authority rules or escalate |
| Prompt injection appears inside a source document | Ignore it as untrusted data |

### Example assertions

```text
assert unsupported_capability not in demo_plan
assert unsupported_capability not in customer_email
assert calendar_event_created == explicit_meeting_commitment
assert crm_followup_complete == gmail_send_succeeded
assert every_demo_scene.has_buyer_evidence
assert every_demo_scene.has_product_evidence
```

---

## Seeded Demo Data

### HubSpot

Create:

**Company**
- Acme Corp
- Industry: B2B SaaS
- Tier: Enterprise

**Deal**
- Name: Acme Platform Evaluation
- Amount: $250,000
- Stage: Discovery
- Owner: Sarah Lee

**Contacts**
- Jane Miller, Director of Engineering
- Maya Chen, VP Engineering

### Google Drive

Create a folder:

```text
/Product Knowledge
```

Add:

**Product Capability Matrix**
```text
Work intake / triage       GA
Cycles / sprint planning   GA
Pages / documentation      GA
Jira import                GA
SSO                        Enterprise GA
Advanced capacity planning Beta
SAP integration            Roadmap Q1 2027
Oracle Fusion              Not supported
```

**Customer Demo Policy**
```text
GA: may be demonstrated.
Beta: must be labeled beta and requires approval.
Roadmap: do not present as currently available.
Unsupported: do not demonstrate.
Unknown: require human confirmation.
```

### Plane

Create workspace:

```text
Acme Demo Environment
```

Projects:
- Platform
- Mobile
- Customer Requests

Issues:
- Enterprise SSO request
- CSV export performance regression
- Mobile offline mode
- Bulk user import
- Audit-log export

Cycle:
- Q4 Sprint 3

Pages:
- Intake & Triage Playbook
- Release Planning
- Authentication Architecture

### Slack

Create:

```text
#demo-approvals
```

The agent posts approval summaries here.

### Gmail

Use a test inbox you control as the prospect recipient.

Never send hackathon test messages to a real third party.

### Google Calendar

Use a test calendar or a dedicated `Demo` calendar.

---

## Suggested Repository Structure

```text
.
├── README.md
├── CLAUDE_BUILD_SPEC.md
├── .env.example
├── package.json
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── api/
│   │   ├── runs/
│   │   └── evals/
│   ├── agent/
│   │   ├── orchestrator.ts
│   │   ├── extractRequirements.ts
│   │   ├── verifyCapabilities.ts
│   │   ├── planDemo.ts
│   │   ├── requestApproval.ts
│   │   └── executeActions.ts
│   ├── connectors/
│   │   ├── hubspot.ts
│   │   ├── drive.ts
│   │   ├── plane.ts
│   │   ├── slack.ts
│   │   ├── gmail.ts
│   │   ├── calendar.ts
│   │   └── hyperframes.ts
│   ├── capture/
│   │   └── playwright.ts
│   ├── trace/
│   │   ├── schema.ts
│   │   └── store.ts
│   └── evals/
│       ├── scenarios/
│       └── runner.ts
├── scripts/
│   ├── seed-plane.ts
│   ├── seed-hubspot.ts
│   ├── seed-drive.ts
│   └── reset-demo.ts
├── data/
│   ├── transcripts/
│   │   └── acme-discovery.txt
│   ├── fixtures/
│   └── traces/
└── tests/
    └── evals/
```

---

## Local Setup

### 1. Install

```bash
npm install
npx playwright install chromium
```

### 2. Configure environment

Copy:

```bash
cp .env.example .env.local
```

Required configuration will include keys/tokens for the LLM provider and the external apps used in live mode.

Example:

```text
ANTHROPIC_API_KEY=

HUBSPOT_ACCESS_TOKEN=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=
GOOGLE_CALENDAR_ID=

PLANE_BASE_URL=
PLANE_API_KEY=
PLANE_WORKSPACE_ID=

SLACK_BOT_TOKEN=
SLACK_APP_TOKEN=
SLACK_CHANNEL_ID=

DEMO_PROSPECT_EMAIL=

HYPERFRAMES_CONFIG=
```

### 3. Seed the demo environment

```bash
npm run seed
```

The seed command should be idempotent and safe to run repeatedly.

### 4. Start the application

```bash
npm run dev
```

### 5. Run the main scenario

```bash
npm run demo:acme
```

### 6. Run evaluations

```bash
npm run eval
```

---

## Demo UI

The UI should make the agent’s work visible rather than hiding everything behind a chatbot.

One run should show:

1. Discovery transcript
2. Extracted requirements
3. CRM context
4. Capability verification table
5. Blocked/uncertain capabilities
6. Generated demo plan
7. Walkthrough preview
8. Slack approval state
9. External actions
10. Traceability/evidence
11. Evaluation results

---

## Two-Minute Demo Story

**0:00–0:12**

“Every enterprise discovery call is personalized. The demo that follows usually isn’t. Solutions Engineers spend hours translating buyer requirements into tailored product demos.”

Show Acme’s discovery-call request.

**0:12–0:32**

Show:

- $250k opportunity in CRM
- extracted requirements
- capability verification
- `SAP integration -> ROADMAP -> BLOCKED`

Say:

“Before generating anything, the agent verifies what we are actually allowed to demonstrate.”

**0:32–0:52**

Show the generated demo plan and the agent navigating the real product.

**0:52–1:17**

Play 15–20 seconds of the generated personalized walkthrough.

**1:17–1:37**

Show the Slack approval card. Approve it.

Then quickly show:

```text
Gmail       SENT ✓
Calendar    CREATED ✓
HubSpot     UPDATED ✓
```

**1:37–1:52**

Show one trace:

```text
Scene 2: Triage
Buyer evidence: transcript 08:42
Product evidence: Capability Matrix §3.1
Product route: /inbox
Status: GA
```

**1:52–2:00**

Show the eval summary:

```text
✓ unsupported capabilities blocked
✓ ambiguous meetings not scheduled
✓ failed videos block sending
✓ CRM only completes after successful actions
```

Close with:

> “We turn every discovery call into a verified, personalized product experience, then execute the next technical sales step.”

---

## Economic Value

The product targets repetitive Solutions Engineering and post-discovery work.

Instead of:

```text
Discovery
→ review notes
→ map requirements
→ check product support
→ prepare demo
→ record walkthrough
→ draft follow-up
→ schedule meeting
→ update CRM
```

the agent performs the repetitive work and leaves the human responsible for approval and higher-value technical conversations.

Potential business metrics:

- discovery-to-personalized-demo time
- Solutions Engineer preparation hours per opportunity
- opportunities supported per SE
- discovery-to-technical-demo conversion
- opportunity progression
- follow-up completion rate

The personalized video is the wedge. The broader product direction is an **AI Solutions Engineer** that handles repetitive technical work between discovery and close.

---

## Limitations

- The hackathon version uses one primary seeded product environment.
- Product capability truth is only as good as the connected source documents.
- Customer-facing actions require human approval.
- The agent should never autonomously invent product capabilities.
- The personalized walkthrough is not intended to replace complex live technical evaluations.

---

## Demo Video

Add the final public demo link here:

```text
DEMO_VIDEO_URL=
```

---

## Hackathon Summary

**Problem:** post-discovery technical sales work is slow and repetitive.

**Agent:** converts buyer intent into a verified personalized product walkthrough and executes the next step.

**Multi-app orchestration:** CRM + Drive + real product + video generation + Slack + Gmail + Calendar.

**Reliability:** unsupported capabilities are blocked, every scene is evidence-backed, side effects are verified, and failures do not silently advance the deal.

**Economic work:** automates repetitive Solutions Engineer preparation and sales follow-up.

**Differentiator:** the agent does not merely personalize content. It decides what is safe and relevant to demonstrate using both buyer intent and authoritative product truth.
