import * as THREE from 'three';

export default class ParticleWaveEffect {
  constructor(options) {
    this.el = options.el;
    this.backgroundColor = options.backgroundColor || 0x1e1e1e;
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      1,
      4000
    );
    this.camera.position.z = 1000;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.el.appendChild(this.renderer.domElement);

    this.particleCount = 1000;
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const waveAmplitude = 200;
    const waveFrequency = 0.02;

    for (let i = 0; i < this.particleCount; i++) {
      const x = (Math.random() * 2 - 1) * this.width;
      const y = (Math.random() * 2 - 1) * this.height;
      const z = 0;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 3,
      transparent: true,
      opacity: 0.7,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    this.clock = new THREE.Clock();

    this.animate = this.animate.bind(this);
    this.renderer.setAnimationLoop(this.animate);
  }

  animate() {
    const time = this.clock.getElapsedTime();
    const positions = this.geometry.attributes.position.array;

    for (let i = 0; i < this.particleCount; i++) {
      const index = i * 3;
      const x = positions[index];
      const y = positions[index + 1];
      positions[index + 2] =
        Math.sin(x * 0.01 + time) * 50 + Math.sin(y * 0.01 + time) * 50;
    }

    this.geometry.attributes.position.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.renderer.dispose();
    this.el.removeChild(this.renderer.domElement);
  }
}
