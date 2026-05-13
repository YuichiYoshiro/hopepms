-- RLS for reporting base tables used by views

-- Enable RLS
ALTER TABLE priceHist ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesDetail ENABLE ROW LEVEL SECURITY;

-- SELECT policies
-- 1) Normal USER: can see price history only for products that are ACTIVE
-- 2) ADMIN/SUPERADMIN: can see all

DROP POLICY IF EXISTS "priceHist_select_active_or_admin" ON priceHist;
CREATE POLICY "priceHist_select_active_or_admin" ON priceHist
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM product p
    WHERE p.prodCode = priceHist.prodCode
      AND p.record_status = 'ACTIVE'
  )
  OR (
    SELECT user_type FROM public."user" WHERE userId = auth.uid()::text
  ) IN ('ADMIN','SUPERADMIN')
);

DROP POLICY IF EXISTS "salesDetail_select_active_products_or_admin" ON salesDetail;
CREATE POLICY "salesDetail_select_active_products_or_admin" ON salesDetail
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM product p
    WHERE p.prodCode = salesDetail.prodCode
      AND p.record_status = 'ACTIVE'
  )
  OR (
    SELECT user_type FROM public."user" WHERE userId = auth.uid()::text
  ) IN ('ADMIN','SUPERADMIN')
);

-- Optional: INSERT/UPDATE not created here because the current frontend
-- does not write salesDetail/priceHist directly except product price history.
-- If you add UI for editing price history via the app, add policies for
-- priceHist INSERT/UPDATE.

