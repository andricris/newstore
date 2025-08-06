-- ====================================
-- TOKOPROFESIONAL - DATABASE SETUP SCRIPT
-- Complete setup for Supabase PostgreSQL
-- Version: 2.0
-- Created: 2024
-- ====================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ====================================
-- DROP EXISTING TABLES (IF EXISTS)
-- ====================================
-- Uncomment these lines if you need to reset the database
-- DROP POLICY IF EXISTS "Public can view products" ON products;
-- DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
-- DROP POLICY IF EXISTS "Public can view settings" ON settings;
-- DROP POLICY IF EXISTS "Authenticated users can update settings" ON settings;
-- DROP POLICY IF EXISTS "Public can view vouchers" ON vouchers;
-- DROP POLICY IF EXISTS "Authenticated users can manage vouchers" ON vouchers;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS settings CASCADE;
-- DROP TABLE IF EXISTS vouchers CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS order_items CASCADE;

-- ====================================
-- CREATE MAIN TABLES
-- ====================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price BIGINT NOT NULL CHECK (price >= 0), -- Using BIGINT for Indonesian Rupiah
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    category VARCHAR(100) DEFAULT 'general',
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    sku VARCHAR(50) UNIQUE,
    weight_grams INTEGER DEFAULT 0 CHECK (weight_grams >= 0),
    dimensions JSONB, -- For storing width, height, length
    tags TEXT[], -- Array of tags for better searchability
    featured BOOLEAN DEFAULT false,
    discount_percentage DECIMAL(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin(to_tsvector('indonesian', name || ' ' || COALESCE(description, '')));

-- 2. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensure only one row
    store_name VARCHAR(255) DEFAULT 'TokoProfesional',
    store_description TEXT,
    store_address TEXT,
    store_phone VARCHAR(20),
    store_email VARCHAR(255),
    store_logo_url TEXT,
    qris_image_url TEXT,
    whatsapp_number VARCHAR(20),
    whatsapp_message_template TEXT DEFAULT 'Halo, saya ingin melakukan pemesanan:',
    promo_media_url TEXT,
    promo_media_type VARCHAR(10) CHECK (promo_media_type IN ('image', 'video')),
    promo_active BOOLEAN DEFAULT false,
    shipping_enabled BOOLEAN DEFAULT false,
    shipping_cost BIGINT DEFAULT 0 CHECK (shipping_cost >= 0),
    free_shipping_minimum BIGINT DEFAULT 0 CHECK (free_shipping_minimum >= 0),
    tax_percentage DECIMAL(5,2) DEFAULT 0 CHECK (tax_percentage >= 0 AND tax_percentage <= 100),
    currency_code VARCHAR(3) DEFAULT 'IDR',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    maintenance_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 3. VOUCHERS TABLE
CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
    discount_amount BIGINT NOT NULL CHECK (discount_amount > 0),
    minimum_purchase BIGINT DEFAULT 0 CHECK (minimum_purchase >= 0),
    maximum_discount BIGINT, -- For percentage discounts
    usage_limit INTEGER, -- NULL means unlimited
    used_count INTEGER DEFAULT 0 CHECK (used_count >= 0),
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    applicable_categories TEXT[], -- Array of categories this voucher applies to
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes for vouchers
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_valid_period ON vouchers(valid_from, valid_until);

-- 4. ORDERS TABLE (for future order tracking)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT,
    subtotal BIGINT NOT NULL CHECK (subtotal >= 0),
    discount_amount BIGINT DEFAULT 0 CHECK (discount_amount >= 0),
    shipping_cost BIGINT DEFAULT 0 CHECK (shipping_cost >= 0),
    tax_amount BIGINT DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
    voucher_code VARCHAR(50),
    payment_method VARCHAR(50) DEFAULT 'qris',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    order_status VARCHAR(20) DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    notes TEXT,
    payment_proof_url TEXT,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(255) NOT NULL, -- Snapshot of product name
    product_price BIGINT NOT NULL CHECK (product_price >= 0), -- Snapshot of product price
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price BIGINT NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for order items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ====================================
-- INITIAL DATA INSERTION
-- ====================================

-- Insert initial settings
INSERT INTO settings (
    id, 
    store_name, 
    store_description, 
    store_address,
    store_phone,
    store_email,
    whatsapp_message_template,
    currency_code,
    timezone
) VALUES (
    1, 
    'TokoProfesional', 
    'Destinasi fashion terpercaya untuk produk berkualitas tinggi dengan gaya modern dan profesional.',
    'Jl. Profesional No. 1, Jakarta, Indonesia 12345',
    '(021) 123-4567',
    'kontak@tokoprofesional.com',
    'Halo, saya ingin konfirmasi pembayaran untuk pesanan berikut:',
    'IDR',
    'Asia/Jakarta'
) ON CONFLICT (id) DO UPDATE SET
    store_description = EXCLUDED.store_description,
    store_address = EXCLUDED.store_address,
    store_phone = EXCLUDED.store_phone,
    store_email = EXCLUDED.store_email,
    updated_at = CURRENT_TIMESTAMP;

-- Insert sample products (only if table is empty)
INSERT INTO products (name, description, price, image_url, category, stock_quantity, sku, weight_grams, tags, featured, discount_percentage)
SELECT * FROM (VALUES
    ('Kemeja Flanel Kotak', 'Bahan katun lembut dengan motif kotak klasik yang timeless. Nyaman digunakan untuk berbagai kesempatan.', 250000, 'https://placehold.co/600x400/3b82f6/ffffff?text=Kemeja+Flanel', 'clothing', 25, 'KFL-001', 300, ARRAY['kemeja', 'flanel', 'kasual', 'pria'], true, 0),
    ('Celana Chino Slim-Fit', 'Potongan modern slim-fit dengan bahan stretch yang nyaman. Cocok untuk gaya kasual maupun semi-formal.', 320000, 'https://placehold.co/600x400/10b981/ffffff?text=Celana+Chino', 'clothing', 30, 'CCH-001', 400, ARRAY['celana', 'chino', 'slim-fit', 'pria'], true, 10),
    ('T-Shirt Grafis Abstrak', 'Kaos katun premium dengan desain sablon eksklusif yang eye-catching. Bahan berkualitas tinggi dan nyaman.', 180000, 'https://placehold.co/600x400/8b5cf6/ffffff?text=T-Shirt+Grafis', 'clothing', 50, 'TSG-001', 200, ARRAY['kaos', 'grafis', 'kasual', 'unisex'], false, 0),
    ('Sepatu Sneakers Kanvas', 'Desain timeless dengan sol karet anti-slip untuk aktivitas sehari-hari. Tersedia berbagai ukuran.', 450000, 'https://placehold.co/600x400/ef4444/ffffff?text=Sneakers+Kanvas', 'footwear', 20, 'SNK-001', 800, ARRAY['sepatu', 'sneakers', 'kanvas', 'kasual'], true, 15),
    ('Jaket Denim Klasik', 'Jaket denim tebal berkualitas premium dengan detail kancing logam. Style yang tidak pernah ketinggalan zaman.', 550000, 'https://placehold.co/600x400/f97316/ffffff?text=Jaket+Denim', 'clothing', 15, 'JDK-001', 600, ARRAY['jaket', 'denim', 'klasik', 'unisex'], true, 0),
    ('Tas Ransel Minimalis', 'Tas ransel dengan desain minimalis dan fungsional. Cocok untuk kerja, kuliah, atau traveling.', 380000, 'https://placehold.co/600x400/6366f1/ffffff?text=Tas+Ransel', 'accessories', 35, 'TRM-001', 500, ARRAY['tas', 'ransel', 'minimalis', 'unisex'], false, 20)
) AS sample_data(name, description, price, image_url, category, stock_quantity, sku, weight_grams, tags, featured, discount_percentage)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Insert sample vouchers
INSERT INTO vouchers (code, description, discount_type, discount_amount, minimum_purchase, usage_limit, valid_until)
SELECT * FROM (VALUES
    ('WELCOME10', 'Diskon 10% untuk pelanggan baru', 'percentage', 10, 100000, 100, CURRENT_TIMESTAMP + INTERVAL '30 days'),
    ('DISKON50K', 'Diskon Rp 50.000 untuk pembelian minimum Rp 500.000', 'fixed', 50000, 500000, 50, CURRENT_TIMESTAMP + INTERVAL '30 days'),
    ('FREESHIP', 'Gratis ongkos kirim untuk pembelian minimum Rp 300.000', 'fixed', 25000, 300000, NULL, CURRENT_TIMESTAMP + INTERVAL '60 days')
) AS sample_vouchers(code, description, discount_type, discount_amount, minimum_purchase, usage_limit, valid_until)
WHERE NOT EXISTS (SELECT 1 FROM vouchers LIMIT 1);

-- ====================================
-- CREATE STORAGE BUCKET
-- ====================================

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'images', 
    'images', 
    true, 
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']::text[]
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- SETTINGS POLICIES
DROP POLICY IF EXISTS "Public can view settings" ON settings;
CREATE POLICY "Public can view settings" ON settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can update settings" ON settings;
CREATE POLICY "Authenticated users can update settings" ON settings
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can insert settings" ON settings;
CREATE POLICY "Authenticated users can insert settings" ON settings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- VOUCHERS POLICIES
DROP POLICY IF EXISTS "Public can view active vouchers" ON vouchers;
CREATE POLICY "Public can view active vouchers" ON vouchers
    FOR SELECT USING (is_active = true AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP));

DROP POLICY IF EXISTS "Authenticated users can view all vouchers" ON vouchers;
CREATE POLICY "Authenticated users can view all vouchers" ON vouchers
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage vouchers" ON vouchers;
CREATE POLICY "Authenticated users can manage vouchers" ON vouchers
    FOR ALL USING (auth.role() = 'authenticated');

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view their orders" ON orders;
CREATE POLICY "Users can view their orders" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (true); -- Allow anyone to create orders

DROP POLICY IF EXISTS "Authenticated users can manage orders" ON orders;
CREATE POLICY "Authenticated users can manage orders" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

-- ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
CREATE POLICY "Users can view order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND (auth.role() = 'authenticated' OR orders.created_by IS NULL)
        )
    );

DROP POLICY IF EXISTS "Users can create order items" ON order_items;
CREATE POLICY "Users can create order items" ON order_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id
        )
    );

-- ====================================
-- STORAGE POLICIES
-- ====================================

-- Policy untuk melihat file (public)
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
CREATE POLICY "Public can view images" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

-- Policy untuk upload file (authenticated user)
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Policy untuk update file (authenticated user)
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
CREATE POLICY "Authenticated users can update images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Policy untuk delete file (authenticated user)
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
CREATE POLICY "Authenticated users can delete images" ON storage.objects
    FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- ====================================
-- FUNCTIONS & TRIGGERS
-- ====================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    IF TG_TABLE_NAME IN ('products', 'settings', 'vouchers') AND auth.uid() IS NOT NULL THEN
        NEW.updated_by = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function untuk generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = 'TP-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(nextval('orders_id_seq')::text, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function untuk update voucher usage
CREATE OR REPLACE FUNCTION update_voucher_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.voucher_code IS NOT NULL AND NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
        UPDATE vouchers 
        SET used_count = used_count + 1 
        WHERE code = NEW.voucher_code;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function untuk update product stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    order_status_val VARCHAR(20);
BEGIN
    -- Get order status
    SELECT order_status INTO order_status_val FROM orders WHERE id = NEW.order_id;
    
    -- Decrease stock when order is confirmed
    IF order_status_val = 'confirmed' THEN
        UPDATE products 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.product_id AND stock_quantity >= NEW.quantity;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vouchers_updated_at ON vouchers;
CREATE TRIGGER update_vouchers_updated_at 
    BEFORE UPDATE ON vouchers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for order number generation
DROP TRIGGER IF EXISTS generate_order_number_trigger ON orders;
CREATE TRIGGER generate_order_number_trigger 
    BEFORE INSERT ON orders 
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Create trigger for voucher usage tracking
DROP TRIGGER IF EXISTS update_voucher_usage_trigger ON orders;
CREATE TRIGGER update_voucher_usage_trigger 
    AFTER UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_voucher_usage();

-- Create trigger for stock management
DROP TRIGGER IF EXISTS update_product_stock_trigger ON order_items;
CREATE TRIGGER update_product_stock_trigger 
    AFTER INSERT ON order_items 
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- ====================================
-- ENABLE REALTIME
-- ====================================

-- Enable realtime subscriptions for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE vouchers;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- ====================================
-- CREATE VIEWS FOR ANALYTICS (OPTIONAL)
-- ====================================

-- View for product analytics
CREATE OR REPLACE VIEW product_analytics AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    p.stock_quantity,
    p.featured,
    p.discount_percentage,
    COALESCE(order_stats.total_sold, 0) as total_sold,
    COALESCE(order_stats.total_revenue, 0) as total_revenue,
    p.created_at
FROM products p
LEFT JOIN (
    SELECT 
        oi.product_id,
        SUM(oi.quantity) as total_sold,
        SUM(oi.total_price) as total_revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.payment_status = 'paid'
    GROUP BY oi.product_id
) order_stats ON order_stats.product_id = p.id;

-- View for sales analytics
CREATE OR REPLACE VIEW sales_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_orders
FROM orders
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ====================================
-- GRANT PERMISSIONS
-- ====================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant permissions on views
GRANT SELECT ON product_analytics TO authenticated;
GRANT SELECT ON sales_analytics TO authenticated;

-- ====================================
-- FINAL VALIDATION
-- ====================================

-- Validate that all tables exist
DO $$
DECLARE
    missing_tables TEXT[] := '{}';
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        missing_tables := array_append(missing_tables, 'products');
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'settings') THEN
        missing_tables := array_append(missing_tables, 'settings');
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vouchers') THEN
        missing_tables := array_append(missing_tables, 'vouchers');
    END IF;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ All tables created successfully!';
    END IF;
END $$;

-- Display setup summary
SELECT 
    'SETUP COMPLETE' as status,
    (SELECT COUNT(*) FROM products) as sample_products,
    (SELECT COUNT(*) FROM vouchers) as sample_vouchers,
    (SELECT COUNT(*) FROM settings) as settings_configured,
    CURRENT_TIMESTAMP as completed_at;