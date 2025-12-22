import WebSocket from 'ws';

const OPENAI_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-realtime';

export function createOpenAIClient() {
  const ws = new WebSocket(OPENAI_URL, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  });

  return {
    send: (payload: any) => ws.send(JSON.stringify(payload)),
    close: () => ws.close(),
    onMessage: (cb: (msg: any) => void) =>
      ws.on('message', (d) => cb(JSON.parse(d.toString()))),
    onClose: (cb: () => void) => ws.on('close', cb),
    isOpen: () => ws.readyState === WebSocket.OPEN,
  };
}
