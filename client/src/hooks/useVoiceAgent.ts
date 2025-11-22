import { useEffect, useRef, useState, useCallback } from 'react';
import { floatTo16BitPCM, base64ToFloat32Array } from '../utils/audio';

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

  // ... existing code ...


  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const startSession = useCallback(async () => {
    try {
      setStatus('Connecting...');
      const ws = new WebSocket('ws://localhost:8080');
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus('Connected');
        setIsSessionActive(true);
        initAudio();
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
        }

        if (data.type === 'execution_output') {
          setOutput(data.output);
          setIsError(data.status === 'error');
          setIsRunning(false);
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

  const runCode = useCallback((code: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsRunning(true);
      setOutput(null);
      setIsError(false);
      wsRef.current.send(JSON.stringify({
        type: 'run_code',
        code: code
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
    agentState
  };
};
