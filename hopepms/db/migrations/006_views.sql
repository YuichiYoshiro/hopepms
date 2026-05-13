-- SQL Views for reporting and product management

-- Current price per product (used in ProductListPage)
CREATE OR REPLACE VIEW current_product_price AS
SELECT p.prodCode,
       p.description,
       p.unit,
       p.record_status,
       ph.unitPrice,
       ph.effDate,
       CASE
         WHEN public.is_current_user_admin_or_superadmin()
         THEN p.stamp
         ELSE NULL
       END AS stamp
FROM product p
LEFT JOIN priceHist ph ON ph.prodCode = p.prodCode
  AND ph.effDate = (
    SELECT MAX(effDate) FROM priceHist WHERE prodCode = p.prodCode
  );


-- Top-selling products (used in REP_002)
CREATE OR REPLACE VIEW top_selling_products AS
SELECT p.prodCode, p.description,
       SUM(sd.qty) AS totalQty,
       SUM(sd.qty * sd.unitPrice) AS totalRevenue
FROM product p
JOIN salesDetail sd ON sd.prodCode = p.prodCode
WHERE p.record_status = 'ACTIVE'
GROUP BY p.prodCode, p.description
ORDER BY totalQty DESC;
