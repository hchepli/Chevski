// Fase compartilhada: logo, sombra (e qualquer coisa) flutuam em sincronia
export const BOB_SPEED = 1.3;
export const bob = (t: number) => Math.sin(t * BOB_SPEED); // -1..1
