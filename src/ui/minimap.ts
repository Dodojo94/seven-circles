import { BLOCKS, EXIT_PAD, SHELL } from '../floors/layout';

export interface MapBlip {
  x: number;
  z: number;
}

/**
 * Fixed-north radar. −Z is up (exit), +Z is down (spawn).
 * Walls and the exit are static; the player wedge and imp dots move.
 */
export function initMinimap(): {
  sync(player: { x: number; z: number; yaw: number }, imps: readonly MapBlip[]): void;
} {
  const canvas = document.getElementById('minimap');
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error('#minimap missing');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('minimap context missing');

  const size = canvas.width;
  const pad = 8;
  const span = SHELL + 1.5;
  const inner = size - pad * 2;

  function project(x: number, z: number): { x: number; y: number } {
    return {
      x: pad + ((x + span) / (span * 2)) * inner,
      y: pad + ((z + span) / (span * 2)) * inner,
    };
  }

  function worldSize(length: number): number {
    return (length / (span * 2)) * inner;
  }

  return {
    sync(player, imps): void {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = 'rgba(12, 5, 5, 0.88)';
      ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = '#8b4513';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, size - 2, size - 2);

      ctx.fillStyle = '#5c2828';
      for (const block of BLOCKS) {
        const p = project(block.x, block.z);
        const rw = Math.max(2, worldSize(block.w));
        const rh = Math.max(2, worldSize(block.d));
        ctx.fillStyle = block.crate ? '#7a4030' : '#5c2828';
        ctx.fillRect(p.x - rw / 2, p.y - rh / 2, rw, rh);
      }

      const exit = project(EXIT_PAD.x, EXIT_PAD.z);
      ctx.fillStyle = '#e8a040';
      ctx.beginPath();
      ctx.moveTo(exit.x, exit.y - 5);
      ctx.lineTo(exit.x + 5, exit.y);
      ctx.lineTo(exit.x, exit.y + 5);
      ctx.lineTo(exit.x - 5, exit.y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff4428';
      for (const imp of imps) {
        const p = project(imp.x, imp.z);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      const at = project(player.x, player.z);
      const facing = Math.atan2(-Math.cos(player.yaw), -Math.sin(player.yaw));
      ctx.save();
      ctx.translate(at.x, at.y);
      ctx.rotate(facing);
      ctx.fillStyle = '#fff0c0';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-5, 4.5);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-5, -4.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#a08060';
      ctx.font = '11px Courier New, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('N', size / 2, 14);
    },
  };
}
