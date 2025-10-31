<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" 
        @click="closeModal"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        
        <!-- Modal Content -->
        <Transition name="modal-scale">
          <div v-if="show"
            @click.stop
            class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            
            <!-- Close Button -->
            <button 
              @click="closeModal"
              class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10">
              <span class="material-symbols-outlined text-2xl">close</span>
            </button>

            <!-- Success Animation Container -->
            <div class="pt-12 pb-6 px-8 text-center">
              <!-- Animated Checkmark Circle -->
              <div class="mx-auto w-20 h-20 mb-6 relative">
                <!-- Outer Circle with Scale Animation -->
                <div class="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full animate-scale-in"></div>
                
                <!-- Checkmark with Draw Animation -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <svg class="w-12 h-12 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none">
                    <path 
                      class="checkmark-path"
                      d="M5 13l4 4L19 7" 
                      stroke="currentColor" 
                      stroke-width="2.5" 
                      stroke-linecap="round" 
                      stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>

              <!-- Success Message -->
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Added to Cart
              </h3>
              
              <!-- Product Name -->
              <p class="text-gray-600 dark:text-gray-300 mb-2">
                <span class="font-semibold text-gray-900 dark:text-white">{{ productName }}</span>
              </p>
              
              <!-- Quantity Badge -->
              <div class="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1.5 mb-6">
                <span class="text-sm text-gray-600 dark:text-gray-300">Quantity:</span>
                <span class="font-bold text-gray-900 dark:text-white">{{ quantity }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
              <button
                @click="closeModal"
                class="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 font-medium
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Continue Shopping
              </button>
              
              <button
                @click="goToCart"
                class="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-bold
                       hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25
                       flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-xl">shopping_cart</span>
                View Cart
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  productName: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['close'])
const router = useRouter()

function closeModal() {
  emit('close')
}

function goToCart() {
  emit('close')
  router.push('/cart')
}

// Auto-close after 5 seconds (optional)
let autoCloseTimer = null
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Clear any existing timer
    if (autoCloseTimer) clearTimeout(autoCloseTimer)
    
    // Set new timer
    autoCloseTimer = setTimeout(() => {
      closeModal()
    }, 5000)
  }
})
</script>

<style scoped>
/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active {
  transition: all 0.3s ease;
}

.modal-scale-leave-active {
  transition: all 0.2s ease;
}

.modal-scale-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Checkmark Animation */
.checkmark-path {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  animation: draw-checkmark 0.45s ease-out 0.3s forwards;
}

@keyframes draw-checkmark {
  to {
    stroke-dashoffset: 0;
  }
}

/* Scale In Animation */
.animate-scale-in {
  animation: scale-in 0.5s ease-out;
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

</style>