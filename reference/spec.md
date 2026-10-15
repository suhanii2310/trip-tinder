# Trip Tinder: Product Spec (Screens and Features)

Last updated: 2026-10-15. Destination for the demo build: **New York City** (an earlier draft used Lisbon).

## 1. Overview

Trip Tinder turns a group chat full of competing travel ideas into one shared plan in about two minutes. Everyone in the group swipes through places (things to do, food, hotels), and the app finds what the whole group likes and builds an itinerary from it.

**The problem.** Our 21 interviews showed that travelers connect everything themselves, need different help at different stages, and want less work, not more information. In a group this is worse: one organizer collects links, chases replies, and settles disagreements by hand.

**The idea.** Replace the debate with a swipe. Each person reacts to places on their own phone, at their own time, with no social pressure to agree out loud. The app does the merging.

**Who it is for.** First, groups of friends or family planning one trip together. Later, solo travelers who want fast picks matched to their taste. It received 27 votes at Maker Day 1.

**One-line pitch.** Swipe together, travel together.

## 2. Principles and scope

The demo builds one loop and does it well: start a trip, invite the group, swipe, see the shared plan.

**Design principles**

- **Less work, not more information.** Never show a long list when one card will do.
- **Swipe is the only decision.** No forms, ratings, or comments during the core loop.
- **No one waits on the organizer.** Members join with a link and can swipe immediately, with no account.
- **Everyone's taste counts.** The result must show that each person had a say.
- **Fast to value.** From opening the app to swiping takes under 30 seconds.

**In scope for the demo**

- One destination city, chosen from a short preset list (New York, plus placeholders)
- About 30 hand-picked places (attractions, food, hotels); the first build uses 10
- Create trip, invite link, swipe deck, live group progress, results, and a generated plan
- Mobile web, designed for a phone screen

**Out of scope for the demo**

- Booking, payments, and commission flows
- Accounts, passwords, and profiles beyond a display name
- Solo mode (described as a later phase)
- Native iOS/Android apps and app store release
- Real-time map routing and live opening hours

## 3. Users and roles

There are two roles in a trip, and the only difference is who set it up. A third role, the solo traveler, comes later.

| Role | Who | Can do | Cannot do |
| --- | --- | --- | --- |
| Organizer | The person who creates the trip | Pick destination and dates, set group size, invite members, start swiping, close swiping early, edit or regenerate the plan, share the plan | Swipe for other people |
| Member | Anyone who opens the invite link | Enter a name, swipe, see group progress, see results and plan, suggest a place to add | Change trip settings or regenerate the plan |
| Solo traveler (later) | One person, no group | Swipe alone, get a personal shortlist and plan | Group features |

**Example group used in the demo.** Maya (organizer), Dev, Priya, and Sam, planning a 3-day weekend in New York (Oct 24 to Oct 27). Maya wants food, Dev wants museums, Priya wants nightlife, and Sam wants to stay on a budget. This gives the matching real disagreement to resolve.

## 4. End-to-end journey

The whole experience runs in eight steps, from opening the app to a plan the group can share. The screen numbers (S1 to S12) match the next section.

1. **Land (S1).** The organizer opens the app and taps "Start a trip."
2. **Set up (S2, S3).** They enter a destination and dates, and choose which categories to swipe on.
3. **Invite (S4).** The app shows an invite link and a QR code. The organizer sends it to the group chat.
4. **Join (S5).** Each member opens the link, types a name, and lands in the trip lobby. No account is needed.
5. **Swipe (S6, S7).** Everyone swipes through the same deck at their own pace. Right means "I'd do this," left means "skip," and up means "must have."
6. **Watch progress (S8).** A progress screen shows who has finished. The organizer can close swiping early.
7. **See results (S9).** The app shows what everyone agreed on, then the near-misses and the split decisions.
8. **Get the plan (S10, S11, S12).** The AI builds a day-by-day itinerary. The group can swap places, then share or save the final plan.

**Where it can branch**

- A member joins after swiping has started: they get the full deck and the results update.
- Someone never finishes: after a set time, the app closes swiping and uses what it has.
- No place gets unanimous approval: the app shows the best compromises instead of an empty result.

## 5. Screen-by-screen spec

Twelve screens, designed for a 390 x 844 px phone. Every screen has one primary action, placed at the bottom within thumb reach.

### S1. Welcome

**Purpose:** explain the app in one glance and get the organizer started.

- Logo and tagline: "Swipe together, travel together."
- A looping 6-second preview of place cards being swiped
- Primary button: **Start a trip**
- Secondary link: "Have an invite link? Paste it here"
- Footer: a small "How it works" link opening a 3-step sheet (Swipe, Match, Go)

### S2. Trip basics

**Purpose:** collect the minimum needed to build a deck.

- Header: "Where are you headed?"
- Destination: a searchable list of preset cities, each with a photo tile (demo: New York, plus 2 backups)
- Dates: a start and end date picker, or "Not sure yet" (defaults to 3 days)
- Group size: a stepper from 2 to 12
- Primary button: **Next**, disabled until a destination is chosen

### S3. What should we swipe on?

**Purpose:** let the organizer choose the deck so it fits the trip.

- Three large toggle cards, all on by default: **Things to do**, **Food and drink**, **Places to stay**
- Under each toggle, a one-line preview ("Museums, viewpoints, walks, nightlife")
- An optional "Vibe" row of chips: Relaxed, Adventurous, Cultural, Foodie, Budget. Pick up to two.
- Primary button: **Create trip**

### S4. Invite the group

**Purpose:** get everyone in with as little friction as possible.

- Header: "Your trip is ready. Bring in the crew."
- A large invite link with a **Copy link** button, plus **Share** (opens the phone's share sheet)
- A QR code for in-person groups
- A live member list that fills as people join, with a checkmark and avatar color for each
- Primary button: **Start swiping** (the organizer can begin without waiting for everyone)

### S5. Join a trip (member view)

**Purpose:** get a member from link to first card in two taps.

- Header: "Maya invited you to New York, Oct 24-27"
- Shows the avatars of who has already joined
- One field: "What should we call you?" (pre-filled if the device remembers it)
- Primary button: **Join and swipe**
- No sign-up and no app install; it opens in the phone browser

### S6. Swipe deck

**Purpose:** the core of the product. One card at a time, one decision per card.

- **Card:** full-width photo, place name, category tag, a one-line description, price level ($ to $$$), and distance from the city center. Tapping the card flips it to show more (typical visit length, best time, tags).
- **Gestures:** swipe right = "I'd do this" (green stamp), swipe left = "Skip" (gray stamp), swipe up = "Must have" (gold star stamp).
- **Buttons below the card:** an X, a star, and a heart, for people who prefer tapping over swiping.
- **Top bar:** category tabs (Do, Eat, Stay) with a count of cards left in each, and a thin progress bar.
- **Undo:** a small back arrow restores the last card.
- **Stack hint:** the next card peeks out behind the current one.
- **Haptics and motion:** a light vibration on each swipe; cards fly off with a short spring animation.
- **Limit:** each person gets 15 cards per category in the full demo, which keeps swiping to about 2 minutes.

### S7. Category done

**Purpose:** reward finishing a deck and move to the next one.

- Short celebration animation and the line "Nice. 12 places you liked."
- A mini strip of the person's top 3 picks
- Primary button: **Next: Food and drink** (or **Finish** after the last category)

### S8. Group progress

**Purpose:** show the group moving together without revealing individual picks.

- A row of avatars, each with a ring showing percent of the deck finished
- Status text per person: "Done," "Swiping," or "Hasn't started"
- A **Nudge** button next to anyone who has not started, which sends a friendly reminder through the share sheet
- Organizer only: **See results now** (closes swiping early) and an auto-close timer, shown as "Results open in 23h"
- When everyone is done, the screen changes by itself to S9
- Swipes stay private here. Skips are never attributed to a person.

### S9. Group results

**Purpose:** show what the group agrees on, and make disagreements easy to settle.

- **Tab 1, Everyone loved it:** places every member swiped right or up on, ranked by how strongly (stars count extra). Each card shows the avatars of who liked it.
- **Tab 2, Almost there:** places liked by all but one person, without naming who skipped it, plus a one-tap "Vote again" to let the group re-decide.
- **Tab 3, Split picks:** places that divide the group, shown as "2 love it, 2 skip it," so the group knows where the real tension is.
- **Match meter** at the top: a single number showing how much the group agrees overall ("Your group is 78% aligned").
- Primary button: **Build our plan**

### S10. Generating the plan

**Purpose:** cover the 5 to 10 seconds of AI work without feeling slow.

- A simple animated sequence of status lines: "Putting the favorites on the map," "Spacing out the busy days," "Saving room for a long dinner"
- A preview of the cards sliding into a calendar grid
- Fails gracefully: if generation fails, show the saved results and a **Try again** button

### S11. Group plan

**Purpose:** the payoff screen. A usable day-by-day itinerary the group can follow.

- **Day tabs** across the top (Day 1, Day 2, Day 3), with a small map pin icon to switch to a map view
- **Timeline:** each day split into Morning, Afternoon, and Evening, with 1 to 3 places each. Every item shows photo, name, time estimate, travel time from the previous stop, and avatars of who picked it.
- **Stay card** pinned at the top: the group's top-rated hotel
- **Swap:** tapping an item opens a sheet of 3 alternatives from the "Almost there" and "Split picks" lists
- **Lock:** a lock icon freezes an item so Regenerate leaves it alone
- **Fairness bar:** a small summary like "Everyone got at least 3 picks," so no one feels ignored
- Primary button: **Share plan**. Secondary: **Regenerate** (organizer only)

### S12. Share and save

**Purpose:** get the plan out of the app and into the group chat.

- A preview of a clean shareable card with the trip name, dates, and top highlights
- Buttons: **Copy link**, **Share to chat**, **Save as PDF**, and **Add to calendar**
- A soft prompt after sharing: "Planning another trip? Start one."
- Later: a **Book these** button that links out to booking partners

### Cross-cutting UI elements

- **Bottom bar:** the primary action only. No tab bar, which keeps the flow linear.
- **Top bar:** back arrow, trip name, and a small avatar stack showing the group.
- **Trip menu (three dots):** trip details, invite link, leave trip, and a feedback link.
- **Loading states:** photo cards use blurred placeholders so the deck feels instant.
- **Offline:** swipes are saved on the device and sync when the connection returns.

## 6. Feature list

Features are grouped by when they ship. The demo covers every Must-have and a few Should-haves.

| Feature | What it does | Priority | Screen |
| --- | --- | --- | --- |
| Create a trip | Destination, dates, group size, categories | Must-have | S2, S3 |
| Invite link and QR | Join with no account | Must-have | S4, S5 |
| Swipe deck | Right, left, and up gestures plus tap buttons | Must-have | S6 |
| Undo last swipe | Fix a mistaken swipe | Must-have | S6 |
| Group progress | See who has finished | Must-have | S8 |
| Group results | Agreed, almost, and split lists | Must-have | S9 |
| AI group plan | Day-by-day itinerary from the group's picks | Must-have | S10, S11 |
| Share plan | Link and share sheet | Must-have | S12 |
| Nudge a member | Reminder to someone who has not swiped | Should-have | S8 |
| Swap and lock items | Edit the plan without redoing it | Should-have | S11 |
| Fairness bar | Shows everyone got picks in the plan | Should-have | S11 |
| Vibe chips | Steer the deck toward a mood | Should-have | S3 |
| Add to calendar and PDF | Take the plan with you | Should-have | S12 |
| Vote again on near-misses | Re-decide on almost-matches | Should-have | S9 |
| Suggest a place | Members add a place the deck missed | Later | S9 |
| Budget filter | Hide places above a group budget | Later | S3 |
| Booking links | Commission on hotels and tours | Later | S12 |
| Solo mode | Personal shortlist and plan | Later | New flow |
| Accounts and trip history | Save past trips and tastes | Later | New |
| Learning from taste | Improve decks from past swipes | Later | Deck |
| Real-time map and routing | Live travel times and open hours | Later | S11 |
| Business licensing | Offer the matching engine to travel companies | Later | API |

## 7. Matching logic

The matching is deliberately simple so the team can build it in a day and explain it in a sentence: a place is a group favorite when nobody skipped it, and ties go to the place people felt strongest about.

**Swipe values**

| Swipe | Meaning | Points |
| --- | --- | --- |
| Up (must have) | Strong yes | 3 |
| Right (I'd do this) | Yes | 1 |
| Not yet seen | Unknown | 0 |
| Left (skip) | No | 0, and counts as a skip |

**Sorting places into the three result lists**

1. Count each place's skips across all members who have swiped on it.
2. **Everyone loved it:** zero skips. Ranked by total points, then by the number of "must have" swipes.
3. **Almost there:** exactly one skip (groups of 3 or more). Ranked by total points.
4. **Split picks:** two or more skips, but at least one "must have" or two likes. Ranked by the gap between love and skip.
5. Places with no likes at all are dropped.

**Tie-breakers, in order**

1. More "must have" swipes
2. Better fit with the group's budget level (the average price tag of their likes)
3. Closer to the other top picks, so days are less spread out

**Rules for edge cases**

- **Unfinished members:** unseen cards count as 0, not as skips. Once swiping closes, results use what exists.
- **Late joiner:** gets the full deck. Results recalculate and the group is notified.
- **Group of 2:** there is no "Almost there" list; places with one skip go to Split picks.
- **Too few matches:** if fewer than 6 places land in Everyone loved it, the plan pulls from Almost there so the itinerary is never thin.
- **One person dominates with "must have":** each person's up-swipes are capped at 5 per category, which keeps one voice from outweighing the rest.

**Match meter.** The percent of (member, place) pairs that are not skips.

**Fairness check.** After the plan is built, the app confirms that every member has at least 3 of their own likes in it. If someone is under, the plan swaps in more of their picks from Almost there.

**Worked example (New York, 4 people)**

| Place | Maya | Dev | Priya | Sam | Skips | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Chelsea Market | Must | Like | Like | Like | 0 | Everyone loved it (6 pts) |
| Central Park walk | Like | Like | Like | Like | 0 | Everyone loved it (4 pts) |
| Jazz night in Greenwich Village | Like | Skip | Must | Like | 1 | Almost there |
| The Met | Skip | Must | Skip | Like | 2 | Split picks |

## 8. AI plan generation

The matching decides what the group wants. The AI only decides how to arrange it. This split matters: the picks come from real swipes, so the plan cannot invent places the group never saw.

**Inputs sent to the model**

- Trip: city, dates, number of days, group size
- The ranked lists from S9 (Everyone loved it, Almost there, Split picks), each place with its category, area, price level, typical visit length, and coordinates
- Constraints: at most 3 activities per day, one meal block per half-day, one hotel for the whole stay
- Fairness rule: every member must have at least 3 of their own likes in the plan

**Output format.** The model returns structured JSON, not free text, so the app can draw it: for each day, a list of slots (morning, afternoon, evening), each with a place id, a start time, a duration, and a one-sentence reason ("Close to your lunch spot, and Dev's top pick"). The app shows the reason on the card.

**Approach**

1. Group places by neighborhood so each day stays in one or two areas.
2. Put the highest-ranked places first, spread across days so Day 1 is not overloaded.
3. Put food near the activity it follows, and nightlife in the evening.
4. Fit the hotel to the area with the most picks.
5. Check the result in code (no duplicates, every id exists, fairness met) and retry once if it fails.

**Guardrails**

- The model may only use place ids from the input list.
- Travel times come from straight-line distance in the demo, labelled "approx."
- No claims about opening hours or prices beyond what is in our data.
- If the call fails or takes over 15 seconds, fall back to a simple rule-based plan that fills slots in rank order.
- Never show the model's raw text to the user.

## 9. Data model and content

The demo needs five tables. Everything else can wait.

| Entity | Key fields | Notes |
| --- | --- | --- |
| Trip | id, destination, start date, end date, group size, categories, vibes, status, invite code | Status: setup, swiping, results, planned |
| Member | id, trip id, display name, color, role, joined at, finished flag | No email or password in the demo |
| Place | id, name, category, area, lat, lng, price level, photo, short description, tags, visit minutes | Hand-curated for the demo |
| Swipe | id, trip id, member id, place id, value, timestamp | Value is up, right, or left; unique per member and place |
| Plan | id, trip id, version, days (JSON), locked items, created at | New version on each regenerate |

**Place content for the demo.** 30 places for New York, split into 12 things to do, 12 food and drink spots, and 6 hotels (the first build uses 10). Each needs a licensed or self-taken photo, a one-line description written by us, a price level, and coordinates.

**Where the data comes from**

- Names, coordinates, and categories: Google Places, checked by hand against each place.
- Photos: our own, or free-to-use sources; check licenses and keep a credits list.
- Descriptions and tags: written by the team, so the voice is consistent.

**Mix matters.** To make the matching interesting, the places should span tastes. About a third should be crowd-pleasers, a third should be niche (museums, nightlife, a long walk), and a third should be mid-range. That way the four example users disagree on some places and agree on others.

## 10. Notifications, empty states, and errors

The demo is a web app, so notifications are in-app banners plus messages the organizer sends through the share sheet. Push notifications come with the native app.

**Notifications**

| Moment | Who sees it | Message |
| --- | --- | --- |
| A member joins | Organizer | "Dev joined your New York trip." |
| A member finishes swiping | Everyone | "Priya is done. 2 of 4 finished." |
| Group is close to done | Anyone not finished | "Only Sam is left. Results open when he's done." |
| Results are ready | Everyone | "Your group is 78% aligned. See your matches." |
| Plan is ready | Everyone | "New York plan is ready." |
| Plan is edited | Everyone | "Maya swapped dinner on Day 2." |

**Empty and edge states**

| Situation | What the screen does |
| --- | --- |
| Nobody else has joined yet | S4 shows "You're the first one in" with a prompt to share the link |
| No place has unanimous approval | S9 opens on Almost there, with the line "No perfect matches, but these came close" |
| A member skips everything | Their swipes are kept but flagged, and the organizer is told they may want to re-swipe |
| Deck runs out early | S7 appears with the option to add another category |
| Invite link is wrong or expired | S5 shows "This trip isn't available" and a button to start a new one |
| Trip is full (12 people) | S5 shows "This trip is full. Ask the organizer to make room." |
| Plan generation fails | S10 shows results and **Try again**, then falls back to the rule-based plan |
| Photo fails to load | The card shows a colored category tile with an icon |
| No internet | A banner says "You're offline. Swipes will sync later." |

**Privacy.** Everyone can see who liked a place, but nobody can see who skipped it. Results show skip counts only, never names. The organizer can delete the trip at any time.

## 11. Visual design and brand

The look should feel playful and photo-first, closer to a good travel magazine than a booking site. Photos do the work, and the interface stays quiet around them.

**Tone.** Friendly, a little cheeky, never childish. Copy is short and speaks to the group ("Bring in the crew").

**Color**

| Role | Suggested value | Use |
| --- | --- | --- |
| Primary (coral) | #FF5A4F (buttons use the darker #D63D32 for text contrast) | Main buttons, the "like" stamp accents, logo |
| Must-have (gold) | #F2B84B | Star swipe, top-pick badges |
| Like (green) | #2FA66A | Right-swipe stamp, "everyone loved it" |
| Skip (gray) | #8A919C | Left-swipe stamp, skip counts |
| Background | #FBFBF8 | Screens, matching our team deck |
| Text | #1A1A1A | Body copy and headings |
| Member colors | 8 soft hues | One per person: avatar rings and "who liked this" dots |

**Type.** DM Sans, the same family used in the team deck. Headings 600 to 700 weight at 24 to 32 px, body 16 px, labels 13 px.

**Shape and spacing.** 16 px corner radius on cards, 24 px on the main swipe card, an 8 px spacing grid, and a bottom action bar at least 56 px tall for easy thumb reach.

**Motion**

- Cards follow the finger, tilt up to 12 degrees, and show a colored stamp as they cross the edge threshold.
- Cards that leave fly off in about 250 ms with a spring ease.
- Results cards stagger in from the bottom, 60 ms apart.
- The match meter fills up once on reveal.

**Core components**

- Swipe card with photo, tags, and flip side
- Stamp overlays (Like, Skip, Must have)
- Avatar stack and progress ring
- Match meter
- Result tabs
- Timeline item with swap and lock
- Bottom action bar and sheet

**Accessibility.** Every swipe has a button alternative. Text contrast meets WCAG AA. Color is never the only signal; stamps also carry words and icons. All tap targets are at least 44 px.

## 12. Demo build plan, success metrics, and open questions

The demo is done when four people can swipe on their own phones and get a believable shared plan in under three minutes, with a recorded backup in case the live run fails.

**Suggested stack (a starting point, the team's call)**

- Front end: a mobile web app (React or similar) with a swipe library for the card stack
- Back end and live sync: a hosted real-time database such as Firebase or Supabase, so swipes from several phones appear on all of them
- Matching: plain code on the server (section 7), no AI
- Plan: one call to a language model with structured output (section 8), plus the rule-based fallback
- Hosting: a free tier on a host with a public link, so testers can open it on any phone

**Success metrics for user testing**

- 4 of 5 testers complete the full flow with no help
- Time from link to first swipe under 30 seconds
- Time from first swipe to plan under 3 minutes for a group of 4
- At least 3 of 5 testers say the plan fits what their group would pick
- At least 3 of 5 say they would use it for a real trip

These map to the Value Creation Analysis: the first three show whether people will use it, and the plan quality shows whether we can make it.

**Open questions for the team**

- [ ] Does anyone on the team write code comfortably, or should we start with a Figma prototype?
- [ ] Should hotels be in the swipe deck for the demo, or only things to do and food?
- [ ] Is 15 cards per category the right limit, or should the deck be shorter?
- [ ] Do we call the swipe values "must have, like, skip," or use friendlier words?
- [ ] Who finds the five outside testers, and when?
- [ ] Which screens do we show in the next slide, and which only in the live demo?
