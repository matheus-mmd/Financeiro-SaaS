"use client";

import { useState, useEffect } from "react";
import { getIcons } from "../../src/lib/supabase/api/categories";
import { supabase } from "../../src/lib/supabase/client";

export default function TestIconsPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [directQuery, setDirectQuery] = useState(null);

  useEffect(() => {
    async function runTests() {
      console.log('🧪 Iniciando testes de ícones...');

      // Teste 1: Usar a função getIcons da API
      console.log('\n📞 Teste 1: getIcons() da API');
      const apiResult = await getIcons();
      console.log('Resposta da API:', apiResult);
      setResult(apiResult);

      // Teste 2: Query direta no Supabase
      console.log('\n📞 Teste 2: Query direta no Supabase');
      const { data: directData, error: directError } = await supabase
        .from('icons')
        .select('id, name')
        .order('id', { ascending: true })
        .limit(10);

      console.log('Resposta direta:', { data: directData, error: directError });
      setDirectQuery({ data: directData, error: directError });

      // Teste 3: Verificar sessão
      console.log('\n📞 Teste 3: Verificar sessão de usuário');
      const { data: sessionData } = await supabase.auth.getSession();
      console.log('Sessão:', sessionData?.session ? 'Autenticado' : 'Não autenticado');
      console.log('Usuário:', sessionData?.session?.user?.email || 'Nenhum');

      setLoading(false);
    }

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🧪 Teste de Ícones</h1>
        <p>Executando testes... Verifique o console (F12)</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Teste de Ícones</h1>

      {/* Teste 1: API */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">📞 Teste 1: getIcons() da API</h2>

        {result?.error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="font-semibold text-red-800">❌ Erro:</p>
            <pre className="text-sm mt-2 text-red-700 overflow-auto">
              {JSON.stringify(result.error, null, 2)}
            </pre>

            {result.error.message?.includes('JWT') && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="font-semibold text-yellow-800">💡 Diagnóstico:</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Erro de autenticação JWT. Possível causa: RLS ativado mas sem política pública.
                </p>
              </div>
            )}
          </div>
        ) : result?.data?.length > 0 ? (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-semibold text-green-800">
              ✅ Sucesso: {result.data.length} ícones carregados
            </p>
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Primeiros 10 ícones:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {result.data.slice(0, 10).map(icon => (
                  <div key={icon.id} className="bg-white p-2 rounded border">
                    ID {icon.id}: {icon.name}
                  </div>
                ))}
              </div>
            </div>

            {result.data.find(i => i.name === 'Home') ? (
              <p className="mt-3 text-green-700">✅ Ícone "Home" encontrado</p>
            ) : (
              <p className="mt-3 text-red-700">⚠️ Ícone "Home" NÃO encontrado</p>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="font-semibold text-yellow-800">⚠️ Nenhum ícone encontrado</p>
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded p-3">
              <p className="font-semibold text-orange-800">💡 Diagnóstico:</p>
              <p className="text-sm text-orange-700 mt-1">
                Tabela icons está vazia. Migration 007_seed_data.sql não foi executada.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Teste 2: Query Direta */}
      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-3">📞 Teste 2: Query Direta</h2>

        {directQuery?.error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="font-semibold text-red-800">❌ Erro:</p>
            <pre className="text-sm mt-2 text-red-700 overflow-auto">
              {JSON.stringify(directQuery.error, null, 2)}
            </pre>
          </div>
        ) : directQuery?.data?.length > 0 ? (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-semibold text-green-800">
              ✅ Query direta funcionou: {directQuery.data.length} ícones
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="font-semibold text-yellow-800">⚠️ Query retornou vazio</p>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-blue-900">📋 Próximos Passos</h2>

        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p className="font-semibold">Se aparecer "0 ícones carregados":</p>
            <ul className="list-disc ml-5 mt-1">
              <li>As migrations não foram executadas no Supabase</li>
              <li>Execute as migrations via Supabase CLI ou Dashboard</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">Se aparecer erro de JWT/autenticação:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>A policy "Icons are viewable by everyone" não existe</li>
              <li>Verifique a migration 006_create_rls_policies.sql</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold">Se funcionou aqui mas não na página de categorias:</p>
            <ul className="list-disc ml-5 mt-1">
              <li>Problema de timing no carregamento</li>
              <li>Verifique os logs do console na página /categorias</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Console Logs */}
      <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
        <p className="text-sm text-gray-600">
          ℹ️ Verifique o console do navegador (F12 → Console) para logs detalhados
        </p>
      </div>
    </div>
  );
}