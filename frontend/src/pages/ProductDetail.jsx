import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { addToCart } from '../services/cartService';
import { addToWishlist } from '../services/wishlistService';
import { getProductReviews, getReviewSummary, addReview } from '../services/reviewService';
import { getProductColor, getProductInitial } from '../utils/productImage';
import { getRelatedProducts } from '../services/productService';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    fetchAll();
  }, [id]);

const fetchAll = async () => {
  setLoading(true);
  try {
    const [productRes, reviewsData, summaryData, relatedData] = await Promise.all([
      api.get(`/products/${id}`),
      getProductReviews(id),
      getReviewSummary(id),
      getRelatedProducts(id, 4),
    ]);
    setProduct(productRes.data);
    setReviews(reviewsData);
    setSummary(summaryData);
    setRelated(relatedData);
  } catch (err) {
    console.error('Failed to load product detail', err);
  } finally {
    setLoading(false);
  }
};

  const handleAddToCart = async () => {
    try {
      await addToCart(id, 1);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Failed to add to cart. Are you logged in as a Buyer?');
    }
  };

  const handleAddToWishlist = async () => {
    try {
      await addToWishlist(id);
      setMessage('Added to wishlist!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage('Failed to add to wishlist.');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addReview(id, rating, comment);
      setComment('');
      setRating(5);
      setMessage('Review submitted!');
      setTimeout(() => setMessage(''), 2000);
      const [reviewsData, summaryData] = await Promise.all([
        getProductReviews(id),
        getReviewSummary(id),
      ]);
      setReviews(reviewsData);
      setSummary(summaryData);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-paper px-8 py-10">
      <div className="max-w-4xl mx-auto">
        <Link to="/products" className="text-sm text-cobalt hover:underline">
          ← Back to Products
        </Link>

        {message && (
          <div className="mt-4 mb-2 px-4 py-2 bg-cobalt/10 text-cobalt rounded-lg text-sm inline-block">
            {message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4 grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square bg-gray-50 overflow-hidden flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="w-full h-full items-center justify-center"
              style={{ display: product.imageUrl ? 'none' : 'flex', backgroundColor: `${getProductColor(product)}1A` }}
            >
              <span className="font-display text-8xl font-bold" style={{ color: getProductColor(product) }}>
                {getProductInitial(product)}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col">
            <h1 className="font-display text-2xl font-bold text-gray-800 mb-1">{product.name}</h1>
            {product.category?.name && (
              <span className="text-xs text-gray-400 uppercase tracking-wide">{product.category.name}</span>
            )}
            <p className="text-gray-500 mb-4">{product.description}</p>
            <p className="font-price text-3xl font-bold text-cobalt mb-3">₹{product.price}</p>

            <div className="flex items-center gap-2 mb-6">
              <span className="text-yellow-500 font-semibold">
                ★ {summary.averageRating?.toFixed ? summary.averageRating.toFixed(1) : summary.averageRating}
              </span>
              <span className="text-gray-400 text-sm">({summary.totalReviews} reviews)</span>
              <span className="text-xs text-gray-400 ml-auto">Stock: {product.stockQuantity}</span>
            </div>

            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-2.5 bg-cobalt text-white rounded-lg text-sm font-medium hover:bg-cobalt-dark transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                ♡ Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Add review form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="font-display text-lg font-semibold text-gray-800 mb-4">Write a Review</h2>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Share your thoughts about this product..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-cobalt text-white rounded-lg text-sm font-medium hover:bg-cobalt-dark disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6 mb-10">
          <h2 className="font-display text-lg font-semibold text-gray-800 mb-4">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 font-semibold">{'★'.repeat(r.rating)}</span>
                    <span className="text-gray-300">{'★'.repeat(5 - r.rating)}</span>
                     <span className="text-sm text-gray-500 ml-1">{r.buyerName}</span>
                  </div>
                  {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related products */}
{related.length > 0 && (
  <div className="mt-10">
    <h2 className="font-display text-lg font-semibold text-gray-800 mb-4">You might also like</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {related.map((p) => (
        <Link
          key={p.id}
          to={`/products/${p.id}`}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div
            className="aspect-square overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: `${getProductColor(p)}1A` }}
          >
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <span
              className="font-display text-4xl font-bold"
              style={{ display: p.imageUrl ? 'none' : 'flex', color: getProductColor(p) }}
            >
              {getProductInitial(p)}
            </span>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-800 truncate">{p.name}</h3>
            <p className="font-price text-sm font-semibold text-cobalt">₹{p.price}</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
}

export default ProductDetail;