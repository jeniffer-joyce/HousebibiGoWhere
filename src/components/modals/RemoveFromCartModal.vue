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

            <!-- Warning Animation Container -->
            <div class="pt-12 pb-6 px-8 text-center">
              <!-- Animated Warning Circle -->
              <div class="mx-auto w-20 h-20 mb-6 relative">
                <!-- Outer Circle with Scale Animation -->
                <div class="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-scale-in"></div>
                
                <!-- Trash Icon with Pulse Animation -->
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="material-symbols-outlined text-5xl text-red-600 dark:text-red-400 animate-icon-pulse">
                    delete
                  </span>
                </div>
              </div>

              <!-- Confirmation Message -->
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Remove Item?
              </h3>
              
              <!-- Product Name -->
              <p class="text-gray-600 dark:text-gray-300 mb-2">
                Are you sure you want to remove
              </p>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                <span class="font-semibold text-gray-900 dark:text-white">{{ productName }}</span>
                <span v-if="quantity > 1"> ({{ quantity }} {{ quantity === 1 ? 'item' : 'items' }})</span>
                <span> from your cart?</span>
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
              <button
                @click="closeModal"
                class="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 font-medium
                       hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              
              <button
                @click="confirmRemove"
                class="flex-1 px-6 py-3 rounded-lg bg-red-600 text-white font-bold
                       hover:bg-red-700 transition-colors shadow-lg shadow-red-600/25
                       flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-xl">delete</span>
                Remove
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
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

const emit = defineEmits(['close', 'confirm'])

function closeModal() {
  emit('close')
}

function confirmRemove() {
  emit('confirm')
  emit('close')
}
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

/* Icon Pulse Animation */
.animate-icon-pulse {
  animation: icon-pulse 0.6s ease-out;
}

@keyframes icon-pulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
    opacity: 1;
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