export const ParticlesConfig = {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#006400" },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 3, random: true },
        move: { enable: true, speed: 2, direction: "none", random: true }
    },
    interactivity: {
        events: { onhover: { enable: true, mode: "repulse" } }
    }
};