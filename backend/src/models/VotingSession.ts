import { VotingSession } from '../types/socket-events';
import { SongModel } from './Song';

export class VotingSessionModel implements VotingSession {
  phase: 'submission' | 'presentation' | 'results';
  songs: Map<string, SongModel>;
  currentSongIndex: number;
  presentationOrder: string[];
  connectedStudents: Set<string>;
  votedStudents: Set<string>;

  constructor() {
    this.phase = 'submission';
    this.songs = new Map();
    this.currentSongIndex = -1;
    this.presentationOrder = [];
    this.connectedStudents = new Set();
    this.votedStudents = new Set();
  }

  addSong(title: string, artist: string, link?: string, clientId?: string): SongModel {
    const song = new SongModel(title, artist, link, clientId);
    this.songs.set(song.id, song);
    return song;
  }

  editSong(id: string, title: string, artist: string, link?: string): SongModel | null {
    const song = this.songs.get(id);
    if (!song) return null;

    song.title = title;
    song.artist = artist;
    song.link = link;
    return song;
  }

  deleteSong(id: string): { deleted: boolean; submitterClientId?: string } {
    const song = this.songs.get(id);
    if (!song) return { deleted: false };
    this.songs.delete(id);
    return { deleted: true, submitterClientId: song.submitterClientId };
  }

  startPresentation(): void {
    if (this.songs.size === 0) {
      throw new Error('No songs to present');
    }

    this.phase = 'presentation';
    this.presentationOrder = this.shuffleSongs();
    this.currentSongIndex = 0;
    this.votedStudents.clear();
  }

  private shuffleSongs(): string[] {
    const songIds = Array.from(this.songs.keys());
    // Fisher-Yates shuffle
    for (let i = songIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songIds[i], songIds[j]] = [songIds[j], songIds[i]];
    }
    return songIds;
  }

  getCurrentSong(): SongModel | null {
    if (this.currentSongIndex < 0 || this.currentSongIndex >= this.presentationOrder.length) {
      return null;
    }
    const songId = this.presentationOrder[this.currentSongIndex];
    return this.songs.get(songId) || null;
  }

  nextSong(): boolean {
    this.votedStudents.clear();
    this.currentSongIndex++;

    if (this.currentSongIndex >= this.presentationOrder.length) {
      this.phase = 'results';
      return false;
    }
    return true;
  }

  addVote(songId: string, points: number, studentId: string): boolean {
    if (this.votedStudents.has(studentId)) {
      return false; // Already voted
    }

    const song = this.songs.get(songId);
    if (!song) return false;

    song.addVote(points);
    this.votedStudents.add(studentId);
    return true;
  }

  hasAllVoted(): boolean {
    return this.votedStudents.size >= this.connectedStudents.size && this.connectedStudents.size > 0;
  }

  getRankings(): Array<{ rank: number; song: SongModel }> {
    const songsArray = Array.from(this.songs.values())
      .filter(song => song.averageScore !== undefined)
      .sort((a, b) => {
        if (b.averageScore !== a.averageScore) {
          return (b.averageScore || 0) - (a.averageScore || 0);
        }
        return a.title.localeCompare(b.title);
      });

    return songsArray.map((song, index) => ({
      rank: index + 1,
      song: song,
    }));
  }

  reset(): void {
    this.phase = 'submission';
    this.songs.clear();
    this.currentSongIndex = -1;
    this.presentationOrder = [];
    this.votedStudents.clear();
  }

  addStudent(socketId: string): void {
    this.connectedStudents.add(socketId);
  }

  removeStudent(socketId: string): void {
    this.connectedStudents.delete(socketId);
    this.votedStudents.delete(socketId);
  }
}
