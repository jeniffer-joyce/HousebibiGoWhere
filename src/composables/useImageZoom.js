import { ref, onMounted, onUnmounted } from 'vue';

export function useImageZoom() {
    const showImageModal = ref(false);
    const selectedImage = ref('');
    const zoomLevel = ref(1);
    const panX = ref(0);
    const panY = ref(0);
    const isPanning = ref(false);
    const startX = ref(0);
    const startY = ref(0);

    const openImageModal = (image) => {
        selectedImage.value = image;
        showImageModal.value = true;
        resetZoom();

        // Get scrollbar width before hiding overflow
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Prevent body scroll and compensate for scrollbar width
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
    };

    const closeImageModal = () => {
        showImageModal.value = false;
        selectedImage.value = '';
        resetZoom();

        // Restore body scroll and remove padding
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    };
    
    const zoomIn = () => {
        zoomLevel.value = Math.min(zoomLevel.value + 0.25, 5);
    };

    const zoomOut = () => {
        zoomLevel.value = Math.max(zoomLevel.value - 0.25, 0.5);
        if (zoomLevel.value === 1) {
            panX.value = 0;
            panY.value = 0;
        }
    };

    const resetZoom = () => {
        zoomLevel.value = 1;
        panX.value = 0;
        panY.value = 0;
        isPanning.value = false;
    };

    const handleWheel = (e) => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomLevel.value = Math.min(Math.max(zoomLevel.value + delta, 0.5), 5);

        if (zoomLevel.value === 1) {
            panX.value = 0;
            panY.value = 0;
        }
    };

    const startPan = (e) => {
        if (zoomLevel.value > 1) {
            isPanning.value = true;
            startX.value = e.clientX - panX.value;
            startY.value = e.clientY - panY.value;
        }
    };

    const handlePan = (e) => {
        if (isPanning.value && zoomLevel.value > 1) {
            panX.value = (e.clientX - startX.value) / zoomLevel.value;
            panY.value = (e.clientY - startY.value) / zoomLevel.value;
        }
    };

    const endPan = () => {
        isPanning.value = false;
    };

    // Close modal with Escape key
    onMounted(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showImageModal.value) {
                closeImageModal();
            }
        };
        window.addEventListener('keydown', handleEscape);

        onUnmounted(() => {
            window.removeEventListener('keydown', handleEscape);
        });
    });

    return {
        // State
        showImageModal,
        selectedImage,
        zoomLevel,
        panX,
        panY,
        isPanning,

        // Methods
        openImageModal,
        closeImageModal,
        zoomIn,
        zoomOut,
        resetZoom,
        handleWheel,
        startPan,
        handlePan,
        endPan
    };
}