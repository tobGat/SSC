import { Room } from '../models/Room';
import * as SessionPersistence from './SessionPersistence';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private readonly INACTIVITY_TIMEOUT_MINUTES = 720; // 12 hours

  constructor() {
    // Restore previously saved sessions
    const restored = SessionPersistence.loadAll();
    for (const room of restored) {
      this.rooms.set(room.roomCode, room);
    }
    if (restored.length > 0) {
      console.log(`[RoomManager] Restored ${restored.length} session(s) from disk`);
    }

    // Check every 30 minutes for inactive rooms
    this.cleanupInterval = setInterval(() => this.cleanup(), 30 * 60 * 1000);
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  createRoom(): Room {
    let code = this.generateCode();
    while (this.rooms.has(code)) {
      code = this.generateCode();
    }
    const room = new Room(code);
    this.rooms.set(code, room);
    console.log(`Room created: ${code} (total: ${this.rooms.size})`);
    return room;
  }

  getRoom(code: string): Room | null {
    const room = this.rooms.get(code.toUpperCase()) || null;
    if (room) room.updateActivity();
    return room;
  }

  deleteRoom(code: string): void {
    const upper = code.toUpperCase();
    this.rooms.delete(upper);
    SessionPersistence.remove(upper);
    console.log(`Room deleted: ${code} (total: ${this.rooms.size})`);
  }

  private cleanup(): void {
    const toDelete: string[] = [];
    this.rooms.forEach((room, code) => {
      if (room.getInactiveMinutes() >= this.INACTIVITY_TIMEOUT_MINUTES) {
        toDelete.push(code);
      }
    });
    toDelete.forEach(code => {
      this.deleteRoom(code);
      console.log(`Auto-cleanup: Room ${code} (inactive)`);
    });
  }

  importRoom(data: SessionPersistence.PersistedSession): string {
    let code = data.roomCode;
    if (this.rooms.has(code)) {
      code = this.generateCode();
      while (this.rooms.has(code)) {
        code = this.generateCode();
      }
    }
    const room = SessionPersistence.restoreRoomFromData(data, code);
    this.rooms.set(code, room);
    SessionPersistence.save(room);
    console.log(`Room imported: ${code} (total: ${this.rooms.size})`);
    return code;
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  shutdown(): void {
    clearInterval(this.cleanupInterval);
  }
}
