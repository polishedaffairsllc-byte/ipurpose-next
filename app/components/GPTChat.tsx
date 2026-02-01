'use client';

/**
 * GPT Chat Component
 * Reusable chat interface with streaming support, typing indicators, and token tracking
 */

import { useState, useRef, useEffect } from 'react';
import { gptClient } from '@/lib/gptClient';
import type { GPTDomain } from '../api/gpt/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number;
  model?: string;
  timestamp: Date;
}

interface GPTChatProps {
  domain: GPTDomain;
  title: string;
  placeholder?: string;
  systemContext?: string;
  temperature?: number;
  maxTokens?: number;
  className?: string;
  hideUsageMeta?: boolean;
  hideHeader?: boolean;
  hideEmptyState?: boolean;
}

export default function GPTChat({
  domain,
  title,
  placeholder = 'Type your message...',
  systemContext,
  temperature,
  maxTokens,
  className = '',
  hideUsageMeta = false,
  hideHeader = false,
  hideEmptyState = false,
}: GPTChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setIsTyping(true);
    setStreamingContent('');

    const assistantMessageId = `assistant-${Date.now()}`;

    try {
      // Call streaming API based on domain
      const streamMethod = {
        soul: gptClient.soulStream.bind(gptClient),
        systems: gptClient.systemsStream.bind(gptClient),
        'ai-tools': gptClient.aiToolsStream.bind(gptClient),
        insights: gptClient.insightsStream.bind(gptClient),
      }[domain];

      await streamMethod(
        userMessage.content,
        {
          onChunk: (chunk) => {
            setIsTyping(false);
            setStreamingContent(prev => prev + chunk);
          },
          onComplete: (data) => {
            setIsStreaming(false);
            setStreamingContent('');
            
            const assistantMessage: Message = {
              id: assistantMessageId,
              role: 'assistant',
              content: streamingContent,
              tokensUsed: data.tokensUsed,
              model: data.model,
              timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
            setTotalTokensUsed(prev => prev + data.tokensUsed);
          },
          onError: (error) => {
            setIsStreaming(false);
            setIsTyping(false);
            setStreamingContent('');
            
            const errorMessage: Message = {
              id: assistantMessageId,
              role: 'assistant',
              content: `Error: ${error.message}`,
              timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
          },
        },
        {
          temperature,
          maxTokens,
        }
      );
    } catch (error) {
      console.error('GPT Chat Error:', error);
      setIsStreaming(false);
      setIsTyping(false);
      setStreamingContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setTotalTokensUsed(0);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {systemContext && (
              <p className="text-sm text-gray-500 mt-1">{systemContext}</p>
            )}
          </div>
          {!hideUsageMeta && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">{totalTokensUsed}</span> tokens used
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !isStreaming && !hideEmptyState && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">Ask a question or share your thoughts...</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
              {!hideUsageMeta && (
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                  {message.tokensUsed && (
                    <span className="ml-2">• {message.tokensUsed} tokens</span>
                  )}
                  {message.model && (
                    <span className="ml-2">• {message.model}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-100 text-gray-900">
              {isTyping ? (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {streamingContent}
                  <span className="inline-block w-1 h-4 ml-1 bg-gray-900 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isStreaming}
            rows={1}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 max-h-32"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? 'Sending...' : 'Send'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
