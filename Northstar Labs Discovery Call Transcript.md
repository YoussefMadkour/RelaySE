# Discovery Call: Northstar Labs × Flowboard

**Date:** September 10, 2026  
**Duration:** 27 minutes  
**Meeting type:** Initial product discovery  
**Opportunity:** Northstar Labs Platform Evaluation  
**Estimated deal value:** $250,000 ARR

## Participants

**Sarah Lee**  
Account Executive, Flowboard

**Daniel Brooks**  
Solutions Engineer, Flowboard

**Jane Miller**  
Director of Engineering, Northstar Labs

**Alex Morgan**  
Engineering Operations Manager, Northstar Labs

---

**[00:00] Sarah:**  
Hey Jane, hey Alex. Thanks for making the time. Can you both hear me okay?

**[00:05] Jane:**  
Yep, loud and clear.

**[00:07] Alex:**  
All good here.

**[00:09] Sarah:**  
Perfect. I know we have about half an hour, so I thought we'd spend most of today understanding how you're currently managing engineering work, where the pain points are, and what you're trying to change. Daniel is joining from our solutions team, so if anything technical comes up we can dig into it, but we're not planning to turn this into a full product demo today.

**[00:31] Jane:**  
Sounds good.

**[00:33] Sarah:**  
Maybe start with what prompted you to look at this now.

**[00:39] Jane:**  
The biggest issue is probably that we've grown pretty quickly. We were around 35 engineers at the beginning of last year and we're at just over 110 now.

A lot of the processes that worked when everybody knew everybody don't really work anymore.

**[00:58] Sarah:**  
What specifically has started breaking?

**[01:03] Jane:**  
Intake is probably number one.

Requests come from everywhere.

Customer Success will message somebody in Slack. Sales will email an engineer directly. Product has its own backlog. Sometimes someone mentions something in a meeting and then three weeks later asks why it hasn't been done.

There's no consistent front door.

**[01:27] Alex:**  
And we're spending a surprising amount of time just figuring out whether something is already being worked on.

We had an enterprise customer request an audit-log enhancement recently and I think it entered the organization three separate ways.

**[01:43] Daniel:**  
So when something new comes in today, is there an actual triage process?

**[01:49] Alex:**  
There is supposed to be.

**[01:51] Jane:**  
That's the diplomatic answer.

**[01:53] Alex:**  
Exactly.

Technically Product reviews requests once a week, but because requests aren't consistently captured, the meeting becomes people bringing things they've seen in Slack or email.

**[02:11] Sarah:**  
And what would the ideal version look like?

**[02:16] Jane:**  
I don't want another complicated process.

What I really want is one place where incoming engineering requests can be captured and triaged.

Then somebody should be able to look at it and say: this is urgent, this is duplicate, this belongs to Platform, this is something Product needs to investigate, whatever.

**[02:39] Alex:**  
Ownership is important too.

A lot of our problem isn't that nobody wants to do the work. It's that nobody knows who owns the request.

**[02:49] Daniel:**  
Would you want requests automatically routed, or is manual triage okay?

**[02:54] Jane:**  
Eventually automation would be nice, but honestly manual triage in one consistent place would already be a big improvement.

I wouldn't make automatic routing a hard requirement for this evaluation.

**[03:09] Sarah:**  
That's useful.

Once something has been triaged and accepted, what happens next?

**[03:15] Alex:**  
That's probably pain point number two.

Most teams operate in two-week sprints. Platform is a little different, but broadly that's how we plan.

There's a disconnect between the requests coming in and the actual planning process.

**[03:31] Jane:**  
Exactly.

We don't just need a better inbox.

I want to see how an approved request actually gets into the next sprint without losing all the context that came with it.

If the team accepts an enterprise request, I don't want somebody copying the title into another system and then losing the customer context.

**[03:54] Daniel:**  
So maintaining the relationship between intake, prioritization and execution matters.

**[03:59] Jane:**  
Yes. That's probably one of the main things I want to see.

**[04:05] Sarah:**  
How are you doing sprint planning currently?

**[04:09] Alex:**  
Different teams do it slightly differently.

Most have a backlog, then during planning they'll decide what moves into the next sprint based on priority and capacity.

We don't need some giant resource-management system. That's not what we're looking for.

We mainly need the workflow to be understandable.

**[04:29] Jane:**  
And visible.

Right now if I ask, “What happened to that request from Enterprise Customer X?” someone has to go investigate.

I'd rather be able to follow it.

**[04:43] Sarah:**  
Makes sense.

What else is creating friction?

**[04:48] Jane:**  
Documentation.

**[04:50] Alex:**  
Definitely documentation.

**[04:52] Jane:**  
We have specifications in different places. Some are in Google Docs. Some teams use Notion. There are architecture docs in Drive.

Then the actual implementation work lives separately.

**[05:08] Daniel:**  
Is the problem creating documentation, or keeping documentation connected to the work?

**[05:14] Jane:**  
More the second one.

I'm not looking for AI to write every specification for us.

I want the engineer looking at a piece of work to be able to understand why we're doing it and find the relevant product or technical context without searching through five systems.

**[05:34] Alex:**  
And vice versa.

If I'm reading a spec, it would be useful to understand what's actually happening with the implementation.

**[05:45] Sarah:**  
So if we summarize the first few things: consistent intake and triage, moving approved work into sprint planning while preserving context, and documentation connected to execution.

**[05:57] Jane:**  
Yes. Those are probably the three biggest workflow problems.

**[06:03] Sarah:**  
Okay. Are there systems we absolutely need to consider in the environment?

**[06:08] Jane:**  
Slack obviously.

Google Workspace.

GitHub.

And SAP is important for us at the company level.

**[06:18] Sarah:**  
Can you explain where SAP fits into this particular workflow?

**[06:23] Jane:**  
Not directly into engineering planning today.

We're doing a wider systems-consolidation project and SAP is becoming more important internally.

So integration is something our IT organization is going to ask about.

**[06:38] Alex:**  
Yeah, it's probably not something Jane or I would use every day.

**[06:43] Jane:**  
Correct. But before we buy another enterprise platform, I know I'm going to get asked, “What's the SAP story?”

So I definitely want to understand whether you integrate with SAP and what that looks like.

**[07:01] Daniel:**  
Got it. I don't want to give you an answer from memory and accidentally misrepresent it. I'll verify the current integration status before we show you anything there.

**[07:10] Jane:**  
Perfect. I'd rather get the accurate answer.

**[07:14] Sarah:**  
Anything else on integrations?

**[07:17] Alex:**  
Jira migration might come up because a couple teams still have historical issues there.

But that's more migration than ongoing integration.

**[07:27] Jane:**  
Yeah. That's useful but not a deal breaker.

**[07:32] Sarah:**  
How about GitHub? Would you expect commits and pull requests tied back to work items?

**[07:38] Alex:**  
Potentially.

I'd want our engineering leads to look at that in more detail.

**[07:44] Jane:**  
Same. I wouldn't make that the centerpiece of the next conversation.

**[07:50] Sarah:**  
Understood.

Let's talk about scale for a second. You said roughly 110 engineers. Who else would potentially use the system?

**[08:00] Jane:**  
Product is around 20 people.

Engineering management, obviously.

Potentially Customer Success for submitting requests, but I wouldn't necessarily give them access to everything.

**[08:13] Alex:**  
Probably 150 core users initially if we rolled it out broadly.

Could be more later.

**[08:20] Sarah:**  
Do permissions matter between teams?

**[08:23] Jane:**  
Yes.

Especially for security-related work and some enterprise customer issues.

Not everything should be visible to everyone.

**[08:32] Daniel:**  
Is SSO required?

**[08:35] Jane:**  
For production, yes.

**[08:37] Alex:**  
Definitely.

**[08:39] Jane:**  
We're on Okta.

**[08:41] Daniel:**  
Got it.

**[08:44] Sarah:**  
Any other security requirements that we should know about now?

**[08:48] Jane:**  
There will be a security review if we get far enough.

Our security team has their standard questionnaire.

Data residency might come up too, although I don't know the exact requirement off the top of my head.

**[09:03] Sarah:**  
That's fine. We can deal with that separately rather than guessing today.

**[09:09] Jane:**  
Exactly.

**[09:12] Sarah:**  
What are you using today for this overall workflow?

**[09:17] Jane:**  
A combination of Jira, Notion, Slack and Google Docs.

**[09:23] Alex:**  
Plus spreadsheets.

Don't forget the spreadsheets.

**[09:26] Jane:**  
Unfortunately, yes.

**[09:28] Sarah:**  
Everyone's favorite enterprise database.

**[09:31] Jane:**  
Exactly.

**[09:35] Sarah:**  
Are you actively trying to replace Jira?

**[09:39] Jane:**  
Potentially, but I wouldn't frame the project as “replace Jira at all costs.”

The bigger objective is getting control of the workflow.

If the best outcome involves migrating off Jira eventually, fine.

But if we start with one team and prove the intake-to-execution workflow first, that's probably more realistic.

**[10:03] Daniel:**  
Would Platform be the likely pilot?

**[10:06] Jane:**  
Probably Platform or one of our infrastructure teams.

**[10:11] Alex:**  
Platform has enough cross-functional requests that you'd see the problem pretty quickly.

**[10:18] Sarah:**  
What would make a pilot successful?

**[10:22] Jane:**  
That's a good question.

I think I'd want to see that requests actually get captured consistently.

I'd want fewer duplicate requests.

And I'd want managers to be able to understand what's happening without asking five people.

**[10:39] Alex:**  
I'd also measure how long something sits waiting for triage.

Today we don't really know.

**[10:47] Sarah:**  
So intake coverage, duplicate reduction, triage time, and visibility.

**[10:53] Jane:**  
Yes.

I'm less interested in some abstract productivity score.

**[10:58] Sarah:**  
Fair.

What does the buying process look like from here?

**[11:04] Jane:**  
I'm leading the evaluation from Engineering.

Alex is helping me with the workflow side.

If we think there's a fit, Maya, our VP Engineering, needs to be comfortable with it.

Then Security and IT would get involved.

Procurement obviously comes later.

**[11:21] Sarah:**  
Is Maya the economic buyer?

**[11:24] Jane:**  
For this size of project she'd be one of the main approvers.

Our CTO may ultimately sign off depending on the commercial structure.

But Maya is the person I need convinced technically first.

**[11:40] Sarah:**  
And what does she care about most?

**[11:44] Jane:**  
Visibility and adoption.

She's skeptical of tools that require engineering teams to spend half their life maintaining the tool.

She'll want to understand whether this actually simplifies things.

**[11:59] Alex:**  
She'll probably ask about reporting too.

Not because she wants fifty dashboards, but she wants to see bottlenecks.

**[12:07] Jane:**  
Yeah.

Something like where requests are getting stuck would be useful.

**[12:14] Sarah:**  
Is reporting something you'd like us to show next time?

**[12:18] Jane:**  
Maybe briefly.

I wouldn't spend half the demo on analytics.

The workflow is much more important.

**[12:25] Sarah:**  
That's helpful.

Timeline-wise, when are you hoping to make a decision?

**[12:31] Jane:**  
We'd like to choose a direction this quarter.

I don't think we'd roll all 150 users out immediately.

Realistically we'd pilot first.

**[12:43] Alex:**  
Probably four to six weeks for a pilot if we decide to proceed.

**[12:49] Sarah:**  
And is there a budget already allocated?

**[12:52] Jane:**  
There is budget for engineering tooling, but I'm not going to pretend I have a final number approved today.

We've spent enough on the current stack that this isn't a “find the cheapest possible tool” exercise.

We need to justify the value.

**[13:12] Sarah:**  
Totally fair.

Anything that would immediately disqualify a vendor?

**[13:18] Jane:**  
No SSO would be a problem.

Security obviously.

And if the tool is so complicated that every team needs an administrator, that's probably a nonstarter.

**[13:31] Alex:**  
Migration matters too.

If moving historical data becomes a six-month consulting project, that's not attractive.

**[13:40] Sarah:**  
Understood.

Daniel, anything you want to dig into before we talk about next steps?

**[13:47] Daniel:**  
One thing.

Jane, when you say you want documentation connected to execution, would you need to migrate all of your existing Google Docs and Notion content immediately?

**[13:57] Jane:**  
No.

Actually, I wouldn't want that.

For a pilot, I'd rather take a small number of current specs and prove the workflow.

Trying to migrate years of documentation before we know we like the product would be crazy.

**[14:13] Daniel:**  
Great. That's much easier to validate.

And on sprint planning, do you need detailed individual capacity calculations?

**[14:22] Alex:**  
Not for the initial evaluation.

**[14:24] Jane:**  
No.

Seeing the basic flow from approved request into a planned cycle is enough for the next demo.

Capacity planning is something we could explore later.

**[14:37] Daniel:**  
Perfect.

**[14:40] Sarah:**  
Let me play back what I'm hearing, and tell me if I've got anything wrong.

The immediate problem isn't simply project management. It's that requests enter Northstar through multiple channels, there isn't a consistent triage process, and context gets lost between the original request and sprint execution.

You'd like to see a workflow where a request comes in, gets triaged and prioritized, moves into a planned engineering cycle, and retains the relevant product documentation.

You also want us to verify the SAP integration story rather than assume anything.

SSO matters for production, Jira migration is useful but secondary, and reporting is worth touching on but shouldn't dominate the next demo.

Is that accurate?

**[15:28] Jane:**  
That's a very good summary.

**[15:31] Alex:**  
Yep.

**[15:34] Sarah:**  
Great.

Would it make sense for the next step to be a technical workflow demo rather than another discovery conversation?

**[15:42] Jane:**  
Yes.

That's exactly what I'd prefer.

**[15:46] Sarah:**  
And should we bring Maya into that one?

**[15:49] Jane:**  
Yes. Let's get Maya involved.

If you can show the intake-to-sprint workflow clearly, that's what I want her to see.

**[15:59] Sarah:**  
Anything else specifically for Maya?

**[16:02] Jane:**  
Keep it practical.

Don't give her twenty minutes of slides.

Show the workflow.

Show that the team isn't going to spend all day administering it.

Maybe touch on visibility at the end.

**[16:16] Sarah:**  
Works for me.

When next week tends to be easiest?

**[16:20] Jane:**  
Tuesday or Wednesday afternoon is usually better.

**[16:25] Alex:**  
Wednesday is better for me.

**[16:28] Jane:**  
Let's aim for Wednesday afternoon then.

I need to check Maya's calendar, but if you send something over we can move it if needed.

**[16:38] Sarah:**  
Great. We'll propose Wednesday afternoon and include Maya.

**[16:44] Jane:**  
Perfect.

**[16:47] Sarah:**  
Before that meeting, would it be useful if we sent you a short walkthrough focused specifically on the workflow we discussed today?

Not a generic overview, just intake, triage, planning and documentation.

**[17:00] Jane:**  
Actually, yes.

That would be useful because I can forward it to Maya before the call.

**[17:06] Alex:**  
Agreed.

**[17:08] Jane:**  
If it's short.

**[17:10] Sarah:**  
Very short.

**[17:12] Jane:**  
Then absolutely.

**[17:16] Daniel:**  
And we'll verify SAP separately before making any claims about it.

**[17:21] Jane:**  
Please do.

If it's not something you support today, that's okay. I just need to know that rather than seeing something in a demo that turns out to be roadmap.

**[17:33] Daniel:**  
Completely agree.

**[17:37] Sarah:**  
Perfect. So from our side we'll send the tailored workflow walkthrough, verify SAP status, and propose Wednesday afternoon for the technical session with Maya.

**[17:48] Jane:**  
Sounds good.

**[17:50] Sarah:**  
Anything we've missed?

**[17:53] Alex:**  
Nothing from me.

**[17:55] Jane:**  
No. I think that's enough homework for you.

**[17:58] Sarah:**  
We'll take it.

Thanks both. This was really helpful.

**[18:03] Jane:**  
Thanks Sarah. Thanks Daniel.

**[18:05] Alex:**  
Thanks guys.

**[18:07] Daniel:**  
Thanks. Talk soon.

**[18:09] Meeting ended.**