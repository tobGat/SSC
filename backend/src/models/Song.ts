import { Song } from '../types/socket-events';

export class SongModel implements Song {
  id: string;
  title: string;
  artist: string;
  link?: string;
  averageScore?: number;
  votes: number[];
  totalVotes: number;

  constructor(title: string, artist: string, link?: string) {
    this.id = this.generateId();
    this.title = title;
    this.artist = artist;
    this.link = link;
    this.votes = [];
    this.totalVotes = 0;
  }

  private generateId(): string {
    return `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addVote(points: number): void {
    if (points < 1 || points > 10) {
      throw new Error('Votes must be between 1 and 10');
    }
    this.votes.push(points);
    this.totalVotes++;
    this.calculateAverage();
  }

  private calculateAverage(): void {
    if (this.votes.length === 0) {
      this.averageScore = undefined;
      return;
    }
    const sum = this.votes.reduce((a, b) => a + b, 0);
    this.averageScore = parseFloat((sum / this.votes.length).toFixed(2));
  }

  resetVotes(): void {
    this.votes = [];
    this.totalVotes = 0;
    this.averageScore = undefined;
  }

  toJSON(): Song {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      link: this.link,
      averageScore: this.averageScore,
      votes: this.votes,
      totalVotes: this.totalVotes,
    };
  }
}
