# Architecture Sprint 4A

```text
Client React → Route Handler validé Zod → CheckoutService
                                      ├─ ReservationService
                                      ├─ repositories Supabase
                                      └─ StripeProvider
Stripe → webhook signé → PaymentService → RPC confirm_reservation → Resend
```

Les composants n'accèdent jamais à Supabase. Les DTO sont validés à la frontière HTTP. Les prix sont lus en base et manipulés en centimes. Les repositories concentrent les requêtes, les services portent les règles métier, et les providers isolent les fournisseurs externes. Les interfaces Booking/Airbnb/iCalendar ne simulent aucune API propriétaire.

Next.js 16 remplace la convention `middleware.ts` par `proxy.ts`; la protection admin reste donc dans `proxy.ts`, complétée par une vérification de rôle dans chaque action ou route sensible.
