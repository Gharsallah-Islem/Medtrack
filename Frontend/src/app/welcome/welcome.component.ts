import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as AOS from 'aos';
import VanillaTilt from 'vanilla-tilt';
import { gsap } from 'gsap';

// Declare THREE globally since we're loading it from a CDN
declare const THREE: any;

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class WelcomeComponent implements OnInit, AfterViewInit, OnDestroy {
  isDarkMode = false;
  private scenes: any[] = [];
  private cameras: any[] = [];
  private renderers: any[] = [];
  private controls: any[] = [];
  private animationFrameIds: number[] = [];
  private currentTestimonial = 0;
  private testimonialInterval: any;

  constructor(private router: Router) {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode ? JSON.parse(savedMode) : false;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  ngOnInit(): void {
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: true,
    });
  }

  ngAfterViewInit(): void {
    const tiltElements = Array.from(document.querySelectorAll('[data-tilt]')) as HTMLElement[];
    VanillaTilt.init(tiltElements, {
      max: 15,
      speed: 400,
      glare: true,
      'max-glare': 0.5,
    });

    this.loadThreeJS(() => {
      this.loadOrbitControls(() => {
        if (this.isWebGLSupported()) {
          this.initHeroScene();
          this.initFeatureScenes();
          this.initTestimonialScene();
        } else {
          // Hide canvases if WebGL not supported
          const canvases = document.querySelectorAll('canvas');
          canvases.forEach(canvas => canvas.style.display = 'none');
        }
        this.observeCounters();
        this.startTestimonialSlider();
        gsap.from('.hero-content h1', { opacity: 0, y: 50, duration: 1, delay: 0.5 });
        gsap.from('.hero-content p', { opacity: 0, y: 30, duration: 1, delay: 0.7 });
        gsap.from('.hero-btn', { opacity: 0, scale: 0.8, duration: 1, delay: 0.9 });
      });
    });
  }

  ngOnDestroy(): void {
    this.animationFrameIds.forEach(id => cancelAnimationFrame(id));
    this.renderers.forEach(renderer => renderer.dispose());
    this.controls.forEach(control => control.dispose());
    clearInterval(this.testimonialInterval);
    this.scenes = [];
    this.cameras = [];
    this.renderers = [];
    this.controls = [];
    this.animationFrameIds = [];
  }

  private isWebGLSupported(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  private loadThreeJS(callback: () => void): void {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@0.153.0/build/three.min.js';
    script.onload = () => callback();
    script.onerror = () => console.error('Failed to load Three.js from CDN');
    document.head.appendChild(script);
  }

  private loadOrbitControls(callback: () => void): void {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/three@0.153.0/examples/jsm/controls/OrbitControls.js';
    script.onload = () => callback();
    script.onerror = () => console.error('Failed to load OrbitControls from CDN');
    document.head.appendChild(script);
  }

  initHeroScene(): void {
    const canvas = document.getElementById('hero-3d-canvas') as HTMLCanvasElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0, 0, 10);
    this.scenes.push(scene);
    this.cameras.push(camera);
    this.renderers.push(renderer);

    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      colors[i * 3] = this.isDarkMode ? 0.4 : 0.2;
      colors[i * 3 + 1] = this.isDarkMode ? 0.8 : 0.5;
      colors[i * 3 + 2] = this.isDarkMode ? 0.4 : 0.2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const helixGroup = new THREE.Group();
    const radius = 1;
    const height = 10;
    const segments = 100;
    const points: any[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 4;
      const x = radius * Math.cos(theta);
      const y = (i / segments) * height - height / 2;
      const z = radius * Math.sin(theta);
      points.push(new THREE.Vector3(x, y, z));
    }

    const helixGeometry1 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, 0.05, 8);
    const helixGeometry2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(-p.x, p.y, -p.z))), segments, 0.05, 8);
    const helixMaterial = new THREE.MeshPhongMaterial({ color: this.isDarkMode ? 0x32CD32 : 0x228B22, shininess: 100 });
    const helix1 = new THREE.Mesh(helixGeometry1, helixMaterial);
    const helix2 = new THREE.Mesh(helixGeometry2, helixMaterial);
    helixGroup.add(helix1, helix2);

    for (let i = 0; i < segments; i += 2) {
      const y = (i / segments) * height - height / 2;
      const theta = (i / segments) * Math.PI * 4;
      const x1 = radius * Math.cos(theta);
      const z1 = radius * Math.sin(theta);
      const x2 = -x1;
      const z2 = -z1;
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y, z1),
        new THREE.Vector3(x2, y, z2),
      ]);
      const line = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true }));
      helixGroup.add(line);
    }

    scene.add(helixGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(ambientLight, pointLight);

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const animate = () => {
      const id = requestAnimationFrame(animate);
      this.animationFrameIds.push(id);

      particles.rotation.y += 0.001;
      helixGroup.rotation.y += 0.005;
      helixGroup.rotation.x = mouseY * 0.5;
      helixGroup.rotation.y += mouseX * 0.5;
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
  }

  initFeatureScenes(): void {
    const icons = [
      { id: 'feature-bell', geometry: new THREE.SphereGeometry(0.5, 32, 32) },
      { id: 'feature-report', geometry: new THREE.BoxGeometry(0.8, 0.8, 0.8) },
      { id: 'feature-calendar', geometry: new THREE.TorusGeometry(0.5, 0.2, 16, 32) },
    ];

    icons.forEach(icon => {
      const canvas = document.getElementById(icon.id) as HTMLCanvasElement;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      camera.position.set(0, 0, 2);
      this.scenes.push(scene);
      this.cameras.push(camera);
      this.renderers.push(renderer);

      const material = new THREE.MeshPhongMaterial({ color: this.isDarkMode ? 0x32CD32 : 0x228B22, shininess: 100 });
      const mesh = new THREE.Mesh(icon.geometry, material);
      scene.add(mesh);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(2, 2, 2);
      scene.add(ambientLight, pointLight);

      const animate = () => {
        const id = requestAnimationFrame(animate);
        this.animationFrameIds.push(id);

        mesh.rotation.x += 0.02;
        mesh.rotation.y += 0.02;
        renderer.render(scene, camera);
      };
      animate();
    });
  }

  initTestimonialScene(): void {
    const canvas = document.getElementById('testimonial-3d-canvas') as HTMLCanvasElement;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0, 0, 5);
    this.scenes.push(scene);
    this.cameras.push(camera);
    this.renderers.push(renderer);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    this.controls.push(controls);

    const particleCount = 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      colors[i * 3] = this.isDarkMode ? 0.4 : 0.2;
      colors[i * 3 + 1] = this.isDarkMode ? 0.8 : 0.5;
      colors[i * 3 + 2] = this.isDarkMode ? 0.4 : 0.2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const animate = () => {
      const id = requestAnimationFrame(animate);
      this.animationFrameIds.push(id);

      particles.rotation.y += 0.001;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });
  }

  private observeCounters(): void {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        this.animateCounters();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    const statistics = document.querySelector('.statistics');
    if (statistics) {
      observer.observe(statistics);
    }
  }

  animateCounters(): void {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target')!;
      const increment = target / 200;
      let count = 0;

      const updateCounter = () => {
        if (count < target) {
          count += increment;
          counter.textContent = Math.ceil(count).toString();
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toString();
        }
      };
      updateCounter();
    });
  }

  private startTestimonialSlider(): void {
    this.testimonialInterval = setInterval(() => this.nextTestimonial(), 5000);
  }

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  toggleMenu(): void {
    const navLinks = document.getElementById('nav-links');
    if (navLinks) {
      navLinks.classList.toggle('active');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
    document.body.classList.toggle('dark-mode');
    this.updateScenes();
  }

  updateScenes(): void {
    const heroScene = this.scenes[0];
    const helixGroup = heroScene.children.find((child: any) => child.type === 'Group');
    const particleSystem = heroScene.children.find((child: any) => child.type === 'Points');
    const colors = particleSystem.geometry.attributes.color.array;
    for (let i = 0; i < colors.length / 3; i++) {
      colors[i * 3] = this.isDarkMode ? 0.4 : 0.2;
      colors[i * 3 + 1] = this.isDarkMode ? 0.8 : 0.5;
      colors[i * 3 + 2] = this.isDarkMode ? 0.4 : 0.2;
    }
    particleSystem.geometry.attributes.color.needsUpdate = true;
    helixGroup.children.forEach((child: any) => {
      if (child.type === 'Mesh') {
        const material = child.material;
        if (Array.isArray(material)) {
          material.forEach((mat: any) => {
            if (mat.type === 'MeshPhongMaterial') {
              mat.color.set(this.isDarkMode ? 0x32CD32 : 0x228B22);
            }
          });
        } else if (material.type === 'MeshPhongMaterial') {
          material.color.set(this.isDarkMode ? 0x32CD32 : 0x228B22);
        }
      }
    });

    for (let i = 1; i <= 3; i++) {
      const scene = this.scenes[i];
      const mesh = scene.children.find((child: any) => child.type === 'Mesh');
      if (mesh) {
        const material = mesh.material;
        if (Array.isArray(material)) {
          material.forEach((mat: any) => {
            if (mat.type === 'MeshPhongMaterial') {
              mat.color.set(this.isDarkMode ? 0x32CD32 : 0x228B22);
            }
          });
        } else if (material.type === 'MeshPhongMaterial') {
          material.color.set(this.isDarkMode ? 0x32CD32 : 0x228B22);
        }
      }
    }

    const testimonialScene = this.scenes[this.scenes.length - 1];
    const particles = testimonialScene.children.find((child: any) => child.type === 'Points');
    const particleColors = particles.geometry.attributes.color.array;
    for (let i = 0; i < particleColors.length / 3; i++) {
      particleColors[i * 3] = this.isDarkMode ? 0.4 : 0.2;
      particleColors[i * 3 + 1] = this.isDarkMode ? 0.8 : 0.5;
      particleColors[i * 3 + 2] = this.isDarkMode ? 0.4 : 0.2;
    }
    particles.geometry.attributes.color.needsUpdate = true;
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    const navLinks = document.getElementById('nav-links');
    if (navLinks && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
    }
  }

  nextTestimonial(): void {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards[this.currentTestimonial].classList.remove('active');
    this.currentTestimonial = (this.currentTestimonial + 1) % testimonialCards.length;
    testimonialCards[this.currentTestimonial].classList.add('active');
  }

  prevTestimonial(): void {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards[this.currentTestimonial].classList.remove('active');
    this.currentTestimonial = (this.currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
    testimonialCards[this.currentTestimonial].classList.add('active');
  }
}