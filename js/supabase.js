// js/supabase.js

// Substitua com as chaves reais do seu projeto no Supabase (Gratuito em https://supabase.com)
const SUPABASE_URL = "https://SEU_PROJETO.supabase.co";
const SUPABASE_ANON_KEY = "SUA_CHAVE_ANON_PUBLICA";

// Inicialização do cliente Supabase
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;