-- Casa Leite — parcelamento de compras
-- Cole no SQL Editor do Supabase e clique em Run.

alter table transactions
  add column if not exists installment_group_id uuid,
  add column if not exists installment_number int,
  add column if not exists installment_total int;

create index if not exists idx_transactions_installment_group
  on transactions (installment_group_id)
  where installment_group_id is not null;
