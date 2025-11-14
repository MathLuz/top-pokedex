# 📱 Pokédex - Aplicação Web

Uma Pokédex moderna e interativa desenvolvida com Next.js, TypeScript e Tailwind CSS, consumindo a PokéAPI e permitindo a criação de pokémons customizados.

---

## Funcionalidades

### Busca e Visualização
- **Listagem de Pokémons**: Visualize todos os pokémons oficiais da PokéAPI
- **Busca por Nome**: Encontre pokémons rapidamente digitando seus nomes
- **Filtro por Tipo**: Filtre pokémons por tipos (Fogo, Água, Planta, etc.)
- **Paginação**: Navigate através de múltiplas páginas de pokémons
- **Detalhes Completos**: Veja informações detalhadas como altura, peso, tipos e sprites

### Sistema de Favoritos
- **Marcar Favoritos**: Adicione pokémons aos seus favoritos com um clique
- **Página de Favoritos**: Visualize todos os seus pokémons favoritos em um só lugar
- **Persistência Local**: Favoritos salvos no localStorage do navegador

### Criação de Pokémons Customizados
- **Criar Pokémons**: Crie seus próprios pokémons personalizados
- **Editar Pokémons**: Modifique pokémons customizados já criados
- **Deletar Pokémons**: Remova pokémons customizados quando desejar
- **Campos Personalizáveis**:
  - Nome (obrigatório)
  - URL da Imagem
  - Altura
  - Peso
  - Até 2 tipos diferentes

### Interface
- **Tema Claro/Escuro**: Alterne entre temas claro e escuro
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações Suaves**: Transições e efeitos visuais agradáveis

---

## Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Estilização utility-first
- **shadcn/ui**: Biblioteca de componentes UI
- **Font Awesome**: Ícones e elementos visuais
- **React Hooks**: useState, useEffect, useContext, custom hooks

### APIs
- **PokéAPI**: API oficial de pokémons (https://pokeapi.co/)

### Armazenamento
- **LocalStorage**: Persistência de favoritos e pokémons customizados no navegador

---

## Estrutura do Projeto

```
project/
├── app/                      # Páginas Next.js (App Router)
│   ├── page.tsx             # Página inicial (lista de pokémons)
│   ├── create/              # Página de criação
│   ├── custom/              # Página de pokémons customizados
│   └── favorites/           # Página de favoritos
├── components/              # Componentes React
│   ├── forms/              # Formulários
│   ├── layout/             # Header e layout
│   ├── pokemon/            # Componentes de pokémon
│   └── ui/                 # Componentes UI (shadcn)
├── contexts/               # Context API (Favoritos)
├── hooks/                  # Custom React Hooks
├── lib/                    # Utilitários e APIs
│   ├── api/               # Funções de chamada à API
│   └── utils/             # Funções auxiliares
└── types/                  # Tipos TypeScript
```

---

## Como Funciona

### 1. Listagem de Pokémons Oficiais
- A aplicação consome a **PokéAPI** para buscar pokémons oficiais
- Os dados são processados e exibidos em cards com imagens e tipos
- Suporta paginação para navegar entre diferentes páginas

### 2. Sistema de Favoritos
- Utiliza **Context API** para gerenciar estado global
- IDs dos pokémons favoritos são salvos no **localStorage**
- Funciona tanto para pokémons oficiais quanto customizados

### 3. Pokémons Customizados
- Os dados são validados no **frontend**
- Um ID único é gerado automaticamente (começando em 9001)
- Pokémons são salvos no **localStorage** do navegador
- IDs customizados começam em **9001+** para evitar conflito com oficiais

### 4. Sistema de IDs
- **Pokémons Oficiais**: IDs 1 - 1000+ (da PokéAPI)
- **Pokémons Customizados**: IDs 9001+ (gerados localmente)
- Isso garante que não haja conflitos entre pokémons oficiais e customizados

---

## Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar a Aplicação

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

---

## Funcionalidades por Página

### Página Inicial (`/`)
- Lista todos os pokémons com paginação
- Busca por nome
- Filtro por tipo
- Adicionar aos favoritos

### Favoritos (`/favorites`)
- Exibe todos os pokémons favoritos
- Suporta pokémons oficiais e customizados
- Remove favoritos com um clique

### Criar Pokémon (`/create`)
- Formulário para criar pokémons customizados
- Validação de campos obrigatórios
- Dicas de preenchimento

### Pokémons Customizados (`/custom`)
- Lista todos os pokémons customizados criados
- Editar pokémons existentes
- Deletar pokémons customizados
- Adicionar aos favoritos

---

**Desenvolvido por:** Matheus Luz  
**Data:** 11/2025
