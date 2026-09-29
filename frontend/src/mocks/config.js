export const MOCK_LATENCY_MS = process.env.REACT_APP_MOCK_LATENCY === undefined
    ? 250
    : Number(process.env.REACT_APP_MOCK_LATENCY);
