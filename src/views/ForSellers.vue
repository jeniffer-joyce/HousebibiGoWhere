<template>
  <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
    <div class="flex flex-col gap-12">
      <!-- Hero Section -->
      <section class="text-center">
        <h2 class="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Turn Your Passion into a Business
        </h2>
        <p class="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Join our community of home-based entrepreneurs and start selling your products and services on HousebibiGoWhere.
        </p>
        <RouterLink :to="{ path: '/signup', query: { role: 'seller' } }">
            <button
                class="mt-8 rounded-lg bg-vibrant-coral dark:bg-primary/10 px-8 py-3 text-lg font-bold dark:text-dark shadow-lg hover:bg-vibrant-coral/90 focus:outline-none focus:ring-2 focus:ring-vibrant-coral focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
                Get Started Today
            </button>
        </RouterLink>
      </section>

      <!-- Why Sell with Us Section -->
      <section>
        <h3 class="mb-6 text-3xl font-bold text-slate-900 dark:text-white text-center">
          Why Sell with Us?
        </h3>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div class="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                ></path>
              </svg>
            </div>
            <h4 class="mt-4 text-xl font-bold">Increased Visibility</h4>
            <p class="mt-2 text-slate-600 dark:text-slate-400">
              Reach a wider audience of buyers actively looking for unique home-based products and services.
            </p>
          </div>

          <div class="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v1h8v-1c0-2.21-1.79-4-4-4zm6 4H6c-1.105 0-2 .895-2 2v2h16v-2c0-1.105-.895-2-2-2z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                ></path>
              </svg>
            </div>
            <h4 class="mt-4 text-xl font-bold">Community Support</h4>
            <p class="mt-2 text-slate-600 dark:text-slate-400">
              Connect with fellow sellers, share experiences, and grow together in a supportive environment.
            </p>
          </div>

          <div class="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                ></path>
              </svg>
            </div>
            <h4 class="mt-4 text-xl font-bold">Business Tools</h4>
            <p class="mt-2 text-slate-600 dark:text-slate-400">
              Utilize our platform's tools to manage your listings, orders, and customer communication seamlessly.
            </p>
          </div>
        </div>
      </section>

      <!-- How to Get Started (Auto-Scrolling Carousel) -->
      <section class="bg-soft-warm-gray dark:bg-slate-800/50 rounded-xl p-8 md:p-12">
    <h3 class="mb-6 text-3xl font-bold text-slate-900 dark:text-white text-center">
      How to Get Started
    </h3>

    <div class="relative overflow-hidden">
      <!-- Slides -->
      <div
        class="flex transition-transform duration-700 ease-in-out"
        :style="{ transform: `translateX(-${activeIndex * 100}%)` }"
      >
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="w-full flex-shrink-0 text-center"
        >
          <div
            class="flex justify-center items-center h-20 w-20 mx-auto rounded-full bg-primary text-white text-2xl font-bold"
          >
            {{ index + 1 }}
          </div>
          <h4 class="mt-4 text-xl font-semibold">{{ step.title }}</h4>
          <p class="mt-2 text-slate-600 dark:text-slate-400">
            {{ step.text }}
          </p>
        </div>
      </div>

      <!-- Navigation buttons -->
      <button
        @click="prevSlide"
        class="absolute left-2 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full p-2 hover:bg-primary/80"
      >
        ‹
      </button>
      <button
        @click="nextSlide"
        class="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full p-2 hover:bg-primary/80"
      >
        ›
      </button>

      <!-- Dots -->
      <div class="flex justify-center mt-6 space-x-2">
        <button
          v-for="(step, i) in steps"
          :key="i"
          @click="goToSlide(i)"
          class="h-3 w-3 rounded-full transition-colors duration-300"
          :class="i === activeIndex ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'"
        ></button>
      </div>
    </div>
  </section>

      <!-- FAQ Section -->
        <section class="bg-white dark:bg-slate-900 rounded-xl p-8 md:p-12 shadow-lg">
            <h3 class="mb-6 text-3xl font-bold text-slate-900 dark:text-white text-center">
            Frequently Asked Questions
            </h3>

            <div class="max-w-3xl mx-auto space-y-4">
            <div
                v-for="(faq, index) in faqs"
                :key="index"
                class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
            >
                <!-- Question Header -->
                <button
                @click="toggleFAQ(index)"
                class="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                <span>{{ faq.question }}</span>
                <svg
                    :class="[
                    'w-5 h-5 transform transition-transform duration-300',
                    openIndexes.includes(index) ? 'rotate-180' : ''
                    ]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7" />
                </svg>
                </button>

                <!-- Answer -->
                <transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 max-h-0"
                enter-to-class="opacity-100 max-h-40"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 max-h-40"
                leave-to-class="opacity-0 max-h-0"
                >
                <div
                    v-if="openIndexes.includes(index)"
                    class="px-6 pb-4 text-slate-600 dark:text-slate-400"
                >
                    {{ faq.answer }}
                </div>
                </transition>
            </div>
            </div>
        </section>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const steps = ref([
  {
    title: 'Create Your Account',
    text: 'Sign up in minutes and tell us about your business.',
  },
  {
    title: 'List Your Products',
    text: 'Upload photos and descriptions of your amazing offerings.',
  },
  {
    title: 'Start Selling',
    text: 'Once approved, your business will be live on our platform!',
  },
])

const activeIndex = ref(0)
let intervalId = null

function nextSlide() {
  activeIndex.value = (activeIndex.value + 1) % steps.value.length
}

function prevSlide() {
  activeIndex.value =
    (activeIndex.value - 1 + steps.value.length) % steps.value.length
}

function goToSlide(index) {
  activeIndex.value = index
}

const openIndexes = ref([])

const faqs = ref([
  {
    question: 'How do I sign up as a seller?',
    answer:
      'Click on the “Get Started” button on the homepage and fill out the short registration form with your business details.',
  },
  {
    question: 'Is there a fee to join?',
    answer:
      'No, signing up is completely free! We only take a small commission on successful sales.',
  },
  {
    question: 'When will my products appear on the site?',
    answer:
      'After submitting your listings, our team will review them within 1–2 business days before publishing.',
  },
])

function toggleFAQ(index) {
  if (openIndexes.value.includes(index)) {
    openIndexes.value = openIndexes.value.filter(i => i !== index)
  } else {
    openIndexes.value.push(index)
  }
}

onMounted(() => {
  // Prevent multiple intervals if component re-renders
  if (intervalId) clearInterval(intervalId)
  // Auto-scroll every 5 seconds (slower speed)
  intervalId = setInterval(() => {
    nextSlide()
  }, 3000)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>