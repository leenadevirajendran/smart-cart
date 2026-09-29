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
        Map<Long, Map<String, Double>> vectors = buildTfIdfVectors(activeProducts);

        if (!vectors.containsKey(productId)) {
            throw new RuntimeException("Product not found");
        }
        Map<String, Double> targetVector = vectors.get(productId);

        return rankBySimilarity(activeProducts, vectors, targetVector, Set.of(productId), limit);
    }

    /**
     * Builds a "taste profile" by averaging the TF-IDF vectors of every product
     * the buyer has purchased, then ranks the rest of the catalog against that
     * blended vector. Returns an empty list if the buyer has no purchase history
     * with usable text (caller should fall back to trending in that case).
     */
    public List<Product> getPersonalizedSimilarProducts(List<Long> purchasedProductIds, int limit) {
        if (purchasedProductIds.isEmpty()) {
            return List.of();
        }

        List<Product> activeProducts = productRepository.findByActiveTrue();
        Map<Long, Map<String, Double>> vectors = buildTfIdfVectors(activeProducts);

        List<Map<String, Double>> purchasedVectors = purchasedProductIds.stream()
                .map(vectors::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (purchasedVectors.isEmpty()) {
            return List.of();
        }

        Map<String, Double> profileVector = averageVectors(purchasedVectors);
        Set<Long> exclude = new HashSet<>(purchasedProductIds);

        return rankBySimilarity(activeProducts, vectors, profileVector, exclude, limit);
    }

    /** Turns a catalog of products into their TF-IDF vectors, keyed by product id. */
    private Map<Long, Map<String, Double>> buildTfIdfVectors(List<Product> activeProducts) {
        Map<Long, List<String>> tokensByProduct = new HashMap<>();
        for (Product p : activeProducts) {
            tokensByProduct.put(p.getId(), tokenize(buildDocument(p)));
        }

        Map<String, Double> idf = computeIdf(tokensByProduct);

        Map<Long, Map<String, Double>> vectors = new HashMap<>();
        for (Map.Entry<Long, List<String>> entry : tokensByProduct.entrySet()) {
            vectors.put(entry.getKey(), computeTfIdfVector(entry.getValue(), idf));
        }
        return vectors;
    }

    /** Ranks products by cosine similarity to `referenceVector`, excluding a set of ids. */
    private List<Product> rankBySimilarity(
            List<Product> candidates,
            Map<Long, Map<String, Double>> vectors,
            Map<String, Double> referenceVector,
            Set<Long> excludeIds,
            int limit) {

        return candidates.stream()
                .filter(p -> !excludeIds.contains(p.getId()))
                .sorted((a, b) -> Double.compare(
                        cosineSimilarity(referenceVector, vectors.get(b.getId())),
                        cosineSimilarity(referenceVector, vectors.get(a.getId()))
                ))
                .limit(limit)
                .collect(Collectors.toList());
    }

    /** Averages several TF-IDF vectors into one blended "profile" vector. */
    private Map<String, Double> averageVectors(List<Map<String, Double>> vectors) {
        Map<String, Double> sum = new HashMap<>();
        for (Map<String, Double> vector : vectors) {
            vector.forEach((term, weight) -> sum.merge(term, weight, Double::sum));
        }
        int count = vectors.size();
        sum.replaceAll((term, total) -> total / count);
        return sum;
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