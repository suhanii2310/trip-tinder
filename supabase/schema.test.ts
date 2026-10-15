// Runs the real migration + seed in an in-memory Postgres (PGlite) set up like
// Supabase (anon/authenticated roles, auth.uid(), default grants), then checks
// the access rules from the browser's point of view.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

const MAYA = "00000000-0000-0000-0000-00000000000a";
const DEV = "00000000-0000-0000-0000-00000000000b";
const STRANGER = "00000000-0000-0000-0000-00000000000c";

const SUPABASE_SHIM = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth, public to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on functions to anon, authenticated;
`;

let db: PGlite;

// Runs fn as a browser session: `uid` signed in, or anon when uid is null.
async function as<T>(uid: string | null, fn: () => Promise<T>): Promise<T> {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid ?? ""]);
  await db.exec(`set role ${uid ? "authenticated" : "anon"}`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}
const one = async <T>(sql: string, params: unknown[] = []) =>
  (await db.query<T>(sql, params)).rows[0];
const all = async <T>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows;

let trip: { trip_id: string; member_id: string; invite_code: string };
let devMember: string;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_SHIM);
  await db.exec(readFileSync("supabase/migrations/0001_init.sql", "utf8"));
  await db.exec(readFileSync("supabase/seed.sql", "utf8"));

  trip = (
    await as(MAYA, () =>
      one<{ j: typeof trip }>(
        "select create_trip('New York', '2026-10-24', '2026-10-27', 2, '{do,eat,stay}', 'Maya') as j",
      ),
    )
  ).j;
  devMember = (
    await as(DEV, () => one<{ j: { member_id: string } }>("select join_trip($1, 'Dev') as j", [trip.invite_code]))
  ).j.member_id;
});

describe("trips and joining", () => {
  it("makes long random invite codes", () => {
    expect(trip.invite_code).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });

  it("hides the trip from people who have not joined", async () => {
    const rows = await as(STRANGER, () => all("select * from trips"));
    expect(rows).toHaveLength(0);
    const members = await as(STRANGER, () => all("select * from members"));
    expect(members).toHaveLength(0);
  });

  it("shows a preview to anyone with the invite code, signed in or not", async () => {
    const p = await as(null, () =>
      one<{ j: { destination: string; organizer: string } }>("select trip_preview($1) as j", [trip.invite_code]),
    );
    expect(p.j).toMatchObject({ destination: "New York", organizer: "Maya" });
    const wrong = await as(null, () => one<{ j: unknown }>("select trip_preview('nope') as j"));
    expect(wrong.j).toBeNull();
  });

  it("gives each member a different color and lets them see the group", async () => {
    const rows = await as(DEV, () => all<{ color: string }>("select color from members"));
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((r) => r.color)).size).toBe(2);
  });

  it("does not let a signed-out visitor create a trip", async () => {
    await expect(
      as(null, () => db.query("select create_trip('x', '2026-10-24', '2026-10-27', 2, '{do}', 'x')")),
    ).rejects.toThrow(/permission denied/);
  });

  it("does not let anyone write trips or members directly", async () => {
    await as(DEV, () => db.query("update trips set group_size = 12"));
    await as(DEV, () => db.query("update members set role = 'organizer'"));
    const t = await one<{ group_size: number }>("select group_size from trips");
    const roles = await all<{ role: string }>("select role from members order by role");
    expect(t.group_size).toBe(2);
    expect(roles.map((r) => r.role)).toEqual(["organizer", "member"]);
  });

  it("does not let the browser roles truncate tables", async () => {
    await expect(as(DEV, () => db.query("truncate swipes"))).rejects.toThrow(/permission denied/);
  });
});

describe("swipes stay private", () => {
  beforeAll(async () => {
    const swipe = (uid: string, member: string, place: string, value: string) =>
      as(uid, () =>
        db.query("insert into swipes (trip_id, member_id, place_id, value) values ($1, $2, $3, $4)", [
          trip.trip_id, member, place, value,
        ]),
      );
    await swipe(MAYA, trip.member_id, "chelsea-market", "must");
    await swipe(DEV, devMember, "chelsea-market", "like");
    await swipe(MAYA, trip.member_id, "the-met", "skip");
    await swipe(DEV, devMember, "the-met", "must");
  });

  it("lets a member read only their own swipes", async () => {
    const rows = await as(DEV, () => all<{ member_id: string }>("select member_id from swipes"));
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.member_id === devMember)).toBe(true);
  });

  it("does not let a member swipe for someone else", async () => {
    await expect(
      as(DEV, () =>
        db.query("insert into swipes (trip_id, member_id, place_id, value) values ($1, $2, 'high-line', 'like')", [
          trip.trip_id, trip.member_id,
        ]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("keeps a swipe count for progress, and undo lowers it", async () => {
    await as(DEV, () =>
      db.query("insert into swipes (trip_id, member_id, place_id, value) values ($1, $2, 'high-line', 'like')", [
        trip.trip_id, devMember,
      ]),
    );
    expect((await one<{ n: number }>("select swiped_count n from members where id = $1", [devMember])).n).toBe(3);
    await as(DEV, () => db.query("delete from swipes where place_id = 'high-line'"));
    expect((await one<{ n: number }>("select swiped_count n from members where id = $1", [devMember])).n).toBe(2);
  });

  it("keeps results closed while people are still swiping", async () => {
    await expect(as(DEV, () => db.query("select * from trip_tallies($1)", [trip.trip_id]))).rejects.toThrow(
      /results_not_open/,
    );
  });

  it("opens results when everyone has finished", async () => {
    await as(MAYA, () => db.query("select set_finished($1, true)", [trip.trip_id]));
    expect((await one<{ status: string }>("select status from trips")).status).toBe("swiping");
    await as(DEV, () => db.query("select set_finished($1, true)", [trip.trip_id]));
    expect((await one<{ status: string }>("select status from trips")).status).toBe("results");
  });

  it("names likers only on places nobody skipped", async () => {
    type Tally = { place_id: string; like_count: number; skip_count: number; liker_ids: string[] | null };
    const rows = await as(DEV, () => all<Tally>("select * from trip_tallies($1)", [trip.trip_id]));
    const byId = Object.fromEntries(rows.map((r) => [r.place_id, r]));
    expect(byId["chelsea-market"]).toMatchObject({ like_count: 2, skip_count: 0 });
    expect(byId["chelsea-market"].liker_ids).toHaveLength(2);
    expect(byId["the-met"]).toMatchObject({ like_count: 1, skip_count: 1, liker_ids: null });
  });

  it("refuses results to people outside the trip", async () => {
    await expect(as(STRANGER, () => db.query("select * from trip_tallies($1)", [trip.trip_id]))).rejects.toThrow(
      /not_a_member/,
    );
  });
});

describe("must-have cap", () => {
  it("allows at most 5 must-haves per category", async () => {
    for (let i = 1; i <= 6; i++) {
      await db.query(
        `insert into places (id, city, name, category, area, lat, lng, price, dist_km, description, art, color_from, color_to)
         values ($1, 'New York', $1, 'eat', 'x', 0, 0, 1, 0, 'x', 'bowl', '#000', '#000')`,
        [`test-eat-${i}`],
      );
    }
    const must = (n: number) =>
      as(DEV, () =>
        db.query("insert into swipes (trip_id, member_id, place_id, value) values ($1, $2, $3, 'must')", [
          trip.trip_id, devMember, `test-eat-${n}`,
        ]),
      );
    // Dev's only Eat swipe so far is a like, so five must-haves fit and the sixth fails.
    for (let i = 1; i <= 5; i++) await must(i);
    await expect(must(6)).rejects.toThrow(/must_have_limit/);
  });
});

describe("public plan page", () => {
  it("is readable with the share code but not the invite code", async () => {
    const t = await one<{ share_code: string }>("select share_code from trips");
    await db.query("insert into plans (trip_id, version, days, source) values ($1, 1, '[]', 'rules')", [trip.trip_id]);
    const ok = await as(null, () => one<{ j: { plan: { version: number } } }>("select public_plan($1) as j", [t.share_code]));
    expect(ok.j.plan.version).toBe(1);
    const no = await as(null, () => one<{ j: unknown }>("select public_plan($1) as j", [trip.invite_code]));
    expect(no.j).toBeNull();
  });

  it("does not let members write plans from the browser", async () => {
    await as(MAYA, () =>
      db.query("insert into plans (trip_id, version, days, source) values ($1, 2, '[]', 'rules')", [trip.trip_id]),
    ).catch(() => undefined);
    expect((await all("select * from plans")).length).toBe(1);
  });
});
