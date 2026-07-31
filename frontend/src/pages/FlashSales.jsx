import { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getActiveFlashSales, buyFlashSaleItem, getFlashSaleStock } from '../services/flashSaleService';
import { getProductColor, getProductInitial } from '../utils/productImage';

function FlashSales() {
  const [flashSales, setFlashSales] = useState([]);
  const [liveStock, setLiveStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const stompClientRef = useRef(null);

  useEffect(() => {
    fetchFlashSales();
    connectWebSocket();

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const fetchFlashSales = async () => {
    try {
      const data = await getActiveFlashSales();
      setFlashSales(data);

      const stockEntries = await Promise.all(
        data.map(async (sale) => {
          try {
            const stockData = await getFlashSaleStock(sale.id);
            return [sale.id, stockData.remainingStock];
          } catch (err) {
            console.error(`Failed to fetch stock for sale ${sale.id}`, err);
            return [sale.id, null];
          }
        })
      );

      const initialStock = Object.fromEntries(stockEntries);
      setLiveStock(initialStock);
    } catch (err) {
      console.error('Failed to fetch flash sales', err);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('WebSocket connected');
      },
    });
    client.activate();
    stompClientRef.current = client;
  };

  useEffect(() => {
    if (flashSales.length === 0 || !stompClientRef.current) return;

    const client = stompClientRef.current;

    const trySubscribe = () => {
      if (client.connected) {
        flashSales.forEach((sale) => {
          client.subscribe(`/topic/stock/${sale.product.id}`, (message) => {
            const data = JSON.parse(message.body);
            setLiveStock((prev) => ({
              ...prev,
              [sale.id]: data.remainingStock,
            }));
          });
        });
      } else {
        setTimeout(trySubscribe, 300);
      }
    };

    trySubscribe();
  }, [flashSales]);

  const handleBuyNow = async (flashSaleId) => {
    if (!shippingAddress.trim()) {
      setMessage('Please enter a shipping address before buying.');
      return;
    }
    try {
      await buyFlashSaleItem(flashSaleId, shippingAddress);
      setMessage('Purchase successful! Check your Orders page.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Purchase failed. Item may be sold out.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <p className="text-gray-500">Loading flash sales...</p>
      </div>
    );
  }

  if (flashSales.length === 0) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-paper">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">No active flash sales right now</p>
          <p className="text-gray-400 text-sm">Check back soon for limited-time deals!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-paper px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 bg-coral rounded-full animate-pulse"></span>
          <h1 className="font-display text-3xl font-bold text-gray-800">Flash Sales</h1>
        </div>
        <p className="text-gray-500 mb-6">Limited time. Limited stock. Live updates.</p>

        {message && (
          <div className="mb-6 px-4 py-2 bg-cobalt/10 text-cobalt rounded-lg text-sm inline-block">
            {message}
          </div>
        )}

        <div className="mb-6 max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shipping Address (for purchases)
          </label>
          <input
            type="text"
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Enter your shipping address"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales.map((sale) => {
            const stock = liveStock[sale.id];
            const soldOut = stock === 0;

            return (
              <div
                key={sale.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative"
              >
                <span className="absolute top-3 right-3 z-10 bg-coral text-white text-xs font-bold px-3 py-1 rounded-full">
                  FLASH SALE
                </span>

                <div
                  className="aspect-square overflow-hidden flex items-center justify-center"
                  style={{ backgroundColor: `${getProductColor(sale.product)}1A` }}
                >
                  {sale.product.imageUrl ? (
                    <img
                      src={sale.product.imageUrl}
                      alt={sale.product.name}
                      className="w-full h-full object-contain"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <span
                    className="font-display text-6xl font-bold"
                    style={{ display: sale.product.imageUrl ? 'none' : 'flex', color: getProductColor(sale.product) }}
                  >
                    {getProductInitial(sale.product)}
                  </span>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {sale.product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 flex-1">{sale.product.description}</p>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-price text-xl font-bold text-coral">₹{sale.flashPrice}</span>
                    <span className="font-price text-sm text-gray-400 line-through">₹{sale.product.price}</span>
                  </div>

                  <p className="text-sm mb-4">
                    {stock === null || stock === undefined ? (
                      <span className="text-gray-400">Loading stock...</span>
                    ) : soldOut ? (
                      <span className="text-red-600 font-semibold">Sold out</span>
                    ) : (
                      <span className="text-signal font-semibold">{stock} left in stock</span>
                    )}
                  </p>

                  <button
                    onClick={() => handleBuyNow(sale.id)}
                    disabled={soldOut}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      soldOut
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-coral text-white hover:opacity-90'
                    }`}
                  >
                    {soldOut ? 'Sold Out' : 'Buy Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FlashSales;