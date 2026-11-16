import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";
import { chatWithMenuAPI } from "../api/aiAPI";

const initialMessage = {
  role: "assistant",
  content: "Hi! Tell me what you are craving, like “300 ke andar spicy veg dikha”.",
};

function AIChatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [addingItem, setAddingItem] = useState(null);
  const messagesEndRef = useRef(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (user?.role !== "customer") abortRef.current?.abort();
  }, [user?.role]);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  if (user?.role !== "customer") return null;

  const sendMessage = async (content) => {
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data } = await chatWithMenuAPI(
        {
          messages: nextMessages.slice(-10),
          pincode: localStorage.getItem("pincodeFilter") || undefined,
        },
        { signal: controller.signal },
      );
      if (!mountedRef.current || controller.signal.aborted) return;
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply, items: data.items || [] },
      ]);
    } catch (err) {
      if (!mountedRef.current || controller.signal.aborted) return;
      const message =
        err.response?.status === 429
          ? "AI is busy, try again in a minute"
          : err.response?.data?.message ||
            "AI service is temporarily unavailable. Please try again.";
      setMessages((current) => [
        ...current,
        { role: "assistant", content: message, retryContent: content },
      ]);
    } finally {
      if (mountedRef.current && abortRef.current === controller) {
        setLoading(false);
      }
    }
  };

  const send = (event) => {
    event.preventDefault();
    sendMessage(input.trim());
  };

  const addToCart = async (item, variantIdx = null) => {
    const key = `${item.menuItemId}-${variantIdx ?? "base"}`;
    setAddingItem(key);
    try {
      await API.post(
        "/cart",
        { menuItemId: item.menuItemId, quantity: 1, variantIdx },
        { skipLoader: true },
      );
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: { message: "Added to cart ✓", type: "success" },
        }),
      );
    } catch (err) {
      window.dispatchEvent(
        new CustomEvent("appToast", {
          detail: {
            message: err.response?.data?.message || "Failed to add item",
            type: "error",
          },
        }),
      );
    } finally {
      if (mountedRef.current) setAddingItem(null);
    }
  };

  const closeChat = () => {
    abortRef.current?.abort();
    setLoading(false);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-[60] sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 flex h-[min(620px,calc(100vh-9rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-red-500 px-4 py-3 text-white">
            <div>
              <p className="font-bold">LetsEat AI</p>
              <p className="text-[11px] text-red-100">Menu assistant</p>
            </div>
            <button type="button" onClick={closeChat} className="text-xl" aria-label="Close chatbot">×</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-8" : "mr-4"}>
                <div className={`rounded-xl px-3 py-2 text-sm ${message.role === "user" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                  {message.content}
                </div>
                {message.retryContent && (
                  <button type="button" onClick={() => sendMessage(message.retryContent)} disabled={loading} className="mt-1 text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-40">
                    Retry
                  </button>
                )}
                {message.items?.map((item) => {
                  const selectedId = `variant-${item.menuItemId}`;
                  return (
                    <div key={String(item.menuItemId)} className="mt-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
                      {item.image && <img src={item.image} alt={item.name} className="h-24 w-full rounded-lg object-cover" />}
                      <p className="mt-1 font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.restaurantName} · {item.isVeg ? "Veg" : "Non-veg"} · {item.spiceLevel}</p>
                      {item.variants?.length ? (
                        <select id={selectedId} className="mt-2 w-full rounded-lg border px-2 py-1 text-xs">
                          {item.variants.map((variant, variantIdx) => <option key={variantIdx} value={variantIdx}>{variant.name} · ₹{variant.price}</option>)}
                        </select>
                      ) : <p className="text-sm font-bold text-red-500">₹{item.price}</p>}
                      <button
                        type="button"
                        disabled={addingItem?.startsWith(`${item.menuItemId}-`)}
                        onClick={() => {
                          const selected = document.getElementById(selectedId);
                          const variantIdx = selected ? Number(selected.value) : null;
                          addToCart(item, variantIdx);
                        }}
                        className="mt-2 flex w-full items-center justify-center rounded-lg bg-gray-900 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {addingItem?.startsWith(`${item.menuItemId}-`) && <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                        {addingItem?.startsWith(`${item.menuItemId}-`) ? "Adding…" : "Add to cart"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
            {loading && (
              <div className="mr-4 inline-flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-500">
                <span>typing</span>
                <span className="animate-bounce [animation-delay:-0.3s]">.</span>
                <span className="animate-bounce [animation-delay:-0.15s]">.</span>
                <span className="animate-bounce">.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t p-3">
            <input disabled={loading} value={input} onChange={(e) => setInput(e.target.value.slice(0, 500))} placeholder="Ask about food…" className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:border-red-400 disabled:bg-gray-100" />
            <button type="submit" disabled={loading || !input.trim()} className="rounded-xl bg-red-500 px-3 text-sm font-bold text-white disabled:opacity-40">Send</button>
          </form>
        </div>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-2xl text-white shadow-lg hover:bg-red-600" aria-label="Open AI food assistant">
        🤖
      </button>
    </div>
  );
}

export default AIChatbot;
