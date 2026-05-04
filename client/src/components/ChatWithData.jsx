import { useState } from 'react';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { askQuestion } from '../services/api.js';

function ChatWithData({ datasetId, rawSummary }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!question.trim() || (!datasetId && !rawSummary)) return;

    const currentQuestion = question.trim();
    setQuestion('');
    setMessages((items) => [...items, { role: 'user', content: currentQuestion }]);
    setLoading(true);

    try {
      const response = await askQuestion({ datasetId, rawSummary, question: currentQuestion });
      setMessages((items) => [
        ...items,
        { role: 'assistant', content: response.answer || response.analysis?.aiResponse }
      ]);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to answer right now.';
      toast.error(message);
      setMessages((items) => [
        ...items,
        {
          role: 'assistant',
          content: message
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-ink">Chat With Data</h2>
      <div className="mt-4 flex h-80 flex-col gap-3 overflow-y-auto rounded-md bg-stone-50 p-3">
        {messages.length === 0 && (
          <p className="text-sm text-stone-600">Ask about trends, outliers, totals, or columns.</p>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[92%] rounded-md px-3 py-2 text-sm leading-6 ${
              message.role === 'user'
                ? 'ml-auto bg-ocean text-white'
                : 'mr-auto border border-stone-200 bg-white text-stone-700'
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading && <p className="text-sm text-stone-600">Thinking...</p>}
      </div>
      <form className="mt-4 flex gap-2" onSubmit={submit}>
        <input
          className="min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-2 focus:ring-teal-100"
          placeholder="Ask anything about your data..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={!datasetId && !rawSummary}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-ocean px-3 py-2 text-white disabled:bg-stone-300"
          disabled={(!datasetId && !rawSummary) || loading}
          aria-label="Send question"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}

export default ChatWithData;
