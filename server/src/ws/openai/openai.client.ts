import WebSocket from 'ws';

const OPENAI_REALTIME_URL =
  'wss://api.openai.com/v1/realtime?model=gpt-realtime';

export function createOpenAIClient(apiKey: string) {
  const ws = new WebSocket(OPENAI_REALTIME_URL, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'realtime=v1',
    },
  });

  let isReady = false;
  let isClosed = false;
  const pendingQueue: any[] = [];

  ws.on('open', () => {
    console.log('✅ OpenAI WS opened');
    isReady = true;

    for (const msg of pendingQueue) {
      ws.send(JSON.stringify(msg));
    }
    pendingQueue.length = 0;
  });

  ws.on('close', () => {
    console.log('❌ OpenAI WS closed');
    isClosed = true;
  });

  ws.on('error', (err) => {
    console.error('❌ OpenAI WS error:', err);
  });

  return {
    send(payload: any) {
      if (isClosed) return;

      if (isReady) {
        ws.send(JSON.stringify(payload));
      } else {
        console.log('🟡 Queued until OpenAI opens', payload.type);
        pendingQueue.push(payload);
      }
    },

    close() {
      if (isClosed) return;

      // ❗ Only close if OPEN or CONNECTING intentionally
      ws.close();
      isClosed = true;
    },

    onMessage(cb: (msg: any) => void) {
      ws.on('message', (data) => {
        try {
          cb(JSON.parse(data.toString()));
        } catch (e) {
          console.error('Failed to parse OpenAI message', e);
        }
      });
    },

    isOpen() {
      return isReady;
    },
  };
}
