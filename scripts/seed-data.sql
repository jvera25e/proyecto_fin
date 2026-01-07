-- Datos de prueba para la aplicación financiera

-- Insertar categorías del sistema
INSERT INTO categories (id, name, description, color, icon, type, is_system) VALUES
-- Categorías de gastos
(uuid_generate_v4(), 'Alimentación', 'Comida, restaurantes, supermercado', '#FF6B6B', 'utensils', 'expense', true),
(uuid_generate_v4(), 'Transporte', 'Gasolina, transporte público, Uber', '#4ECDC4', 'car', 'expense', true),
(uuid_generate_v4(), 'Entretenimiento', 'Cine, conciertos, hobbies', '#45B7D1', 'film', 'expense', true),
(uuid_generate_v4(), 'Servicios', 'Electricidad, agua, internet, teléfono', '#96CEB4', 'zap', 'expense', true),
(uuid_generate_v4(), 'Salud', 'Médico, medicinas, seguro médico', '#FFEAA7', 'heart', 'expense', true),
(uuid_generate_v4(), 'Educación', 'Cursos, libros, materiales educativos', '#DDA0DD', 'book', 'expense', true),
(uuid_generate_v4(), 'Compras', 'Ropa, electrónicos, artículos personales', '#FFB6C1', 'shopping-bag', 'expense', true),
(uuid_generate_v4(), 'Vivienda', 'Renta, hipoteca, mantenimiento', '#F0E68C', 'home', 'expense', true),
(uuid_generate_v4(), 'Seguros', 'Seguro de auto, vida, hogar', '#87CEEB', 'shield', 'expense', true),
(uuid_generate_v4(), 'Otros Gastos', 'Gastos varios no categorizados', '#D3D3D3', 'more-horizontal', 'expense', true),

-- Categorías de ingresos
(uuid_generate_v4(), 'Salario', 'Sueldo principal', '#2ECC71', 'briefcase', 'income', true),
(uuid_generate_v4(), 'Freelance', 'Trabajos independientes', '#3498DB', 'laptop', 'income', true),
(uuid_generate_v4(), 'Inversiones', 'Dividendos, intereses, ganancias', '#9B59B6', 'trending-up', 'income', true),
(uuid_generate_v4(), 'Bonos', 'Bonificaciones, aguinaldo', '#E67E22', 'gift', 'income', true),
(uuid_generate_v4(), 'Ventas', 'Venta de productos o servicios', '#1ABC9C', 'dollar-sign', 'income', true),
(uuid_generate_v4(), 'Otros Ingresos', 'Ingresos varios', '#95A5A6', 'plus', 'income', true);

-- Crear usuario de prueba
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo@financialapp.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G', 'Usuario', 'Demo', '+1234567890', true, true);

-- Configuraciones del usuario demo
INSERT INTO user_settings (user_id, currency, language, timezone, theme) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'USD', 'es', 'America/Mexico_City', 'light');

-- Cuentas del usuario demo
INSERT INTO accounts (id, user_id, name, type, balance, currency, bank_name, account_number, is_active, is_primary) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Cuenta Corriente Principal', 'checking', 5420.50, 'USD', 'Banco Nacional', '****1234', true, true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Cuenta de Ahorros', 'savings', 12800.00, 'USD', 'Banco Nacional', '****5678', true, false),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Tarjeta de Crédito Visa', 'credit', -1250.75, 'USD', 'Banco Crédito', '****9012', true, false),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Inversiones', 'investment', 25600.30, 'USD', 'Broker Inversiones', '****3456', true, false);

-- Actualizar límites de crédito y fechas de vencimiento
UPDATE accounts SET 
    credit_limit = 5000.00,
    minimum_payment = 125.00,
    due_date = '2024-02-25'
WHERE id = '660e8400-e29b-41d4-a716-446655440003';

UPDATE accounts SET 
    interest_rate = 2.50
WHERE id = '660e8400-e29b-41d4-a716-446655440002';

UPDATE accounts SET 
    interest_rate = 7.20
WHERE id = '660e8400-e29b-41d4-a716-446655440004';

-- Obtener IDs de categorías para las transacciones
DO $$
DECLARE
    cat_alimentacion UUID;
    cat_transporte UUID;
    cat_entretenimiento UUID;
    cat_servicios UUID;
    cat_salud UUID;
    cat_compras UUID;
    cat_salario UUID;
    cat_freelance UUID;
    cat_inversiones UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_alimentacion FROM categories WHERE name = 'Alimentación' AND is_system = true;
    SELECT id INTO cat_transporte FROM categories WHERE name = 'Transporte' AND is_system = true;
    SELECT id INTO cat_entretenimiento FROM categories WHERE name = 'Entretenimiento' AND is_system = true;
    SELECT id INTO cat_servicios FROM categories WHERE name = 'Servicios' AND is_system = true;
    SELECT id INTO cat_salud FROM categories WHERE name = 'Salud' AND is_system = true;
    SELECT id INTO cat_compras FROM categories WHERE name = 'Compras' AND is_system = true;
    SELECT id INTO cat_salario FROM categories WHERE name = 'Salario' AND is_system = true;
    SELECT id INTO cat_freelance FROM categories WHERE name = 'Freelance' AND is_system = true;
    SELECT id INTO cat_inversiones FROM categories WHERE name = 'Inversiones' AND is_system = true;

    -- Transacciones de ejemplo (últimos 3 meses)
    INSERT INTO transactions (user_id, account_id, category_id, description, amount, type, transaction_date, status) VALUES
    -- Enero 2024
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_salario, 'Salario Enero', 4500.00, 'income', '2024-01-31', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_freelance, 'Proyecto Web', 800.00, 'income', '2024-01-15', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440004', cat_inversiones, 'Dividendos ETF', 120.50, 'income', '2024-01-10', 'completed'),
    
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_alimentacion, 'Supermercado Walmart', -85.30, 'expense', '2024-01-28', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_alimentacion, 'Restaurante La Cocina', -45.20, 'expense', '2024-01-25', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_transporte, 'Gasolina Shell', -60.00, 'expense', '2024-01-24', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', cat_entretenimiento, 'Netflix Suscripción', -15.99, 'expense', '2024-01-20', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_servicios, 'Electricidad CFE', -120.50, 'expense', '2024-01-18', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_servicios, 'Internet Telmex', -45.00, 'expense', '2024-01-15', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', cat_compras, 'Amazon - Electrónicos', -299.99, 'expense', '2024-01-12', 'completed'),
    
    -- Febrero 2024
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_salario, 'Salario Febrero', 4500.00, 'income', '2024-02-29', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_freelance, 'Consultoría Tech', 1200.00, 'income', '2024-02-20', 'completed'),
    
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_alimentacion, 'Supermercado Soriana', -92.15, 'expense', '2024-02-26', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_alimentacion, 'Starbucks', -12.50, 'expense', '2024-02-22', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_transporte, 'Uber', -25.30, 'expense', '2024-02-21', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_transporte, 'Gasolina Pemex', -65.00, 'expense', '2024-02-18', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', cat_entretenimiento, 'Cine Cinépolis', -35.00, 'expense', '2024-02-14', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_salud, 'Farmacia Guadalajara', -28.75, 'expense', '2024-02-10', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_servicios, 'Agua SAPAC', -35.20, 'expense', '2024-02-08', 'completed'),
    
    -- Marzo 2024 (mes actual)
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_freelance, 'Desarrollo App', 950.00, 'income', '2024-03-15', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440004', cat_inversiones, 'Venta Acciones', 340.80, 'income', '2024-03-12', 'completed'),
    
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_alimentacion, 'Supermercado HEB', -78.90, 'expense', '2024-03-18', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_alimentacion, 'Dominos Pizza', -32.50, 'expense', '2024-03-16', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_transporte, 'Gasolina BP', -58.00, 'expense', '2024-03-14', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440003', cat_compras, 'Zara - Ropa', -125.00, 'expense', '2024-03-10', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_servicios, 'Teléfono Telcel', -55.00, 'expense', '2024-03-08', 'completed'),
    ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', cat_entretenimiento, 'Spotify Premium', -9.99, 'expense', '2024-03-05', 'completed');

END $$;

-- Presupuesto de ejemplo
INSERT INTO budgets (id, user_id, name, description, total_amount, period, start_date, end_date, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Presupuesto Mensual Marzo', 'Presupuesto para gastos del mes de marzo', 3000.00, 'monthly', '2024-03-01', '2024-03-31', true);

-- Categorías del presupuesto
DO $$
DECLARE
    budget_id UUID := '770e8400-e29b-41d4-a716-446655440001';
    cat_alimentacion UUID;
    cat_transporte UUID;
    cat_entretenimiento UUID;
    cat_servicios UUID;
    cat_compras UUID;
BEGIN
    SELECT id INTO cat_alimentacion FROM categories WHERE name = 'Alimentación' AND is_system = true;
    SELECT id INTO cat_transporte FROM categories WHERE name = 'Transporte' AND is_system = true;
    SELECT id INTO cat_entretenimiento FROM categories WHERE name = 'Entretenimiento' AND is_system = true;
    SELECT id INTO cat_servicios FROM categories WHERE name = 'Servicios' AND is_system = true;
    SELECT id INTO cat_compras FROM categories WHERE name = 'Compras' AND is_system = true;

    INSERT INTO budget_categories (budget_id, category_id, allocated_amount) VALUES
    (budget_id, cat_alimentacion, 800.00),
    (budget_id, cat_transporte, 400.00),
    (budget_id, cat_entretenimiento, 200.00),
    (budget_id, cat_servicios, 600.00),
    (budget_id, cat_compras, 300.00);
END $$;

-- Metas financieras
INSERT INTO financial_goals (id, user_id, name, description, target_amount, current_amount, target_date, priority, status, category) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Fondo de Emergencia', 'Ahorrar 6 meses de gastos para emergencias', 15000.00, 8500.00, '2024-12-31', 'high', 'active', 'Emergencia'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Vacaciones Europa', 'Viaje a Europa en verano', 5000.00, 2300.00, '2024-07-15', 'medium', 'active', 'Viajes'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Laptop Nueva', 'MacBook Pro para trabajo', 2500.00, 1200.00, '2024-05-30', 'medium', 'active', 'Tecnología');

-- Contribuciones a metas
INSERT INTO goal_contributions (goal_id, amount, contribution_date, notes) VALUES
('880e8400-e29b-41d4-a716-446655440001', 500.00, '2024-01-31', 'Ahorro mensual automático'),
('880e8400-e29b-41d4-a716-446655440001', 500.00, '2024-02-29', 'Ahorro mensual automático'),
('880e8400-e29b-41d4-a716-446655440001', 300.00, '2024-03-15', 'Ahorro extra del freelance'),

('880e8400-e29b-41d4-a716-446655440002', 200.00, '2024-01-31', 'Ahorro para vacaciones'),
('880e8400-e29b-41d4-a716-446655440002', 250.00, '2024-02-29', 'Ahorro para vacaciones'),
('880e8400-e29b-41d4-a716-446655440002', 150.00, '2024-03-10', 'Ahorro extra'),

('880e8400-e29b-41d4-a716-446655440003', 400.00, '2024-02-15', 'Primer ahorro para laptop'),
('880e8400-e29b-41d4-a716-446655440003', 300.00, '2024-03-01', 'Segundo ahorro');

-- Eventos del calendario financiero
INSERT INTO financial_events (user_id, title, description, amount, type, event_date, is_recurring, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Pago Tarjeta de Crédito', 'Pago mínimo tarjeta Visa', 125.00, 'expense', '2024-03-25', true, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 'Salario Marzo', 'Pago de nómina mensual', 4500.00, 'income', '2024-03-31', true, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 'Pago Renta', 'Renta mensual del departamento', 1200.00, 'expense', '2024-04-01', true, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 'Revisión Médica', 'Chequeo médico anual', 150.00, 'expense', '2024-04-15', false, 'pending'),
('550e8400-e29b-41d4-a716-446655440000', 'Meta Vacaciones', 'Ahorro mensual para viaje', 300.00, 'goal', '2024-04-01', true, 'pending');

-- Notificaciones
INSERT INTO notifications (user_id, title, message, type, category, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Presupuesto Superado', 'Has superado el 80% de tu presupuesto de alimentación este mes', 'warning', 'budget', false),
('550e8400-e29b-41d4-a716-446655440000', 'Pago Próximo', 'Tu tarjeta de crédito vence en 5 días', 'info', 'account', false),
('550e8400-e29b-41d4-a716-446655440000', 'Meta Alcanzada', '¡Felicidades! Has alcanzado el 50% de tu meta de laptop nueva', 'success', 'goal', true),
('550e8400-e29b-41d4-a716-446655440000', 'Transacción Inusual', 'Se detectó una transacción de $299.99 en Amazon', 'info', 'transaction', true);

-- Actualizar balances de cuentas (esto se haría automáticamente con los triggers)
UPDATE accounts SET balance = calculate_account_balance(id);

-- Actualizar gastos en categorías de presupuesto
UPDATE budget_categories 
SET spent_amount = (
    SELECT COALESCE(SUM(ABS(amount)), 0)
    FROM transactions t
    JOIN budgets b ON b.user_id = t.user_id
    WHERE t.category_id = budget_categories.category_id
    AND t.type = 'expense'
    AND t.status = 'completed'
    AND t.transaction_date BETWEEN b.start_date AND b.end_date
    AND b.id = budget_categories.budget_id
);
