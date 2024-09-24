// src/effects/HaloEffect.js
import * as THREE from 'three';

export default class HaloEffect {
  constructor(options) {
    this.el = options.el;
    this.backgroundColor = options.backgroundColor || 0x1E1E1E;
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.backgroundColor);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
    this.camera.position.z = 1;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.el.appendChild(this.renderer.domElement);

    // Shader Material
    const fragmentShader = `
      uniform vec2 iResolution;
      uniform float iTime;
      // Add your shader code here
      void main() {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        // Example shader effect
        float color = 0.5 + 0.5 * sin(iTime + uv.x * 10.0);
        gl_FragColor = vec4(vec3(color), 1.0);
      }
    `;

    const vertexShader = `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    this.uniforms = {
      iResolution: { value: new THREE.Vector2(this.width, this.height) },
      iTime: { value: 0.0 }
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms
    });

    // Plane Geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.plane = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.plane);

    // Animation Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.uniforms.iTime.value += 0.05;
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.uniforms.iResolution.value.set(this.width, this.height);
  }

  dispose() {
    cancelAnimationFrame(this.animate);
    this.renderer.dispose();
    this.el.removeChild(this.renderer.domElement);
  }
}
