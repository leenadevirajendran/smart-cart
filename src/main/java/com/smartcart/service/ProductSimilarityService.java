package com.smartcart.service;

import com.smartcart.model.Product;
import com.smartcart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Content-based product recommendations using TF-IDF + cosine similarity.
 *
 * Unlike RecommendationService.getRelatedProducts() (which just matches category IDs),
 * this engine looks at the actual words in each product's name/description/category
 * and finds products that are closest in that weighted "bag of words" sense —
 * even across categories, if the wording overlaps strongly.
 */
@Service
@RequiredArgsConstructor
public class ProductSimilarityService {

    private final ProductRepository productRepository;

    private static final Set<String> STOPWORDS = Set.of(
            "the", "a", "an", "and", "or", "is", "are", "for", "with", "this", "that",
            "of", "in", "to", "on", "it", "its", "your", "you", "from", "by", "at",
            "be", "as", "was", "were", "has", "have", "had", "will", "can", "not"
    );

    private static final Pattern TOKEN_PATTERN = Pattern.compile("[^a-zA-Z0-9]+");

    /** Returns the `limit` products most similar to `productId`, most similar first. */
    public List<Product> getSimilarProducts(Long productId, int limit) {
        List<Product> activeProducts = productRepository.findByActiveTrue();

        Product target = activeProducts.stream()
                .filter(p -> p.getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Step 1: turn every product into a list of cleaned tokens
        Map<Long, List<String>> tokensByProduct = new HashMap<>();
        for (Product p : activeProducts) {
            tokensByProduct.put(p.getId(), tokenize(buildDocument(p)));
        }

        // Step 2: compute IDF for every term across the whole catalog
        Map<String, Double> idf = computeIdf(tokensByProduct);

        // Step 3: compute a TF-IDF vector for every product
        Map<Long, Map<String, Double>> vectors = new HashMap<>();
        for (Map.Entry<Long, List<String>> entry : tokensByProduct.entrySet()) {
            vectors.put(entry.getKey(), computeTfIdfVector(entry.getValue(), idf));
        }

        // Step 4: rank every other product by cosine similarity to the target
        Map<String, Double> targetVector = vectors.get(productId);

        return activeProducts.stream()
                .filter(p -> !p.getId().equals(productId))
                .sorted((a, b) -> Double.compare(
                        cosineSimilarity(targetVector, vectors.get(b.getId())),
                        cosineSimilarity(targetVector, vectors.get(a.getId()))
                ))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private String buildDocument(Product p) {
        String categoryName = p.getCategory() != null ? p.getCategory().getName() : "";
        return p.getName() + " " + p.getDescription() + " " + categoryName;
    }

    private List<String> tokenize(String text) {
        return Arrays.stream(TOKEN_PATTERN.split(text.toLowerCase()))
                .filter(t -> t.length() > 2 && !STOPWORDS.contains(t))
                .collect(Collectors.toList());
    }

    /** IDF(term) = ln( totalDocuments / (1 + numDocumentsContainingTerm) ) */
    private Map<String, Double> computeIdf(Map<Long, List<String>> tokensByProduct) {
        int totalDocs = tokensByProduct.size();
        Map<String, Integer> docFrequency = new HashMap<>();

        for (List<String> tokens : tokensByProduct.values()) {
            for (String term : new HashSet<>(tokens)) { // count each term once per doc
                docFrequency.merge(term, 1, Integer::sum);
            }
        }

        Map<String, Double> idf = new HashMap<>();
        for (Map.Entry<String, Integer> entry : docFrequency.entrySet()) {
            idf.put(entry.getKey(), Math.log((double) totalDocs / (1 + entry.getValue())));
        }
        return idf;
    }

    /** TF-IDF(term, doc) = (count of term in doc / total terms in doc) * IDF(term) */
    private Map<String, Double> computeTfIdfVector(List<String> tokens, Map<String, Double> idf) {
        Map<String, Double> tf = new HashMap<>();
        for (String term : tokens) {
            tf.merge(term, 1.0, Double::sum);
        }

        Map<String, Double> vector = new HashMap<>();
        int totalTerms = Math.max(tokens.size(), 1);
        for (Map.Entry<String, Double> entry : tf.entrySet()) {
            double termFrequency = entry.getValue() / totalTerms;
            vector.put(entry.getKey(), termFrequency * idf.getOrDefault(entry.getKey(), 0.0));
        }
        return vector;
    }

    /** cosine similarity = dot(A,B) / (||A|| * ||B||) */
    private double cosineSimilarity(Map<String, Double> a, Map<String, Double> b) {
        Set<String> sharedTerms = new HashSet<>(a.keySet());
        sharedTerms.retainAll(b.keySet());

        double dotProduct = 0.0;
        for (String term : sharedTerms) {
            dotProduct += a.get(term) * b.get(term);
        }

        double normA = Math.sqrt(a.values().stream().mapToDouble(v -> v * v).sum());
        double normB = Math.sqrt(b.values().stream().mapToDouble(v -> v * v).sum());

        if (normA == 0 || normB == 0) return 0.0;
        return dotProduct / (normA * normB);
    }
}