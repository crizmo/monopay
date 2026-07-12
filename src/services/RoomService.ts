import { joinRoom, selfId } from 'trystero';
import type { GameState } from '../types';

type StateCallback = (state: GameState) => void;
type PeerJoinCallback = (peerId: string) => void;
type PeerLeaveCallback = (peerId: string) => void;
type JoinRequestCallback = (data: { playerName: string }, peerId: string) => void;
type RejectCallback = (data: { reason: string }) => void;

class RoomService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private room: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private stateUpdate: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private joinRequest: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private rejectJoin: any = null;

  private stateCallbacks: StateCallback[] = [];
  private peerJoinCallbacks: PeerJoinCallback[] = [];
  private peerLeaveCallbacks: PeerLeaveCallback[] = [];
  private joinRequestCallbacks: JoinRequestCallback[] = [];
  private rejectCallbacks: RejectCallback[] = [];

  private currentState: GameState | null = null;
  private _role: 'host' | 'client' | null = null;
  private _roomCode: string = '';

  get role() { return this._role; }
  get roomCode() { return this._roomCode; }
  get isHost() { return this._role === 'host'; }
  get state() { return this.currentState; }

  getSelfId(): string {
    return selfId;
  }

  initHost(roomCode: string): void {
    this.cleanup();
    this._role = 'host';
    this._roomCode = roomCode;

    this.room = joinRoom({ appId: 'com.monopay' }, roomCode);
    this.stateUpdate = this.room.makeAction('state-update');
    this.joinRequest = this.room.makeAction('join-request');
    this.rejectJoin = this.room.makeAction('reject-join');

    this.room.onPeerJoin = (peerId: string) => {
      this.peerJoinCallbacks.forEach((cb) => cb(peerId));
    };

    this.room.onPeerLeave = (peerId: string) => {
      this.peerLeaveCallbacks.forEach((cb) => cb(peerId));
    };

    this.joinRequest.onMessage = (rawData: unknown, meta: { peerId: string }) => {
      const data = rawData as { playerName: string };
      this.joinRequestCallbacks.forEach((cb) => cb(data, meta.peerId));
    };
  }

  initClient(roomCode: string): void {
    this.cleanup();
    this._role = 'client';
    this._roomCode = roomCode;

    this.room = joinRoom({ appId: 'com.monopay' }, roomCode);
    this.stateUpdate = this.room.makeAction('state-update');
    this.joinRequest = this.room.makeAction('join-request');
    this.rejectJoin = this.room.makeAction('reject-join');

    this.stateUpdate.onMessage = (rawData: unknown) => {
      const data = rawData as unknown as GameState;
      this.currentState = data;
      localStorage.setItem('monopay_game_state', JSON.stringify(data));

      const myPlayer = data.players.find((p) => p.peerId === selfId);
      if (myPlayer) {
        localStorage.setItem('monopay_current_player', JSON.stringify(myPlayer));
      }

      this.stateCallbacks.forEach((cb) => cb(data));
    };

    this.rejectJoin.onMessage = (rawData: unknown) => {
      const data = rawData as { reason: string };
      this.rejectCallbacks.forEach((cb) => cb(data));
    };

    this.room.onPeerJoin = (peerId: string) => {
      this.peerJoinCallbacks.forEach((cb) => cb(peerId));
    };

    this.room.onPeerLeave = (peerId: string) => {
      this.peerLeaveCallbacks.forEach((cb) => cb(peerId));
    };
  }

  sendJoinRequest(playerName: string): void {
    this.joinRequest?.send({ playerName });
  }

  sendRejectJoin(reason: string, peerId?: string): void {
    if (peerId) {
      this.rejectJoin?.send({ reason });
    } else {
      this.rejectJoin?.send({ reason });
    }
  }

  broadcastState(state: GameState): void {
    this.currentState = state;
    localStorage.setItem('monopay_game_state', JSON.stringify(state));

    const myPlayer = state.players.find((p) => p.peerId === selfId);
    if (myPlayer) {
      localStorage.setItem('monopay_current_player', JSON.stringify(myPlayer));
    }

    this.stateUpdate?.send(state);
    this.stateCallbacks.forEach((cb) => cb(state));
  }

  onStateUpdate(cb: StateCallback): () => void {
    this.stateCallbacks.push(cb);
    return () => {
      this.stateCallbacks = this.stateCallbacks.filter((c) => c !== cb);
    };
  }

  onPeerJoin(cb: PeerJoinCallback): () => void {
    this.peerJoinCallbacks.push(cb);
    return () => {
      this.peerJoinCallbacks = this.peerJoinCallbacks.filter((c) => c !== cb);
    };
  }

  onPeerLeave(cb: PeerLeaveCallback): () => void {
    this.peerLeaveCallbacks.push(cb);
    return () => {
      this.peerLeaveCallbacks = this.peerLeaveCallbacks.filter((c) => c !== cb);
    };
  }

  onJoinRequest(cb: JoinRequestCallback): () => void {
    this.joinRequestCallbacks.push(cb);
    return () => {
      this.joinRequestCallbacks = this.joinRequestCallbacks.filter((c) => c !== cb);
    };
  }

  onReject(cb: RejectCallback): () => void {
    this.rejectCallbacks.push(cb);
    return () => {
      this.rejectCallbacks = this.rejectCallbacks.filter((c) => c !== cb);
    };
  }

  cleanup(): void {
    this.room?.leave();
    this.room = null;
    this.stateUpdate = null;
    this.joinRequest = null;
    this.rejectJoin = null;
    this.stateCallbacks = [];
    this.peerJoinCallbacks = [];
    this.peerLeaveCallbacks = [];
    this.joinRequestCallbacks = [];
    this.rejectCallbacks = [];
    this.currentState = null;
    this._role = null;
    this._roomCode = '';
  }
}

export const roomService = new RoomService();
export { selfId };
