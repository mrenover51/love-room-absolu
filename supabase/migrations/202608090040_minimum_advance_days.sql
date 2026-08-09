insert into public.settings (key, value, updated_at)
values (
  'reservation_workflow',
  '{"mode":"manual","paymentExpirationHours":24,"minimumAdvanceDays":1}'::jsonb,
  now()
)
on conflict (key) do update
set value = case
      when jsonb_typeof(settings.value) = 'object'
        and not (settings.value ? 'minimumAdvanceDays')
      then settings.value || '{"minimumAdvanceDays":1}'::jsonb
      else settings.value
    end,
    updated_at = now();
