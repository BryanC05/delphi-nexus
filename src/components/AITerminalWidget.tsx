import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { playClickSound } from '@/shared/soundUtils';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type AITerminalWidgetProps = {
  isOpen: boolean;
  onClose: () => void;
  contextData?: string;
  onCommand?: (cmd: string, arg: string) => boolean;
};

const AITerminalWidget: React.FC<AITerminalWidgetProps> = ({ isOpen, onClose, contextData, onCommand }) => {
  const modelName = import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-20b';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'DATA UPLINK ESTABLISHED. WELCOME TO THE TERMINAL.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    playClickSound();
    const userMsg = input.trim();
    setInput('');

    if (userMsg.startsWith('/') && onCommand) {
      const [cmd, ...rest] = userMsg.split(' ');
      const handled = onCommand(cmd, rest.join(' '));
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userMsg },
        {
          role: 'system',
          content: handled ? `Command executed: ${cmd}` : `Unknown or invalid command: ${cmd}`,
        },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey) {
        throw new Error('API Key missing. Check .env file.');
      }

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: modelName,
          messages: [
            { role: 'system', content: `You are a highly advanced system AI. Keep answers concise, clear, and professional. You now have access to specialized INDONESIA DATA LINKS (CNN Indonesia, CNBC Indonesia). CURRENT DASHBOARD DATA: ${contextData || 'No data available.'}` },
            { role: 'user', content: userMsg }
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'system', content: `ERROR: ${error.response?.data?.error?.message || error.message || 'Connection failed.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ai-sidebar open" role="dialog" aria-modal="true" aria-label="AI terminal">
      <div className="ai-sidebar-header">
        <div className="ai-sidebar-title-container">
          <h3>TERMINAL_AI</h3>
          <span className="api-indicator online">ONLINE</span>
          <span className="ai-model-indicator" title={`Active model: ${modelName}`}>MODEL: {modelName}</span>
        </div>
        <button type="button" onClick={() => { playClickSound(); onClose(); }} className="ai-close-btn" aria-label="Close AI terminal">×</button>
      </div>
      <div className="widget-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '8px', fontFamily: 'var(--font-tech)', fontSize: '0.85rem', lineHeight: '1.4' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '16px', color: msg.role === 'user' ? '#fff' : msg.role === 'system' ? '#fc8181' : 'var(--p3r-blue-light)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ opacity: 0.7, whiteSpace: 'nowrap', fontFamily: 'var(--font-p3r)' }}>{msg.role === 'user' ? 'YOU:' : msg.role === 'assistant' ? 'AI:' : 'SYS:'}</span>
              <div style={{ flexGrow: 1, wordBreak: 'break-word', overflowX: 'hidden' }}>
                {msg.role === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ ...props }) => <span style={{ display: 'block', marginBottom: '8px', marginTop: 0 }} {...props} />,
                      strong: ({ ...props }) => <strong style={{ color: '#fff', textShadow: '0 0 5px rgba(255, 255, 255, 0.5)' }} {...props} />,
                      ul: ({ ...props }) => <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }} {...props} />,
                      ol: ({ ...props }) => <ol style={{ margin: '0 0 8px 0', paddingLeft: '20px' }} {...props} />,
                      li: ({ ...props }) => <li style={{ marginBottom: '4px' }} {...props} />,
                      code: (props: { children?: React.ReactNode; className?: string }) => {
                        const { children, className, ...rest } = props;
                        const isInline = !String(children).includes('\n');
                        return isInline ? (
                          <code style={{ background: 'rgba(0, 240, 255, 0.15)', padding: '2px 4px', borderRadius: '4px' }} {...rest}>
                            {children}
                          </code>
                        ) : (
                          <pre style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '8px', borderRadius: '4px', overflowX: 'auto', margin: '8px 0' }}>
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          </pre>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {isLoading && <div style={{ color: 'var(--accent-color)', opacity: 0.7, fontFamily: 'var(--font-tech)', fontSize: '0.85rem' }}>{'> SYS_AI: Processing...'}</div>}
          <div ref={endOfMessagesRef} />
        </div>
        <form onSubmit={handleSubmit} className="ai-input-form">
          <span className="ai-input-prompt">{'>'}</span>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type your command..."
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};

export default AITerminalWidget;