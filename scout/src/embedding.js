import { pipeline, matmul } from "@huggingface/transformers";

const MODEL = "onnx-community/embeddinggemma-2-ONNX";
let extractorPromise = null;

export async function loadEmbedder(onProgress) {
  if (!extractorPromise) {
    extractorPromise = pipeline("feature-extraction", MODEL, {
      device: "webgpu",
      dtype: "q4",
      progress_callback: onProgress
    }).catch(async (error) => {
      
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
  const prefix = "task: search result | query: ";
  const output = await extractor(prefix + text, {
    pooling: "mean",
    normalize: true
  });
  return output.tolist()[0];
}

export async function rankByEmbedding(query, products, onProgress) {
  if (!products.length) return [];
  const extractor = await loadEmbedder(onProgress);
  const queryVector = await extractor("task: search result | query: " + query, {
    pooling: "mean",
    normalize: true
  });
  const documents = products.map((p) =>
    "title: none | text: " + (p.name || "") + " |
    [p.supplier, p.description, p.category].filter(Boolean).join(" ")
  );
  const documentVectors = await extractor(documents, {
    pooling: "mean",
    normalize: true
  });
  const scores = matmul(queryVector, documentVectors.transpose()).tolist()[0];
  return products
    .map((product, index) => ({ ...product, embeddingScore: Number(scores[index].toFixed(4)) }))
    .sort((a, b) => b.embeddingScore - a.embeddingScore);
}
