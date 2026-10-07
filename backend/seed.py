"""Deterministic seed data for the Fireflies Clone workspace."""

from datetime import datetime

from sqlalchemy import func, select

from app.database import SessionLocal, init_db
from app.models import ActionItem, Chapter, Meeting, TranscriptSegment

SEED_MEETINGS: list[dict] = [
    {
        "title": "Q4 Product Planning — Analytics Hub",
        "meeting_date": datetime(2026, 9, 18, 15, 0),
        "duration_seconds": 2700,
        "participants": ["Priya Mehta", "Jordan Hale", "Sam Ortiz", "Aisha Rahman", "Chris Lang"],
        "summary": (
            "The product team aligned on shipping Analytics Hub in Q4. Scope includes a meetings "
            "dashboard, saved views, and export. Search and sharing slip to January. Priya owns "
            "the PRD rewrite; Jordan will cut two mid-priority tickets from the current sprint."
        ),
        "transcript_segments": [
            (0, 12.0, "Priya Mehta", "Thanks everyone. Goal today is a locked Q4 scope for Analytics Hub."),
            (1, 95.0, "Jordan Hale", "Engineering can land dashboard and saved views by mid-November if we drop sharing."),
            (2, 210.0, "Sam Ortiz", "Design already has a prototype for the meetings list. Filters are the risky piece."),
            (3, 420.0, "Aisha Rahman", "Customer advisory board ranked search above sharing. I agree we should sequence it later."),
            (4, 680.0, "Chris Lang", "Sales needs a one-pager they can send after demos. That can be a Notion page, not product."),
            (5, 980.0, "Priya Mehta", "Decision: dashboard, saved views, CSV export in Q4. Search and sharing in January."),
            (6, 1320.0, "Jordan Hale", "I will remove the sharing epic and the advanced filter ticket from sprint 42."),
            (7, 1680.0, "Sam Ortiz", "I will update the IA so export sits in the meeting header, not a buried menu."),
            (8, 2100.0, "Aisha Rahman", "I will collect three customer clips that justify delaying search."),
            (9, 2460.0, "Priya Mehta", "PRD v3 by Friday. We reconvene next Thursday to review estimates."),
        ],
        "action_items": [
            ("Rewrite Analytics Hub PRD v3 with Q4 cuts", "Priya Mehta", datetime(2026, 9, 22, 17, 0), False),
            ("Remove sharing epic and advanced filter from sprint 42", "Jordan Hale", datetime(2026, 9, 19, 17, 0), False),
            ("Collect three customer clips supporting delayed search", "Aisha Rahman", datetime(2026, 9, 25, 17, 0), False),
        ],
        "chapters": [
            (0.0, "Kickoff and Q4 goals", "Priya frames the Analytics Hub decision.", ["roadmap", "scope"]),
            (420.0, "Customer ranking", "Advisory board input on search vs sharing.", ["research", "prioritization"]),
            (980.0, "Scope lock", "Q4 includes dashboard, saved views, and export.", ["decision"]),
            (2100.0, "Owners and follow-ups", "PRD, sprint cuts, and customer clips.", ["action-items"]),
        ],
    },
    {
        "title": "Engineering Standup — Oct 6",
        "meeting_date": datetime(2026, 10, 6, 10, 15),
        "duration_seconds": 900,
        "participants": ["Jordan Hale", "Maya Chen", "Luis Romero", "Nina Patel"],
        "summary": (
            "Standup covered API pagination, a flaky transcript test, and the SQLite seed path. "
            "Maya unblocked the meetings list endpoint. Luis will fix the test isolation issue "
            "before noon. No production incidents overnight."
        ),
        "transcript_segments": [
            (0, 8.0, "Jordan Hale", "Any blockers before we go around? Overnight was quiet."),
            (1, 55.0, "Maya Chen", "Meetings list is up. I still need to add participant filter tests."),
            (2, 140.0, "Luis Romero", "Transcript order test is flaky when seed runs twice in the same process."),
            (3, 260.0, "Nina Patel", "Chapters endpoint is done. Waiting on Maya's pagination contract."),
            (4, 410.0, "Jordan Hale", "Maya, ship participant filter today. Luis, isolate seed in a temp DB."),
            (5, 560.0, "Maya Chen", "I will pair with Nina after this so the query params match."),
            (6, 700.0, "Luis Romero", "I will have the flake fix up before lunch."),
            (7, 820.0, "Jordan Hale", "Great. No deploy today unless the flake is merged."),
        ],
        "action_items": [
            ("Add participant filter tests to meetings list", "Maya Chen", datetime(2026, 10, 6, 17, 0), False),
            ("Isolate seed data in a temp SQLite database for tests", "Luis Romero", datetime(2026, 10, 6, 12, 0), False),
        ],
        "chapters": [
            (0.0, "Status round", "API, tests, and chapters progress.", ["standup"]),
            (410.0, "Assignments", "Participant filter and flake fix owners.", ["blockers"]),
            (700.0, "Close", "No production deploy unless tests are green.", ["process"]),
        ],
    },
    {
        "title": "Northwind Renewal — Implementation Review",
        "meeting_date": datetime(2026, 9, 29, 14, 30),
        "duration_seconds": 3600,
        "participants": ["Chris Lang", "Priya Mehta", "Elena Voss", "Tom Bradley", "Ravi Kapoor"],
        "summary": (
            "Northwind wants SSO and a dedicated workspace before they sign the 80-seat renewal. "
            "Elena confirmed IT can complete SAML by October 20 if we send the metadata this week. "
            "Chris will send a revised timeline and a 10% multi-year discount option."
        ),
        "transcript_segments": [
            (0, 20.0, "Chris Lang", "Thanks Elena and Tom. We are here to unblock the Northwind renewal."),
            (1, 180.0, "Elena Voss", "IT will not sign without SAML. SCIM can follow 30 days later."),
            (2, 360.0, "Tom Bradley", "Legal also wants a DPA addendum for EU support agents."),
            (3, 620.0, "Priya Mehta", "SSO is already on the Q4 platform board. We can prioritize Northwind."),
            (4, 900.0, "Ravi Kapoor", "Metadata and ACS URLs can go out Thursday if security reviews the cert."),
            (5, 1180.0, "Elena Voss", "October 20 is realistic if we get the XML this week and a sandbox tenant."),
            (6, 1500.0, "Chris Lang", "We can include a dedicated workspace and a named CSM in the renewal."),
            (7, 1860.0, "Tom Bradley", "If you offer a two-year term we can probably move faster on legal."),
            (8, 2220.0, "Priya Mehta", "Product will not custom-build reporting. Saved views should cover their ask."),
            (9, 2680.0, "Ravi Kapoor", "I will schedule a 30-minute IT sandbox walkthrough next Tuesday."),
            (10, 3100.0, "Chris Lang", "I will send a written plan today: SSO date, workspace, and pricing options."),
            (11, 3420.0, "Elena Voss", "That works. I will loop procurement once the SAML date is in writing."),
        ],
        "action_items": [
            ("Send SAML metadata and ACS URLs to Northwind IT", "Ravi Kapoor", datetime(2026, 10, 1, 17, 0), False),
            ("Email written SSO timeline and pricing options", "Chris Lang", datetime(2026, 9, 29, 18, 0), False),
            ("Schedule IT sandbox walkthrough", "Ravi Kapoor", datetime(2026, 10, 6, 17, 0), False),
            ("Draft DPA addendum language for EU support agents", "Tom Bradley", datetime(2026, 10, 8, 17, 0), False),
        ],
        "chapters": [
            (0.0, "Renewal blockers", "SSO and DPA requirements from Northwind.", ["enterprise", "sso"]),
            (900.0, "SAML timeline", "Metadata this week, target October 20.", ["security"]),
            (1860.0, "Commercial terms", "Dedicated workspace and multi-year option.", ["sales"]),
            (3100.0, "Written plan", "Chris owns the follow-up email.", ["next-steps"]),
        ],
    },
    {
        "title": "Fall Campaign Kickoff — Product-Led Growth",
        "meeting_date": datetime(2026, 9, 23, 11, 0),
        "duration_seconds": 2400,
        "participants": ["Aisha Rahman", "Chris Lang", "Sam Ortiz", "Kim Alvarez", "Diego Santos"],
        "summary": (
            "Marketing locked a six-week PLG campaign around meeting summaries and action items. "
            "Launch is October 14. Kim owns the landing page; Diego owns lifecycle email. Paid "
            "social waits until the product GIF is final. Sales enablement one-pager is due October 10."
        ),
        "transcript_segments": [
            (0, 15.0, "Aisha Rahman", "Campaign thesis: teams already record meetings; we help them leave with owners."),
            (1, 160.0, "Kim Alvarez", "Landing page can ship October 10 if copy is frozen this Friday."),
            (2, 340.0, "Diego Santos", "Three-email nurture: value, social proof, then trial reminder."),
            (3, 560.0, "Sam Ortiz", "I can deliver a 12-second product GIF by October 3 if we pick one workflow."),
            (4, 820.0, "Chris Lang", "Sales wants a one-pager that maps objections to the campaign story."),
            (5, 1100.0, "Aisha Rahman", "Primary CTA is start free trial. Secondary is watch a 90-second demo."),
            (6, 1480.0, "Kim Alvarez", "We should not split-test pricing on the first wave. Keep annual highlighted."),
            (7, 1820.0, "Diego Santos", "I will pause paid social until the GIF is in the ad account."),
            (8, 2160.0, "Aisha Rahman", "Launch date is October 14. Standup Tuesdays until then."),
        ],
        "action_items": [
            ("Freeze campaign copy for the landing page", "Aisha Rahman", datetime(2026, 9, 26, 17, 0), False),
            ("Deliver 12-second product GIF of action items workflow", "Sam Ortiz", datetime(2026, 10, 3, 17, 0), False),
            ("Write sales enablement one-pager for the PLG campaign", "Chris Lang", datetime(2026, 10, 10, 17, 0), False),
        ],
        "chapters": [
            (0.0, "Campaign thesis", "PLG story around summaries and owners.", ["marketing", "plg"]),
            (560.0, "Creative and web", "Landing page, GIF, and email sequence.", ["content"]),
            (1820.0, "Launch plan", "October 14 launch and weekly standups.", ["timeline"]),
        ],
    },
    {
        "title": "Sprint 42 Planning",
        "meeting_date": datetime(2026, 10, 2, 16, 0),
        "duration_seconds": 3300,
        "participants": ["Jordan Hale", "Maya Chen", "Luis Romero", "Nina Patel", "Priya Mehta", "Sam Ortiz"],
        "summary": (
            "Sprint 42 capacity is 48 points. Committed work is meetings CRUD, transcript API, "
            "and seed data. Analytics charts stay in the icebox. Priya clarified that nested "
            "meeting create is nice-to-have. Design will pair on empty states Thursday."
        ),
        "transcript_segments": [
            (0, 18.0, "Jordan Hale", "Velocity last sprint was 44. I am planning 48 with Maya back from leave."),
            (1, 140.0, "Priya Mehta", "Must-haves: list, detail, create, update, delete meetings. Nested create is extra."),
            (2, 320.0, "Maya Chen", "List filters are mostly done. I need a day for date range and sort."),
            (3, 540.0, "Luis Romero", "Seed script should be idempotent. I will guard on existing meeting count."),
            (4, 760.0, "Nina Patel", "Chapters and action items can ride on the meeting detail payload plus dedicated GETs."),
            (5, 1040.0, "Sam Ortiz", "Empty states for zero meetings and zero action items. I will mock those Thursday."),
            (6, 1380.0, "Jordan Hale", "Analytics charts are out. Do not pull them in mid-sprint."),
            (7, 1720.0, "Maya Chen", "I will take list plus search. Luis takes seed and delete cascade tests."),
            (8, 2100.0, "Nina Patel", "I will take action item write endpoints and 404 cases."),
            (9, 2520.0, "Priya Mehta", "Acceptance: six seeded meetings, searchable, and detail includes transcript."),
            (10, 3000.0, "Jordan Hale", "Sprint goal: a trustworthy meetings API the frontend can bind to in Phase 3."),
        ],
        "action_items": [
            ("Finish date range and sort on GET /api/meetings", "Maya Chen", datetime(2026, 10, 7, 17, 0), False),
            ("Make seed.py idempotent and document counts", "Luis Romero", datetime(2026, 10, 4, 17, 0), True),
            ("Implement action item create/update/delete with 404s", "Nina Patel", datetime(2026, 10, 8, 17, 0), False),
            ("Mock empty states for meetings and action items", "Sam Ortiz", datetime(2026, 10, 8, 17, 0), False),
        ],
        "chapters": [
            (0.0, "Capacity", "48 points planned for sprint 42.", ["sprint", "planning"]),
            (320.0, "Must-haves", "Meetings CRUD, transcript, seed.", ["scope"]),
            (1380.0, "Cuts", "Analytics charts remain in icebox.", ["priority"]),
            (2520.0, "Acceptance", "Six meetings and a frontend-ready API.", ["goals"]),
        ],
    },
    {
        "title": "Staff Engineer Loop Debrief — Candidate A. Raman",
        "meeting_date": datetime(2026, 10, 1, 13, 0),
        "duration_seconds": 2100,
        "participants": ["Jordan Hale", "Priya Mehta", "Maya Chen", "Helen Cho"],
        "summary": (
            "The panel is a yes on Arun Raman for Staff Engineer, Backend. System design was "
            "strong on data modeling and cascade deletes. Maya flagged a thin take on observability. "
            "Helen will send a verbal offer contingent on references. Level is Staff, not Principal."
        ),
        "transcript_segments": [
            (0, 22.0, "Helen Cho", "Quick debrief on Arun Raman. I need a hire / no-hire and a level."),
            (1, 160.0, "Jordan Hale", "Hire. The SQLite plus SQLAlchemy design was practical, not hand-wavy."),
            (2, 380.0, "Maya Chen", "Hire, Staff. He was light on tracing and SLOs but recovered when I pushed."),
            (3, 640.0, "Priya Mehta", "Product sense was good. He asked about empty states and search ranking."),
            (4, 980.0, "Helen Cho", "Any reason this is Principal? Compensation band is already tight."),
            (5, 1280.0, "Jordan Hale", "Staff. Principal would need a clearer multi-team operating model."),
            (6, 1680.0, "Helen Cho", "I will check two references tomorrow and send a verbal if they clear."),
        ],
        "action_items": [
            ("Complete two backchannel references for Arun Raman", "Helen Cho", datetime(2026, 10, 2, 17, 0), False),
            ("Write Staff-level scorecard notes in Greenhouse", "Jordan Hale", datetime(2026, 10, 1, 18, 0), True),
            ("Share observability follow-up questions if we hire", "Maya Chen", datetime(2026, 10, 9, 17, 0), False),
        ],
        "chapters": [
            (0.0, "Signals", "System design, product sense, observability gap.", ["hiring", "interview"]),
            (980.0, "Level and offer", "Staff yes, Principal no. References next.", ["leveling"]),
        ],
    },
]


def _build_meeting(payload: dict) -> Meeting:
    return Meeting(
        title=payload["title"],
        meeting_date=payload["meeting_date"],
        duration_seconds=payload["duration_seconds"],
        participants=payload["participants"],
        summary=payload["summary"],
        transcript_segments=[
            TranscriptSegment(
                sequence=sequence,
                timestamp_seconds=timestamp_seconds,
                speaker=speaker,
                text=text,
            )
            for sequence, timestamp_seconds, speaker, text in payload["transcript_segments"]
        ],
        action_items=[
            ActionItem(
                task=task,
                assignee=assignee,
                due_date=due_date,
                completed=completed,
            )
            for task, assignee, due_date, completed in payload["action_items"]
        ],
        chapters=[
            Chapter(
                start_time_seconds=start_time_seconds,
                title=title,
                description=description,
                keywords=keywords,
            )
            for start_time_seconds, title, description, keywords in payload["chapters"]
        ],
    )


def seed(db=None) -> dict[str, int]:
    init_db()
    owns_session = db is None
    session = db or SessionLocal()
    try:
        existing = session.scalar(select(func.count(Meeting.id))) or 0
        if existing > 0:
            transcript_count = session.scalar(select(func.count(TranscriptSegment.id))) or 0
            action_count = session.scalar(select(func.count(ActionItem.id))) or 0
            chapter_count = session.scalar(select(func.count(Chapter.id))) or 0
            print("Seed skipped. Meetings already exist.")
            print(f"Meetings: {existing}")
            print(f"Transcript segments: {transcript_count}")
            print(f"Action items: {action_count}")
            print(f"Chapters: {chapter_count}")
            return {
                "meetings": existing,
                "transcript_segments": transcript_count,
                "action_items": action_count,
                "chapters": chapter_count,
                "inserted": 0,
            }

        for payload in SEED_MEETINGS:
            session.add(_build_meeting(payload))
        session.commit()

        meetings = session.scalar(select(func.count(Meeting.id))) or 0
        transcript_count = session.scalar(select(func.count(TranscriptSegment.id))) or 0
        action_count = session.scalar(select(func.count(ActionItem.id))) or 0
        chapter_count = session.scalar(select(func.count(Chapter.id))) or 0

        print("Seed completed.")
        print(f"Meetings: {meetings}")
        print(f"Transcript segments: {transcript_count}")
        print(f"Action items: {action_count}")
        print(f"Chapters: {chapter_count}")
        return {
            "meetings": meetings,
            "transcript_segments": transcript_count,
            "action_items": action_count,
            "chapters": chapter_count,
            "inserted": meetings,
        }
    finally:
        if owns_session:
            session.close()


def main() -> None:
    seed()


if __name__ == "__main__":
    main()
