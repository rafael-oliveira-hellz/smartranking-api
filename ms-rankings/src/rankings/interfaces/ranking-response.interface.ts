export interface RankingResponse {
  player?: string;
  position?: number;
  score?: number;
  matchesHistory?: IHistory;
}

export interface IHistory {
  victories?: number;
  defeats?: number;
}
