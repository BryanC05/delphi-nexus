import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { playClickSound } from './soundUtils';
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
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'DATA UPLINK ESTABLISHED. WELCOME TO THE DARK HOUR.' }
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
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // Check for both keys depending on how it was typed in the .env file
      const apiKey = process.env.REACT_APP_GROQ_API_KEY || process.env.REACT_APP_GROW_API_KEY;

      if (!apiKey) {
        throw new Error('API Key missing. Check .env file.');
      }

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: `You are a highly advanced Persona 3 Reload style AI system. Keep answers concise, bold, and use a P3R/S.E.E.S. terminal tone. Use terms like "Tartarus", "Evoker", "Dark Hour" when appropriate. You now have access to specialized INDONESIA DATA LINKS (CNN Indonesia, CNBC Indonesia). CURRENT DASHBOARD DATA: ${contextData || 'No data available.'}` },
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

  return (
    <div className={`ai-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="ai-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', transform: 'skewX(2deg)' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-p3r)', fontSize: '1.5rem' }}>PERSONA_AI</h3>
          <span className="api-indicator" style={{ marginLeft: '12px', background: 'var(--p3r-blue-light)', color: '#000', border: 'none' }}>ONLINE</span>
        </div>
        <button onClick={() => { playClickSound(); onClose(); }} className="ai-close-btn">×</button>
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
                      p: ({node, ...props}: any) => <span style={{ display: 'block', marginBottom: '8px', marginTop: 0 }} {...props} />,
                      strong: ({node, ...props}: any) => <strong style={{ color: '#fff', textShadow: '0 0 5px rgba(255, 255, 255, 0.5)' }} {...props} />,
                      ul: ({node, ...props}: any) => <ul style={{ margin: '0 0 8px 0', paddingLeft: '20px' }} {...props} />,
                      ol: ({node, ...props}: any) => <ol style={{ margin: '0 0 8px 0', paddingLeft: '20px' }} {...props} />,
                      li: ({node, ...props}: any) => <li style={{ marginBottom: '4px' }} {...props} />,
                      code: (props: any) => {
                        const { children, className, node, ...rest } = props;
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', borderTop: '2px solid var(--p3r-blue-light)', paddingTop: '12px', transform: 'skewX(2deg)' }}>
          <span style={{ color: 'var(--p3r-blue-light)', fontFamily: 'var(--font-p3r)' }}>{'>'}</span>
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            style={{ flexGrow: 1, background: 'transparent', border: 'none', color: '#fff', fontFamily: 'var(--font-tech)', outline: 'none', fontSize: '1.1rem' }}
            placeholder="Type your command..."
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
};

export default AITerminalWidget;