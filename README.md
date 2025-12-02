# Top Pokédex

Uma Pokédex moderna e interativa desenvolvida com Next.js, TypeScript e Tailwind CSS.

---

## Páginas

### Página Inicial (`/`)
- Lista todos os pokémons oficiais da PokéAPI
- Busca por nome
- Filtro por tipo
- Paginação (20 pokémons por página)
- Adicionar aos favoritos

### Favoritos (`/favorites`)
- Exibe todos os pokémons marcados como favoritos
- Suporta pokémons oficiais e customizados
- Remove favoritos com um clique

### Criar Pokémon (`/create`)
- Formulário para criar pokémons personalizados
- Campos: Nome, Imagem, Altura, Peso, Tipos (até 2)

### Pokémons Customizados (`/custom`)
- Lista pokémons criados pelo usuário
- Editar e deletar pokémons customizados
- Adicionar aos favoritos

---

## Como Funciona

### Filtros
- **Busca**: Filtra pokémons em tempo real digitando o nome
- **Tipo**: Dropdown com todos os tipos de pokémon (Fogo, Água, Planta, etc.)

### Paginação
- Exibe inicialmente 12 pokémons por página, alterável para 24, 36 ou 48 pokémons por página
- Botões para navegar entre páginas (Anterior/Próximo)
- Indicador de página atual

### Sistema de Favoritos
- Salvo no **localStorage** do navegador
- Persiste entre sessões
- Funciona com pokémons oficiais e customizados

---

## Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **PokéAPI** - API oficial de pokémons

---

## Como Executar

```bash
npm install
npm run dev
```

---

**Desenvolvido por:** Matheus Luz
