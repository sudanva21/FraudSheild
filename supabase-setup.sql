-- FraudShield Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company_name TEXT,
    industry TEXT,
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fraud detection models table
CREATE TABLE IF NOT EXISTS public.fraud_models (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    model_name TEXT NOT NULL,
    model_type TEXT NOT NULL, -- 'transaction', 'user_behavior', 'device_fingerprint'
    model_config JSONB NOT NULL,
    accuracy_score NUMERIC(5,4),
    training_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fraud alerts table
CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    model_id UUID REFERENCES public.fraud_models(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- 'high_risk', 'medium_risk', 'suspicious_pattern'
    risk_score NUMERIC(5,4) NOT NULL,
    transaction_id TEXT,
    details JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'false_positive', 'confirmed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create transaction analysis table
CREATE TABLE IF NOT EXISTS public.transaction_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    transaction_id TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    merchant_name TEXT,
    merchant_category TEXT,
    transaction_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location_country TEXT,
    location_city TEXT,
    device_fingerprint TEXT,
    ip_address INET,
    risk_score NUMERIC(5,4),
    risk_factors JSONB,
    is_fraudulent BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint, method, date)
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_name TEXT UNIQUE NOT NULL,
    api_calls_limit INTEGER NOT NULL,
    price_monthly NUMERIC(8,2) NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_period_end TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_name, api_calls_limit, price_monthly, features) VALUES
('Starter', 1000, 29.99, '{"fraud_detection": true, "real_time_monitoring": false, "custom_models": false, "support": "email"}'),
('Professional', 10000, 99.99, '{"fraud_detection": true, "real_time_monitoring": true, "custom_models": true, "support": "priority"}'),
('Enterprise', 100000, 299.99, '{"fraud_detection": true, "real_time_monitoring": true, "custom_models": true, "support": "dedicated", "white_label": true}')
ON CONFLICT (plan_name) DO NOTHING;

-- Create Row Level Security (RLS) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for fraud_models
CREATE POLICY "Users can manage own fraud models" ON public.fraud_models
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for fraud_alerts
CREATE POLICY "Users can view own alerts" ON public.fraud_alerts
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for transaction_analysis
CREATE POLICY "Users can manage own transactions" ON public.transaction_analysis
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for api_usage
CREATE POLICY "Users can view own API usage" ON public.api_usage
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_id ON public.fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_created_at ON public.fraud_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_analysis_user_id ON public.transaction_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_analysis_transaction_time ON public.transaction_analysis(transaction_time);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON public.api_usage(user_id, date);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fraud_models_updated_at
    BEFORE UPDATE ON public.fraud_models
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();