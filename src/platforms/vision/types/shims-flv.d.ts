declare module 'flv.js' {
  const flvjs: {
    isSupported(): boolean;
    createPlayer(config: { type: string; url: string; isLive?: boolean }): {
      attachMediaElement(el: HTMLMediaElement): void;
      load(): void;
      play(): Promise<void>;
      destroy(): void;
    };
  };
  export default flvjs;
}
