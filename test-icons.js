/**
 * Script de teste para verificar carregamento de ícones
 * Execute: node test-icons.js
 */

// Mock do ambiente Next.js
if (typeof window === 'undefined') {
  global.window = {};
}

// Simular a função getIcons
async function testIconsAPI() {
  console.log('🔍 Testando carregamento de ícones...\n');

  try {
    // Importar a função de API
    const { getIcons } = await import('./src/lib/supabase/api/categories.js');

    console.log('✅ Módulo de API carregado com sucesso');
    console.log('📞 Chamando getIcons()...\n');

    const result = await getIcons();

    console.log('📦 Resposta completa:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('\n❌ ERRO DETECTADO:');
      console.error('  Tipo:', result.error.constructor.name);
      console.error('  Mensagem:', result.error.message);
      console.error('  Detalhes:', result.error);

      if (result.error.message?.includes('JWT')) {
        console.log('\n💡 DIAGNÓSTICO: Erro de autenticação');
        console.log('   Possível causa: RLS ativado mas sem política pública');
        console.log('   Solução: Verificar policy "Icons are viewable by everyone"');
      }

      return;
    }

    if (!result.data || result.data.length === 0) {
      console.error('\n⚠️  ATENÇÃO: Nenhum ícone encontrado no banco de dados');
      console.log('\n💡 DIAGNÓSTICO: Tabela icons está vazia');
      console.log('   Possível causa: Migration 007_seed_data.sql não foi executada');
      console.log('   Solução: Executar migrations no Supabase');
      return;
    }

    console.log(`\n✅ SUCESSO: ${result.data.length} ícones carregados`);
    console.log('\n📋 Primeiros 10 ícones:');
    result.data.slice(0, 10).forEach(icon => {
      console.log(`   - ID ${icon.id}: ${icon.name}`);
    });

    // Verificar se ícone "Home" existe
    const homeIcon = result.data.find(i => i.name === 'Home');
    if (homeIcon) {
      console.log(`\n✅ Ícone "Home" encontrado: ID ${homeIcon.id}`);
    } else {
      console.log('\n⚠️  Ícone "Home" NÃO encontrado na lista');
    }

  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR TESTE:');
    console.error('  Tipo:', error.constructor.name);
    console.error('  Mensagem:', error.message);
    console.error('  Stack:', error.stack);

    if (error.message?.includes('Cannot find module')) {
      console.log('\n💡 DIAGNÓSTICO: Problema ao importar módulo');
      console.log('   Execute este script a partir da raiz do projeto');
    }
  }
}

testIconsAPI().then(() => {
  console.log('\n✅ Teste concluído');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Erro fatal:', err);
  process.exit(1);
});