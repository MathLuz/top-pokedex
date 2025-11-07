const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'custom-pokemons.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory and file exist
async function ensureDataFile() {
  const dataDir = path.join(__dirname, 'data');
  
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}

// Get all custom pokémons
app.get('/api/custom-pokemons', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const pokemons = JSON.parse(data);
    res.json(pokemons);
  } catch (error) {
    console.error('Error reading custom pokémons:', error);
    res.status(500).json({ error: 'Failed to read custom pokémons' });
  }
});

// Get a specific custom pokémon by ID
app.get('/api/custom-pokemons/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const pokemons = JSON.parse(data);
    const pokemon = pokemons.find(p => p.id === parseInt(req.params.id));
    
    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }
    
    res.json(pokemon);
  } catch (error) {
    console.error('Error reading custom pokémon:', error);
    res.status(500).json({ error: 'Failed to read custom pokémon' });
  }
});

// Create a new custom pokémon
app.post('/api/custom-pokemons', async (req, res) => {
  try {
    const { name, imageUrl, height, weight, types } = req.body;
    
    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const pokemons = JSON.parse(data);
    
    // Check if name already exists
    const existingPokemon = pokemons.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (existingPokemon) {
      return res.status(409).json({ error: 'A Pokémon with this name already exists' });
    }
    
    // Generate new ID
    const lastId = pokemons.length > 0 ? Math.max(...pokemons.map(p => p.id)) : 9000;
    const newId = lastId + 1;
    
    // Create new pokémon
    const newPokemon = {
      id: newId,
      name: name.trim(),
      imageUrl: imageUrl?.trim() || '',
      height: height?.toString().trim() || '',
      weight: weight?.toString().trim() || '',
      types: types && types.length > 0 ? types.filter(type => type.trim() !== '') : [],
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    pokemons.push(newPokemon);
    await fs.writeFile(DATA_FILE, JSON.stringify(pokemons, null, 2));
    
    res.status(201).json(newPokemon);
  } catch (error) {
    console.error('Error creating custom pokémon:', error);
    res.status(500).json({ error: 'Failed to create custom pokémon' });
  }
});

// Update a custom pokémon
app.put('/api/custom-pokemons/:id', async (req, res) => {
  try {
    const { name, imageUrl, height, weight, types } = req.body;
    const pokemonId = parseInt(req.params.id);
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const pokemons = JSON.parse(data);
    
    const pokemonIndex = pokemons.findIndex(p => p.id === pokemonId);
    if (pokemonIndex === -1) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }
    
    // Check if name already exists (excluding current pokémon)
    const existingPokemon = pokemons.find(p => 
      p.name.toLowerCase() === name.toLowerCase() && p.id !== pokemonId
    );
    if (existingPokemon) {
      return res.status(409).json({ error: 'A Pokémon with this name already exists' });
    }
    
    // Update pokémon
    pokemons[pokemonIndex] = {
      ...pokemons[pokemonIndex],
      name: name.trim(),
      imageUrl: imageUrl?.trim() || '',
      height: height?.toString().trim() || '',
      weight: weight?.toString().trim() || '',
      types: types && types.length > 0 ? types.filter(type => type.trim() !== '') : [],
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(pokemons, null, 2));
    
    res.json(pokemons[pokemonIndex]);
  } catch (error) {
    console.error('Error updating custom pokémon:', error);
    res.status(500).json({ error: 'Failed to update custom pokémon' });
  }
});

// Delete a custom pokémon
app.delete('/api/custom-pokemons/:id', async (req, res) => {
  try {
    const pokemonId = parseInt(req.params.id);
    
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const pokemons = JSON.parse(data);
    
    const pokemonIndex = pokemons.findIndex(p => p.id === pokemonId);
    if (pokemonIndex === -1) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }
    
    pokemons.splice(pokemonIndex, 1);
    await fs.writeFile(DATA_FILE, JSON.stringify(pokemons, null, 2));
    
    res.json({ message: 'Pokémon deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom pokémon:', error);
    res.status(500).json({ error: 'Failed to delete custom pokémon' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  await ensureDataFile();
  app.listen(PORT, () => {
    console.log(`🚀 Pokemon API Backend running on http://localhost:${PORT}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
  });
}

startServer().catch(console.error);