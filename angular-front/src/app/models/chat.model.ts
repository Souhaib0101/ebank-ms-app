export type ChatState =
  | { type: 'SENT'; content: string }
  | { type: 'RESPONSE'; content: string; complete: boolean }
  | { type: 'ERROR'; content: string; errorMessage: string };
