export type MoveControl = 'forward' | 'backward' | 'left' | 'right' | 'jump';

// Each finger owns its input, so releasing jump or movement cannot stop camera look.
export class TouchInput {
  private held = new Map<number, MoveControl>();
  private look: { id: number; x: number; y: number } | null = null;

  hold(id: number, control: MoveControl) {
    if (this.look?.id === id) return false;
    this.held.set(id, control);
    return true;
  }

  slide(id: number, control: MoveControl) {
    const current = this.held.get(id);
    if (!current || current === 'jump' || control === 'jump' || current === control) return false;
    this.held.set(id, control);
    return true;
  }

  release(id: number) {
    return this.held.delete(id);
  }

  movement() {
    const controls = new Set(this.held.values());
    return {
      forward: controls.has('forward'), backward: controls.has('backward'),
      left: controls.has('left'), right: controls.has('right'), jump: controls.has('jump'),
    };
  }

  startLook(id: number, x: number, y: number) {
    if (this.look || this.held.has(id)) return false;
    this.look = { id, x, y };
    return true;
  }

  moveLook(id: number, x: number, y: number) {
    if (!this.look || this.look.id !== id) return null;
    const delta = { x: x - this.look.x, y: y - this.look.y };
    this.look = { id, x, y };
    return delta;
  }

  endLook(id: number) {
    if (this.look?.id === id) this.look = null;
  }

  reset() {
    this.held.clear();
    this.look = null;
  }
}
