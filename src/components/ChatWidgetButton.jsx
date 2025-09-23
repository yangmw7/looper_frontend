// src/components/ChatWidgetButton.jsx
export default function ChatWidgetButton({ onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="fixed bottom-5 right-5 w-14 h-14 bg-orange-500 text-white 
                 rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition"
    >
      💬
    </button>
  );
}
