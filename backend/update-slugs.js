const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Função para gerar slug único baseado no nome da barbearia
const generateSlug = async (name, excludeId = null) => {
  let baseSlug = name.toLowerCase()
    .replace(/\s+/g, '-')           // Substituir espaços por hífens
    .replace(/[^a-z0-9-]/g, '')     // Remover caracteres especiais
    .replace(/-+/g, '-')            // Substituir múltiplos hífens por um só
    .replace(/^-|-$/g, '');         // Remover hífens no início e fim
  
  let slug = baseSlug;
  let counter = 1;
  
  // Verificar se o slug já existe e adicionar número se necessário
  while (true) {
    const existing = await prisma.barbershop.findFirst({
      where: { 
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });
    
    if (!existing) {
      break;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

async function updateSlugs() {
  try {
    console.log('🔄 Atualizando slugs das barbearias...\n');

    // Buscar todas as barbearias
    const barbershops = await prisma.barbershop.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    console.log(`📋 Encontradas ${barbershops.length} barbearias`);

    for (const barbershop of barbershops) {
      // Verificar se o slug atual tem timestamp (números no final)
      const hasTimestamp = /\d{10,}$/.test(barbershop.slug);
      
      if (hasTimestamp) {
        console.log(`🔄 Atualizando: ${barbershop.name}`);
        console.log(`   Slug antigo: ${barbershop.slug}`);
        
        // Gerar novo slug
        const newSlug = await generateSlug(barbershop.name, barbershop.id);
        
        // Atualizar no banco
        await prisma.barbershop.update({
          where: { id: barbershop.id },
          data: { slug: newSlug }
        });
        
        console.log(`   ✅ Novo slug: ${newSlug}`);
      } else {
        console.log(`✅ Mantendo: ${barbershop.name} (${barbershop.slug})`);
      }
    }

    console.log('\n🎉 Slugs atualizados com sucesso!');
    console.log('🌐 Agora as URLs estão mais limpas e profissionais');

  } catch (error) {
    console.error('❌ Erro ao atualizar slugs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSlugs();
