# 📱 Pokédex - Aplicação Web

Uma Pokédex moderna e interativa desenvolvida com Next.js, TypeScript e Tailwind CSS, consumindo a PokéAPI e permitindo a criação de pokémons customizados.

---

## 🚀 Funcionalidades

### 🔍 Busca e Visualização
- **Listagem de Pokémons**: Visualize todos os pokémons oficiais da PokéAPI
- **Busca por Nome**: Encontre pokémons rapidamente digitando seus nomes
- **Filtro por Tipo**: Filtre pokémons por tipos (Fogo, Água, Planta, etc.)
- **Paginação**: Navigate através de múltiplas páginas de pokémons
- **Detalhes Completos**: Veja informações detalhadas como altura, peso, tipos e sprites

### ⭐ Sistema de Favoritos
- **Marcar Favoritos**: Adicione pokémons aos seus favoritos com um clique
- **Página de Favoritos**: Visualize todos os seus pokémons favoritos em um só lugar
- **Persistência Local**: Favoritos salvos no localStorage do navegador

### ✨ Criação de Pokémons Customizados
- **Criar Pokémons**: Crie seus próprios pokémons personalizados
- **Editar Pokémons**: Modifique pokémons customizados já criados
- **Deletar Pokémons**: Remova pokémons customizados quando desejar
- **Campos Personalizáveis**:
  - Nome (obrigatório)
  - URL da Imagem
  - Altura
  - Peso
  - Até 2 tipos diferentes

### 🎨 Interface
- **Tema Claro/Escuro**: Alterne entre temas claro e escuro
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Animações Suaves**: Transições e efeitos visuais agradáveis
- **Cards Coloridos**: Cores dinâmicas baseadas no tipo do pokémon

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Estilização utility-first
- **shadcn/ui**: Biblioteca de componentes UI
- **React Hooks**: useState, useEffect, useContext, custom hooks

### Backend
- **Node.js + Express**: Servidor para gerenciar pokémons customizados
- **File System (fs)**: Armazenamento em JSON local

### APIs
- **PokéAPI**: API oficial de pokémons (https://pokeapi.co/)
- **API Custom**: API local para pokémons customizados (porta 3001)

### Ferramentas
- **LocalStorage**: Persistência de favoritos no navegador
- **CORS**: Comunicação entre frontend e backend

---

## 📂 Estrutura do Projeto

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
├── types/                  # Tipos TypeScript
└── backend/                # Servidor Node.js
    ├── server.js          # API Express
    └── data/              # Armazenamento JSON
```

---

## 🎯 Como Funciona

### 1. Listagem de Pokémons Oficiais
- A aplicação consome a **PokéAPI** para buscar pokémons oficiais
- Os dados são processados e exibidos em cards com imagens e tipos
- Suporta paginação para navegar entre diferentes páginas

### 2. Sistema de Favoritos
- Utiliza **Context API** para gerenciar estado global
- IDs dos pokémons favoritos são salvos no **localStorage**
- Funciona tanto para pokémons oficiais quanto customizados

### 3. Pokémons Customizados
- **Frontend** envia requisição POST para a API local (porta 3001)
- **Backend** valida os dados e gera um ID único (começando em 9001)
- Pokémons são salvos em arquivo JSON (`custom-pokemons.json`)
- IDs customizados começam em **9001+** para evitar conflito com oficiais

### 4. Sistema de IDs
- **Pokémons Oficiais**: IDs 1 - 1000+ (da PokéAPI)
- **Pokémons Customizados**: IDs 9001+ (gerados localmente)
- Isso garante que não haja conflitos entre pokémons oficiais e customizados

---

## 💻 Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 1. Instalar Dependências

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Iniciar o Backend

```bash
cd backend
node server.js
```

O servidor estará rodando em `http://localhost:3001`

### 3. Iniciar o Frontend

Em outro terminal:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

---

## 🎨 Funcionalidades por Página

### 🏠 Página Inicial (`/`)
- Lista todos os pokémons com paginação
- Busca por nome
- Filtro por tipo
- Adicionar aos favoritos

### ⭐ Favoritos (`/favorites`)
- Exibe todos os pokémons favoritos
- Suporta pokémons oficiais e customizados
- Remove favoritos com um clique

### ✨ Criar Pokémon (`/create`)
- Formulário para criar pokémons customizados
- Validação de campos obrigatórios
- Dicas de preenchimento

### 🎨 Pokémons Customizados (`/custom`)
- Lista todos os pokémons customizados criados
- Editar pokémons existentes
- Deletar pokémons customizados
- Adicionar aos favoritos

---

## 📝 Notas Técnicas

- **Persistência**: Favoritos no localStorage, pokémons customizados em JSON
- **Validação**: Nome obrigatório, tipos limitados a 2
- **IDs Únicos**: Sistema automático de geração começando em 9001
- **Tema**: Persistido no localStorage com toggle claro/escuro
- **Responsividade**: Grid adaptativo (1-5 colunas dependendo do tamanho da tela)

---

## 🔮 Possíveis Melhorias Futuras

- Implementar banco de dados real (PostgreSQL, MongoDB)
- Sistema de autenticação de usuários
- Upload de imagens para pokémons customizados
- Estatísticas e gráficos de pokémons
- Comparação entre pokémons
- Sistema de batalhas

---

## 👨‍💻 Desenvolvido com

💙 Next.js | ⚡ TypeScript | 🎨 Tailwind CSS | 🎮 PokéAPI

---

**Desenvolvido por:** Matheus Fernandes  
**Data:** 2025
