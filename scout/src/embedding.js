import { pipeline } from "@huggingface/transformers";

const MODEL = "onnx-community/embeddinggemma-2-ONNX";
let extractorPromise = null;

export async function loadEmbedder(onProgress) {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL, {
      device: "webgpu",
      dtype: "q4",
      progress_callback: onProgress
    }).catch(async () => {
      extractorPromise = pipeline("feature-extraction", MODEL, {
        device: "wasm",
        dtype: "q4",
        progress_callback: onProgress
      });
      return extractorPromise;
    });
  }
  return extractorPromise;
}

export async function embedText(text, onProgress) {
  const extractor = await loadEmbedder(onProgress);
  const output = await extractor("task: search result | query: " + text, {
    pooling: "mean",
    normalize: true
  });
  return output.tolist()[0];
}

function dot(a, b) {
  let total = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i++) total += a[i] * b[i];
  return total;
}

export async function rankByEmbedding(query, products, onProgress) {
  if (!products.length) return [];

  const extractor = await loadEmbedder(onProgress);

  const queryOutput = await extractor(
    "task: search result | query: " + query,
    { pooling: "mean", normalize: true }
  );

  const queryVector = queryOutput.tolist()[0];

  const documents = products.map((p) =>
    "title: " + (p.name || "") +
    " | supplier: " + (p.supplier || "") +
    " | description: " + (p.description || "") +
    " | category: " + (p.category || "")
  );

  const documentOutput = await extractor(documents, {
    pooling: "mean",
    normalize: true
  });

  const documentVectors = documentOutput.tolist();

  return products
    .map((product, index) => ({
      ...product,
      embeddingScore: Number(
        dot(queryVector, documentVectors[index]).toFixed(4)
      )
    }))
    .sort((a, b) => b.embeddingScore - a.embeddingScore);
}
