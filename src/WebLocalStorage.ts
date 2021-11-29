/* eslint-disable class-methods-use-this */
import { Storage } from './types/types'

import { OvertimeStats } from './GameStatsCalculator/types'

export default class WebLocalStorage implements Storage<OvertimeStats> {
  clear(): void {
    localStorage.clear();
  }

  getItem(key: string): OvertimeStats | null {
    function dateReviver(name: string, value: any) {
      if (name === 'start' || name === 'end') {
        return new Date(Date.parse(value));
      }

      return value;
    }

    let stats: OvertimeStats | null = null;

    try {
      stats = JSON.parse(localStorage.getItem(key) ?? 'null', dateReviver);
    } catch (e) {
      console.log(`Error parsing saved game stats: ${e}`);
    }

    return stats;
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }
}