// server/index.js
import express from 'express';
import { createHeliaHTTP } from '@helia/http';
import { json } from '@helia/json';
import { MemoryBlockstore } from 'blockstore-core/memory'; // Import correct

const app = express();
app.use(express.json());

// Configurer un blockstore en mémoire
const blockstore = new MemoryBlockstore();

// Initialiser Helia avec Infura et le blockstore
const helia = createHeliaHTTP({
  blockstore,
  url: 'https://ipfs.infura.io:5001/api/v0',
  headers: {
    Authorization: 'Basic ' + btoa(`${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`),
  },
});
const ipfsJson = json(helia);

app.post('/upload-ipfs', async (req, res) => {
  try {
    const { metadata } = req.body;
    console.log('Received metadata:', metadata);
    const cid = await ipfsJson.add(metadata);
    const metadataURI = `ipfs://${cid.toString()}`;
    console.log('Uploaded to IPFS with CID:', cid.toString());
    res.json({ metadataURI });
  } catch (error) {
    console.error('IPFS upload error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to upload to IPFS', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));