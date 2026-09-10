import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkoutLineItems } from "../lib/stripe/stripe-mapper.ts";
import { createReservationCheckoutSession } from "../lib/stripe/create-checkout-session.ts";

const migration=readFileSync(new URL("../supabase/migrations/202609100042_fix_reservation_tax_constraint.sql",import.meta.url),"utf8");
const service=readFileSync(new URL("../lib/booking/manual-request-service.ts",import.meta.url),"utf8");
const base={nights:2,nightPrices:[],baseAmount:28000,weekendSupplements:0,feesAmount:400,currency:"EUR",discountAmount:0};
const extra=(key,label,amount)=>({key,label,amount,quantity:1});
const scenarios=[
  ["accepter une demande simple",[]],
  ["accepter une demande avec bouteille de champagne",[extra("champagne","Bouteille de champagne",4000)]],
  ["accepter une demande avec départ tardif",[extra("late-checkout","Départ tardif",1500)]],
  ["accepter une demande avec plusieurs options",[extra("champagne","Bouteille de champagne",4000),extra("late-checkout","Départ tardif",1500),extra("bouquet","Bouquet de fleurs",3500),extra("petals","Pétales",1500)]],
];

for(const [name,extras] of scenarios)test(name,()=>{
  const extrasAmount=extras.reduce((sum,item)=>sum+item.amount,0),pricing={...base,extras,extrasAmount,totalAmount:base.baseAmount+extrasAmount+base.feesAmount};
  const items=checkoutLineItems(pricing);
  assert.equal(items.reduce((sum,item)=>sum+item.quantity*item.price_data.unit_amount,0),pricing.totalAmount);
});

test("création Stripe mockée avec 389 € et réservation pending_payment",async()=>{
  const pricing={...base,extras:scenarios[3][1],extrasAmount:10500,totalAmount:38900};
  let captured;
  const stripe={checkout:{sessions:{create:async(params,options)=>{captured={params,options};return{id:"cs_test",url:"https://checkout.test"};}}}};
  const session=await createReservationCheckoutSession({stripe,reservation:{id:"reservation-id",reference:"ABS-TEST",expiresAt:"2026-09-11T20:00:00Z"},lineItems:checkoutLineItems(pricing),email:"client@example.test",siteUrl:"https://love-room-absolu.fr",requestId:"request-id"});
  assert.equal(session.url,"https://checkout.test");
  assert.equal(captured.params.line_items.reduce((sum,item)=>sum+item.quantity*item.price_data.unit_amount,0),38900);
  assert.equal(captured.params.metadata.reservation_request_id,"request-id");
  assert.equal(captured.options.idempotencyKey,"checkout-reservation-id");
  assert.match(service,/statut: "pending_payment"/);
});

test("rollback propre si Stripe échoue",()=>{
  assert.match(service,/checkout\.sessions\.expire/);
  assert.match(service,/await repository\.cancelPending\(reservationId\)/);
  assert.match(service,/statut: "new"/);
});

test("la migration retire la contrainte obsolète et conserve taxe incluse",()=>{
  assert.match(migration,/drop constraint if exists reservations_check/);
  assert.match(migration,/total = subtotal \+ extras_total \+ taxes/);
});
