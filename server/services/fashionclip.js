// Image embeddings via Jina CLIP v2 — 1024-dim, supports image URLs directly
const axios = require('axios')

async function getImageEmbedding(imageUrl) {
  const res = await axios.post(
    'https://api.jina.ai/v1/embeddings',
    {
      model: 'jina-clip-v2',
      input: [{ image: imageUrl }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )

  const embedding = res.data.data[0].embedding
  return embedding
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}

module.exports = { getImageEmbedding, cosineSimilarity }
