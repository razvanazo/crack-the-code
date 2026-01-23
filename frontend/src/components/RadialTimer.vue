<script setup>
import {ref} from "vue";

// Props
const props = defineProps({
    duration: { type: Number, required: true },
    myClass: {type: String, required: true}
});

// Emits
const emit = defineEmits(["finished"]);

// DOM ref to the circle and svg
const arc = ref(null);
const svgRef = ref(null);
const rectRef = ref(null);
let animationFrameId = null;
const full = 314; // circumference for r = 50

const green = { r: 0, g: 128, b: 0 };
const yellow = { r: 255, g: 255, b: 0 };
const red = { r: 255, g: 0, b: 0 };

function interpolateColor(color1, color2, factor) {
    if (factor < 0) factor = 0;
    if (factor > 1) factor = 1;
    const result = {
        r: Math.round(color1.r + factor * (color2.r - color1.r)),
        g: Math.round(color1.g + factor * (color2.g - color1.g)),
        b: Math.round(color1.b + factor * (color2.b - color1.b))
    };
    return `rgba(${result.r}, ${result.g}, ${result.b}, 0.8)`;
}

// Start animation function
function start(seconds = props.duration) {
    const circle = arc.value;
    const svgElement = svgRef.value;
    const rectElement = rectRef.value;
    if (!circle || !svgElement || !rectElement) return;

    let startTime = Date.now();

    function animate() {
        const now = Date.now();
        let progress = (now - startTime) / (seconds * 1000);
        if (progress > 1) progress = 1;

        circle.style.strokeDashoffset = full - full * progress;

        // Color change logic
        if (progress < 0.5) {
            // Green to Yellow from 0 to 0.5
            const factor = progress * 2;
            rectElement.style.fill = interpolateColor(green, yellow, factor);
        } else if (progress <= 0.75) {
            // Yellow from 0.5 to 0.75
            rectElement.style.fill = `rgba(${yellow.r}, ${yellow.g}, ${yellow.b}, 0.8)`;
        } else {
            // Yellow to Red from 0.75 to 1
            const factor = (progress - 0.75) * 4; // from 0 to 1 in the last quarter
            rectElement.style.fill = interpolateColor(yellow, red, factor);
        }

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            emit("finished");
            svgElement.style.opacity = 0; // Hide when finished
        }
    }

    // Reset before start
    circle.style.strokeDashoffset = full;
    rectElement.style.fill = 'green'; // Initial color
    svgElement.style.opacity = 1; // Ensure it's visible at start

    requestAnimationFrame(animate);
}

function stop() {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    arc.value.style.strokeDashoffset = 0;
    if (rectRef.value) {
        rectRef.value.style.fill = 'black'; // Reset color on stop
    }
    if (svgRef.value) { // Check if svgRef is available
        svgRef.value.style.opacity = 0; // Hide when stopped
    }
}

// Expose method so parent can call it
defineExpose({
    start,
    stop
});
</script>

<template>
    <svg ref="svgRef" class="radial-timer" viewBox="0 0 100 100">
        <defs>
            <mask :id="'radial-mask-' + props.myClass">
                <!-- Background fully opaque -->
                <rect width="100" height="100" fill="white"></rect>

                <!-- The radial transparent arc (will rotate) -->
                <circle
                    ref="arc"
                    id="timer-arc"
                    r="50"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    stroke="black"
                    stroke-width="100"
                    stroke-dasharray="314"
                    stroke-dashoffset="0"
                    transform="rotate(-90,50,50)"
                >
                </circle>
            </mask>
        </defs>
        <!-- Square that will become transparent -->
        <rect ref="rectRef" width="100" height="100" :mask="'url(#radial-mask-' + props.myClass + ')'"></rect>
    </svg>
</template>

<style scoped>
svg.radial-timer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    pointer-events: none;
    width: 8vw;
    height: 8vw;
    border-radius: 20%;
}

@media screen and (max-width: 724px) {
    svg.radial-timer {
        width: 20vw;
        height: 20vw;
    }
}
</style>
