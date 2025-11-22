import { useEffect, useRef, useState, useCallback } from 'react';
import { floatTo16BitPCM, base64ToFloat32Array } from '../utils/audio';

export type LearningItem = 
  | { type: 'note'; id: string; title: string; content: string; tags?: string[] }
  | { type: 'visual'; id: string; chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'mermaid'; data: any; title: string; description?: string }
  | { type: 'code'; id: string; code: string; language: string; explanation?: string }
  | { type: 'slide'; id: string; title: string; bulletPoints: string[] };

export const useVoiceAgent = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [question, setQuestion] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<{input: string, expectedOutput: string}[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [correctedCode, setCorrectedCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // New State for Learning Stream
  const [learningStream, setLearningStream] = useState<LearningItem[]>([]);
  
  // Keep track of the latest visualization for backward compatibility or focused view if needed
  const [visualization, setVisualization] = useState<{
    type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'mermaid';
    data: any;
    title?: string;
    description?: string;
  } | null>(null);

  // Per-card execution state
  const [executionStates, setExecutionStates] = useState<Record<string, { isRunning: boolean; output: string | null; isError: boolean }>>({});

  // Global state for main editor (interview mode)
  const [output, setOutput] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const startSession = useCallback(async (mode: 'interview' | 'tutor', config?: any) => {
    try {
      setStatus('Connecting...');
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('Connected');
        setIsSessionActive(true);
        initAudio();
        
        // Initialize session with mode and config
        ws.send(JSON.stringify({
          type: 'init_session',
          mode,
          config
        }));
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        if (data.event === 'media' && data.media.payload) {
          playAudio(data.media.payload);
          // If we receive audio after submitting, we can assume the response has started
          setIsSubmitting(false);
          setIsRunning(false);
          setAgentState('speaking');
        }

        if (data.type === 'speech_started') {
          setAgentState('listening');
        }

        if (data.type === 'speech_stopped') {
          setAgentState('thinking');
        }

        if (data.type === 'thinking') {
          setAgentState('thinking');
        }

        if (data.type === 'question') {
          setQuestion(data.question);
          setTestCases(data.testCases || []);
          setIsSolved(false);
          setCorrectedCode(null);
          setOutput(null);
        }

        if (data.type === 'question_solved') {
          setIsSolved(true);
        }

        if (data.type === 'correction') {
          setCorrectedCode(data.correctedCode);
          setIsSubmitting(false);
          
          // Add to learning stream as a Code Card
          setLearningStream(prev => [...prev, {
            type: 'code',
            id: Date.now().toString(),
            code: data.correctedCode,
            language: data.language || 'javascript',
            explanation: data.explanation
          }]);
        }

        if (data.type === 'execution_output') {
          if (data.id) {
            // Update specific card state
            setExecutionStates(prev => ({
                ...prev,
                [data.id]: {
                    isRunning: false,
                    output: data.output,
                    isError: data.status === 'error'
                }
            }));
          } else {
            // Global state (interview mode)
            setOutput(data.output);
            setIsError(data.status === 'error');
            setIsRunning(false);
          }
        }

        if (data.type === 'chart') {
          const newVisual = {
            type: data.chartType,
            data: data.data,
            title: data.title,
            description: data.description
          };
          
          setVisualization(newVisual);
          
          // Add to learning stream as a Visual Card
          setLearningStream(prev => [...prev, {
            type: 'visual',
            id: Date.now().toString(),
            chartType: data.chartType,
            data: data.data,
            title: data.title,
            description: data.description
          }]);
        }

        if (data.type === 'diagram') {
            const newVisual = {
              type: 'mermaid' as const,
              data: data.code,
              title: data.title,
              description: data.description
            };
            
            setVisualization(newVisual);
            
            // Add to learning stream as a Visual Card
            setLearningStream(prev => [...prev, {
              type: 'visual',
              id: Date.now().toString(),
              chartType: 'mermaid',
              data: data.code, // Pass code string directly as data
              title: data.title,
              description: data.description
            }]);
        }

        if (data.type === 'note') {
            // Add to learning stream as a Note Card
            setLearningStream(prev => [...prev, {
                type: 'note',
                id: Date.now().toString(),
                title: data.title,
                content: data.content,
                tags: data.tags
            }]);
        }

        if (data.type === 'slide') {
            setLearningStream(prev => [...prev, {
                type: 'slide',
                id: Date.now().toString(),
                title: data.title,
                bulletPoints: data.bulletPoints
            }]);
        }
      };

      ws.onclose = () => {
        setStatus('Disconnected');
        setIsSessionActive(false);
        stopAudio();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('Error');
        setIsSubmitting(false);
        setIsRunning(false);
      };
    } catch (error) {
      console.error('Failed to start session:', error);
      setStatus('Error');
    }
  }, []);

  const stopSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    stopAudio();
    setIsSessionActive(false);
    setStatus('Disconnected');
    setQuestion(null);
    setCorrectedCode(null);
    setOutput(null);
    setIsSubmitting(false);
    setIsRunning(false);
    setAgentState('idle');
    setVisualization(null);
    setLearningStream([]);
    setExecutionStates({});
  }, []);

  const sendCode = useCallback((code: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsSubmitting(true);
      wsRef.current.send(JSON.stringify({
        type: 'submit_code',
        code: code
      }));
    }
  }, []);

  const runCode = useCallback((code: string, id?: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (id) {
        setExecutionStates(prev => ({
            ...prev,
            [id]: { isRunning: true, output: null, isError: false }
        }));
      } else {
        setIsRunning(true);
        setOutput(null);
        setIsError(false);
      }
      
      wsRef.current.send(JSON.stringify({
        type: 'run_code',
        code: code,
        id: id // Pass ID to server so it can echo it back
      }));
    }
  }, []);

  const nextQuestion = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'next_question'
      }));
      setIsSolved(false);
      setCorrectedCode(null);
      setOutput(null);
      setQuestion(null);
      setTestCases([]);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const clearCorrection = useCallback(() => {
    setCorrectedCode(null);
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
            type: 'text_message',
            text: text
        }));
    }
  }, []);

  const updateLearningItem = useCallback((id: string, updates: Partial<LearningItem>) => {
    setLearningStream(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } as LearningItem : item
    ));
  }, []);

  const initAudio = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await audioContext.resume();
      audioContextRef.current = audioContext;
      nextStartTimeRef.current = audioContext.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 24000,
      }});
      const source = audioContext.createMediaStreamSource(stream);
      
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isMutedRef.current && !isSubmittingRef.current) {
          const inputData = e.inputBuffer.getChannelData(0);
          const pcmData = floatTo16BitPCM(inputData);
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
          
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            payload: base64Data
          }));
        }
      };
    } catch (error) {
      console.error('Audio initialization error:', error);
      setStatus('Audio Error');
    }
  };

  const stopAudio = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const playAudio = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) return;

      const float32Data = base64ToFloat32Array(base64Audio);
      const audioBuffer = audioContextRef.current.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;
      if (nextStartTimeRef.current < audioContextRef.current.currentTime) {
        nextStartTimeRef.current = audioContextRef.current.currentTime;
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return {
    isSessionActive,
    status,
    question,
    correctedCode,
    isSubmitting,
    output,
    isRunning,
    executionStates,
    startSession,
    stopSession,
    sendCode,
    runCode,
    clearCorrection,
    isMuted,
    toggleMute,
    isError,
    testCases,
    isSolved,
    nextQuestion,
    agentState,
    visualization,
    setVisualization,
    learningStream,
    sendMessage,
    updateLearningItem
  };
};
