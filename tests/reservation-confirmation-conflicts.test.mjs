import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql=readFileSync(new URL("../supabase/migrations/202609100041_safe_confirmation_conflicts.sql",import.meta.url),"utf8");

test("une réservation en attente peut être confirmée sans être détectée comme conflit avec elle-même",()=>{
  assert.match(sql,/id<>p_reservation_id/);
  assert.match(sql,/not\(source='direct' and external_uid=p_reservation_id::text\)/);
  assert.match(sql,/status <> 'pending_payment'/);
});

test("une réservation ne peut pas être confirmée si une autre réservation confirmée chevauche réellement les mêmes dates",()=>{
  assert.match(sql,/check_in<v_reservation\.check_out and check_out>v_reservation\.check_in/);
  assert.match(sql,/status='confirmed'/);
  assert.match(sql,/raise exception 'DATES_UNAVAILABLE\|%\|%\|%'/);
});
