<template>
  <section class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Banks &amp; Cards</h2>
      <button
        @click="startAdd"
        class="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
        + Add New Card
      </button>
    </div>

    <!-- Loading / Empty -->
    <div v-if="loading" class="text-slate-600 dark:text-slate-300">Loading payment methods…</div>
    <div v-else-if="cards.length === 0" class="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
      </svg>
      <h3 class="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
        No payment methods added
      </h3>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Add a card to speed up your checkout process
      </p>
    </div>

    <!-- Cards list -->
    <div v-else class="grid gap-4">
      <div
        v-for="c in cards"
        :key="c.id"
        class="group relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 transition-all hover:border-primary/50 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-3">
              <!-- Card Brand Icon -->
              <div class="flex h-10 w-14 items-center justify-center rounded bg-slate-100 dark:bg-slate-700">
                <svg v-if="c.brand === 'Visa'" class="h-6 w-auto" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="#1434CB"/>
                  <text x="24" y="20" text-anchor="middle" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">VISA</text>
                </svg>
                <svg v-else-if="c.brand === 'Mastercard'" class="h-6 w-auto" viewBox="0 0 48 32">
                  <rect width="48" height="32" rx="4" fill="#EB001B"/>
                  <circle cx="20" cy="16" r="8" fill="#FF5F00"/>
                  <circle cx="28" cy="16" r="8" fill="#F79E1B"/>
                </svg>
                <svg v-else class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-slate-900 dark:text-white">
                    •••• •••• •••• {{ c.last4 }}
                  </p>
                  <span
                    v-if="c.isDefault"
                    class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Default
                  </span>
                </div>
                <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {{ c.cardholderName }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>Expires {{ two(c.expMonth) }}/{{ c.expYear }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button
              v-if="!c.isDefault && cards.length > 1"
              @click="setDefault(c)"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-700"
              title="Set as default">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </button>
            <button
              @click="startEdit(c)"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-700"
              title="Edit card">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              @click="removeCard(c)"
              class="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/20"
              title="Delete card">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <transition name="fade">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="cancel">
        <div class="absolute inset-0 bg-black/50"></div>
        
        <div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
          <div class="mb-6 flex items-center justify-between">
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">
              {{ editingId ? 'Edit Card' : 'Add Payment Card' }}
            </h3>
            <button
              @click="cancel"
              class="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form @submit.prevent="save" class="space-y-4">
            <!-- Cardholder Name -->
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Cardholder Name
              </label>
              <input
                v-model.trim="form.cardholderName"
                type="text"
                placeholder="John Doe"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                required
              />
              <p v-if="t.cardholderName && !valid.cardholderName" class="mt-1 text-xs text-red-600">
                Cardholder name is required
              </p>
            </div>

            <!-- Card Number (only shown when adding new card) -->
            <div v-if="!editingId">
              <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Card Number
              </label>
              <input
                v-model="form.cardNumber"
                type="text"
                inputmode="numeric"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                @input="formatAndDetect"
                class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                required
              />
              <p v-if="t.cardNumber && !valid.cardNumber" class="mt-1 text-xs text-red-600">
                Please enter a valid card number (16 digits)
              </p>
            </div>
            <div v-else class="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Card number is hidden for security. Only expiry date and cardholder name can be updated.
              </p>
            </div>

            <!-- Expiry Date (Combined MM/YY) -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Expiry Date
                </label>
                <input
                  v-model="form.expiryDate"
                  type="text"
                  inputmode="numeric"
                  placeholder="MM/YY"
                  maxlength="5"
                  @input="formatExpiryDate"
                  class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  required
                />
                <p v-if="t.exp && !valid.expiry" class="mt-1 text-xs text-red-600">
                  Invalid expiry (MM/YY)
                </p>
              </div>
              
              
            </div>

            <!-- Set as Default -->
            <div class="flex items-center gap-2">
              <input
                id="setDefault"
                v-model="form.isDefault"
                type="checkbox"
                :disabled="cards.length === 0 || (editingId && cards.length < 2)"
                class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label for="setDefault" class="text-sm text-slate-700 dark:text-slate-300">
                Set as default payment method
              </label>
            </div>

            <!-- Error/Success Messages -->
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            <p v-if="success" class="text-sm text-emerald-600">{{ success }}</p>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
                {{ saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Card') }}
              </button>
              <button
                type="button"
                @click="cancel"
                class="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
      <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="cancelDelete">
        <div class="absolute inset-0 bg-black/50"></div>
        
        <div class="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
          <div class="mb-4 flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Delete Payment Method</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
            </div>
          </div>

          <div v-if="cardToDelete" class="mb-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <p class="text-sm text-slate-600 dark:text-slate-400">Card ending in</p>
            <p class="text-lg font-semibold text-slate-900 dark:text-white">•••• •••• •••• {{ cardToDelete.last4 }}</p>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ cardToDelete.cardholderName }}</p>
          </div>

          <div class="flex gap-3">
            <button
              @click="confirmDelete"
              class="flex-1 rounded-lg bg-red-600 px-6 py-2.5 font-semibold text-white hover:bg-red-700">
              Delete Card
            </button>
            <button
              @click="cancelDelete"
              class="rounded-lg border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy
} from 'firebase/firestore'
import { useToast } from '@/composables/useToast'

// Add this right after imports
const { success: showSuccess, error: showError } = useToast()


/* ---------- utils ---------- */
const two = (n) => String(n).padStart(2, '0')

function luhnOk(num) {
  const s = (num || '').replace(/\D/g, '')
  if (s.length !== 16) return false // Exactly 16 digits
  let sum = 0, alt = false
  for (let i = s.length - 1; i >= 0; i--) {
    let n = parseInt(s[i], 10)
    if (alt) { n *= 2; if (n > 9) n -= 9 }
    sum += n; alt = !alt
  }
  return sum % 10 === 0
}

function detectBrand(num) {
  const s = (num || '').replace(/\D/g, '')
  if (/^4/.test(s)) return 'Visa'
  if (/^5[1-5]/.test(s) || /^2(2[2-9]|[3-6]|7[01]|720)/.test(s)) return 'Mastercard'
  if (/^3[47]/.test(s)) return 'American Express'
  if (/^6(?:011|5)/.test(s)) return 'Discover'
  return 'Card'
}

/* ---------- state ---------- */
const loading = ref(true)
const saving = ref(false)
const cards = ref([])
const showForm = ref(false)
const editingId = ref(null)
const error = ref('')
const success = ref('')

const showDeleteModal = ref(false)
const cardToDelete = ref(null)

const form = ref({
  cardholderName: '',
  cardNumber: '',   // never stored permanently
  expiryDate: '',   // MM/YY format
  brand: 'Card',
  last4: '',
  isDefault: false,
})

const t = ref({ 
  cardholderName: false, 
  cardNumber: false, 
  exp: false,
})

/* ---------- validators ---------- */
const valid = {
  get cardholderName() { 
    return (form.value.cardholderName || '').trim().length > 0 
  },
  get cardNumber() { 
    return luhnOk(form.value.cardNumber) 
  },
  get expiry() {
    const exp = form.value.expiryDate
    if (!exp || !exp.includes('/')) return false
    
    const [month, year] = exp.split('/')
    const m = parseInt(month, 10)
    const y = parseInt('20' + year, 10)
    
    if (!m || !y || m < 1 || m > 12) return false
    
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    if (y < currentYear) return false
    if (y === currentYear && m < currentMonth) return false
    
    return true
  },
}

const formOk = computed(() => {
  if (editingId.value) {
    // When editing, only validate name and expiry
    return valid.cardholderName && valid.expiry
  } else {
    // When adding, validate everything
    return valid.cardholderName && valid.cardNumber && valid.expiry
  }
})

/* ---------- UI helpers ---------- */
function formatAndDetect() {
  // Remove non-digits
  let digits = (form.value.cardNumber || '').replace(/\D/g, '')
  
  // Limit to 16 digits
  digits = digits.substring(0, 16)
  
  // Add spaces every 4 digits
  form.value.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim()
  
  // Detect brand
  form.value.brand = detectBrand(digits)
}

function formatExpiryDate() {
  // Remove non-digits
  let value = form.value.expiryDate.replace(/\D/g, '')
  
  // Add slash after 2 digits
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  
  form.value.expiryDate = value
}



/* ---------- fetch cards ---------- */
async function load() {
  loading.value = true
  const user = auth.currentUser
  if (!user) { loading.value = false; return }
  const col = collection(db, 'users', user.uid, 'payment_methods')
  const q = query(col, orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  cards.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  loading.value = false
}

/* ---------- form actions ---------- */
function resetForm() {
  form.value = {
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    brand: 'Card',
    last4: '',
    isDefault: cards.value.length === 0, // first card becomes default
  }
  t.value = { 
    cardholderName: false, 
    cardNumber: false, 
    exp: false,
  }
  editingId.value = null
  error.value = ''
  success.value = ''
}

function startAdd() {
  showForm.value = true
  resetForm()
}

function startEdit(c) {
  showForm.value = true
  editingId.value = c.id
  
  // Parse stored expiry back to MM/YY format
  const month = two(c.expMonth)
  const year = String(c.expYear).slice(-2)
  
  form.value = {
    cardholderName: c.cardholderName || '',
    cardNumber: '', // hidden for security
    expiryDate: `${month}/${year}`,
    brand: c.brand || 'Card',
    last4: c.last4 || '',
    isDefault: !!c.isDefault,
  }
}

function cancel() {
  showForm.value = false
  resetForm()
}

async function save() {
  t.value.cardholderName = true
  t.value.cardNumber = !editingId.value
  t.value.exp = true
  
  error.value = ''
  success.value = ''

  if (!formOk.value) {
    error.value = 'Please fix the highlighted fields.'
    return
  }

  saving.value = true
  try {
    const user = auth.currentUser
    if (!user) throw new Error('auth/missing-user')

    const col = collection(db, 'users', user.uid, 'payment_methods')

    // Parse expiry date
    const [month, year] = form.value.expiryDate.split('/')
    const expMonth = parseInt(month, 10)
    const expYear = parseInt('20' + year, 10)

    if (editingId.value) {
      // Update allowed fields (no card number)
      const base = {
        cardholderName: form.value.cardholderName.trim(),
        expMonth: expMonth,
        expYear: expYear,
        isDefault: !!form.value.isDefault,
        updatedAt: serverTimestamp(),
      }
      await updateDoc(doc(col, editingId.value), base)
    } else {
      // New card: derive brand/last4 from entered number
      const digits = (form.value.cardNumber || '').replace(/\D/g, '')
      const base = {
        cardholderName: form.value.cardholderName.trim(),
        brand: detectBrand(digits),
        last4: digits.slice(-4),
        expMonth: expMonth,
        expYear: expYear,
        isDefault: !!form.value.isDefault || cards.value.length === 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      

      
      await addDoc(col, base)
    }

    // Enforce single default
    if (form.value.isDefault) {
      await ensureSingleDefault()
    } else if (cards.value.length === 0) {
      await ensureFirstIsDefault()
    }

    await load()
    success.value = editingId.value ? 'Card updated successfully!' : 'Card added successfully!'
    
    // Close modal after short delay to show success message
    setTimeout(() => {
      showForm.value = false
      resetForm()
    }, 1500)
    
  } catch (e) {
    console.error(e)
    error.value = 'Could not save card. Please try again.'
  } finally {
    saving.value = false
  }
}

async function removeCard(c) {
  cardToDelete.value = c
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!cardToDelete.value) return
  
  try {
    const user = auth.currentUser
    if (!user) return
    
    await deleteDoc(doc(db, 'users', user.uid, 'payment_methods', cardToDelete.value.id))
    await load()
    
    showSuccess('Payment method deleted successfully')
    await ensureFirstIsDefault()
    
    showDeleteModal.value = false
    cardToDelete.value = null
  } catch (e) {
    console.error(e)
    showError('Could not delete card. Please try again.')
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  cardToDelete.value = null
}

async function setDefault(c) {
  try {
    const user = auth.currentUser
    if (!user) return
    const col = collection(db, 'users', user.uid, 'payment_methods')
    
    // Unset others
    await Promise.all(cards.value
      .filter(x => x.id !== c.id && x.isDefault)
      .map(x => updateDoc(doc(col, x.id), { isDefault: false, updatedAt: serverTimestamp() })))
    
    // Set this one
    await updateDoc(doc(col, c.id), { isDefault: true, updatedAt: serverTimestamp() })
    await load()
  } catch (e) {
    console.error(e)
    error.value = 'Could not set default card.'
  }
}

/* ensure the very first card is default */
async function ensureFirstIsDefault() {
  if (cards.value.length === 0) return
  const hasDefault = cards.value.some(x => x.isDefault)
  if (!hasDefault) {
    const user = auth.currentUser
    if (!user) return
    const first = cards.value[0]
    await updateDoc(doc(db, 'users', user.uid, 'payment_methods', first.id), { 
      isDefault: true, 
      updatedAt: serverTimestamp() 
    })
    await load()
  }
}

/* ensure only one default */
async function ensureSingleDefault() {
  const user = auth.currentUser
  if (!user) return
  const col = collection(db, 'users', user.uid, 'payment_methods')
  await load()
  const defaults = cards.value.filter(x => x.isDefault)
  if (defaults.length <= 1) return
  const keep = defaults[defaults.length - 1] // keep most recently updated
  await Promise.all(defaults
    .filter(x => x.id !== keep.id)
    .map(x => updateDoc(doc(col, x.id), { isDefault: false, updatedAt: serverTimestamp() })))
  await load()
}

onMounted(async () => {
  await load()
  await ensureFirstIsDefault()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>