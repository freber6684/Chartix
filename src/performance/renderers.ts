export interface AcceleratedPoint {
  x: number;
  y: number;
  size?: number;
}

/** Small bundled WebGL adapter for high-volume normalized point clouds. */
export class WebGLPointRenderer {
  private readonly gl: WebGLRenderingContext | WebGL2RenderingContext;
  private readonly program: WebGLProgram;
  private readonly buffer: WebGLBuffer;

  public constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) throw new Error('Chartix: WebGL is unavailable.');
    this.gl = gl;
    const vertex = this.compile(
      gl.VERTEX_SHADER,
      'attribute vec2 p; attribute float s; void main(){gl_Position=vec4(p,0.,1.);gl_PointSize=s;}',
    );
    const fragment = this.compile(
      gl.FRAGMENT_SHADER,
      'precision mediump float; uniform vec4 c; void main(){gl_FragColor=c;}',
    );
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    if (!program || !buffer) throw new Error('Chartix: WebGL resources could not be created.');
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(`Chartix: ${gl.getProgramInfoLog(program) ?? 'WebGL link failed.'}`);
    this.program = program;
    this.buffer = buffer;
  }

  public render(
    points: readonly AcceleratedPoint[],
    color: [number, number, number, number] = [0.39, 0.36, 1, 1],
  ): void {
    const gl = this.gl;
    const values = new Float32Array(points.flatMap((point) => [point.x, point.y, point.size ?? 3]));
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, values, gl.DYNAMIC_DRAW);
    const position = gl.getAttribLocation(this.program, 'p');
    const size = gl.getAttribLocation(this.program, 's');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 12, 0);
    gl.enableVertexAttribArray(size);
    gl.vertexAttribPointer(size, 1, gl.FLOAT, false, 12, 8);
    gl.uniform4fv(gl.getUniformLocation(this.program, 'c'), color);
    gl.drawArrays(gl.POINTS, 0, points.length);
  }

  public destroy(): void {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
  }

  private compile(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error('Chartix: WebGL shader could not be created.');
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
      throw new Error(`Chartix: ${this.gl.getShaderInfoLog(shader) ?? 'WebGL compile failed.'}`);
    return shader;
  }
}

/** Transfer a canvas to a supplied worker and send serializable render messages. */
export class OffscreenWorkerAdapter<T = unknown> {
  private readonly worker: Worker;

  public constructor(canvas: HTMLCanvasElement, worker: Worker) {
    if (!canvas.transferControlToOffscreen)
      throw new Error('Chartix: OffscreenCanvas is unavailable.');
    this.worker = worker;
    const offscreen = canvas.transferControlToOffscreen();
    worker.postMessage({ type: 'chartix:init', canvas: offscreen }, [offscreen]);
  }

  public render(payload: T): void {
    this.worker.postMessage({ type: 'chartix:render', payload });
  }

  public destroy(): void {
    this.worker.postMessage({ type: 'chartix:destroy' });
    this.worker.terminate();
  }
}
