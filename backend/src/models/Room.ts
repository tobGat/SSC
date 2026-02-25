import { VotingSessionModel } from './VotingSession';

export class Room {
  public readonly roomCode: string;
  public readonly session: VotingSessionModel;
  public readonly adminSockets: Set<string>;
  public readonly clientSockets: Map<string, string>; // clientId -> socketId
  public readonly socketClientIds: Map<string, string>; // socketId -> clientId
  public readonly createdAt: Date;
  public lastActivity: Date;

  private password: string | null = null;
  private adminTokens: Set<string> = new Set();

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.session = new VotingSessionModel();
    this.adminSockets = new Set();
    this.clientSockets = new Map();
    this.socketClientIds = new Map();
    this.createdAt = new Date();
    this.lastActivity = new Date();
  }

  updateActivity(): void {
    this.lastActivity = new Date();
  }

  setPassword(pw: string): boolean {
    if (this.password !== null) return false;
    this.password = pw;
    return true;
  }

  verifyPassword(pw: string): boolean {
    if (this.password === null) return false;
    return pw === this.password;
  }

  isPasswordSet(): boolean {
    return this.password !== null;
  }

  generateToken(): string {
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.adminTokens.add(token);
    return token;
  }

  resetAuth(): void {
    this.password = null;
    this.adminTokens.clear();
    this.adminSockets.clear();
  }

  getInactiveMinutes(): number {
    return (Date.now() - this.lastActivity.getTime()) / (1000 * 60);
  }
}
