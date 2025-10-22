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
    <div v-else-if="cards.length === 0" class="text-slate-600 dark:text-slate-400">
      You don't have cards yet. Click “Add New Card” to save one.
    </div>

    <!-- Cards list -->
    <div v-else class="grid gap-4">
      <div
        v-for="c in cards"
        :key="c.id"
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-base font-semibold text-slate-900 dark:text-white">
                {{ c.brand }} •••• {{ c.last4 }}
              </p>
              <span
                v-if="c.isDefault"
                class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                Default
              </span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ c.cardholderName }} • Expires {{ two(c.expMonth) }}/{{ c.expYear }}
            </p>
          </div>

          <div class="shrink-0 space-x-2">
            <button
              @click="startEdit(c)"
              class="rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
              Edit
            </button>
            <button
              @click="removeCard(c)"
              class="rounded-lg border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-slate-600 dark:hover:bg-red-900/20">
              Delete
            </button>
          </div>
        </div>

        <div class="mt-3">
          <label class="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              :checked="c.isDefault"
              :disabled="cards.length < 2 || c.isDefaultSetting"
              @change="setDefault(c)"
            />
            <span class="text-slate-600 dark:text-slate-400" :class="{ 'opacity-60': cards.length < 2 }">
              Set as Default
            </span>
          </label>
          <p v-if="cards.length < 2" class="mt-1 text-xs text-slate-500">
            Your first card will be set as the Default. Add a second card to change this.
          </p>
        </div>
      </div>
    </div>

    <!-- Add/Edit form -->
    <div v-if="showForm" class="mt-8 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
      <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        {{ editingId ? 'Edit Card' : 'New Card' }}
      </h3>

      <form @submit.prevent="save" class="grid gap-4 sm:grid-cols-2">
        <!-- Cardholder Name -->
        <div class="sm:col-span-2">
          <input
            v-model.trim="form.cardholderName"
            placeholder="Cardholder Name"
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
          <p v-if="t.cardholderName && !valid.cardholderName" class="mt-1 text-xs text-red-600">Name is required.</p>
        </div>

        <!-- Card Number (never stored; used to derive last4/brand) -->
        <div class="sm:col-span-2">
          <input
            v-model.trim="form.cardNumber"
            placeholder="Card Number"
            inputmode="numeric"
            @input="formatAndDetect"
            :disabled="editingId"  
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
          <p v-if="!editingId && t.cardNumber && !valid.cardNumber" class="mt-1 text-xs text-red-600">
            Enter a valid card number.
          </p>
          <p v-if="editingId" class="mt-1 text-xs text-slate-500">
            Card number is hidden for your security.
          </p>
        </div>

        <!-- Expiry -->
        <div>
          <input
            v-model.trim="form.expMonth"
            placeholder="Expiry Month (MM)"
            inputmode="numeric"
            maxlength="2"
            @input="form.expMonth = (form.expMonth || '').replace(/\\D/g,'').slice(0,2)"
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
          <p v-if="t.exp && !valid.expMonth" class="mt-1 text-xs text-red-600">Invalid month.</p>
        </div>
        <div>
          <input
            v-model.trim="form.expYear"
            placeholder="Expiry Year (YYYY)"
            inputmode="numeric"
            maxlength="4"
            @input="form.expYear = (form.expYear || '').replace(/\\D/g,'').slice(0,4)"
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900" />
          <p v-if="t.exp && !valid.expYear" class="mt-1 text-xs text-red-600">Invalid year.</p>
        </div>

        <!-- Default -->
        <div class="sm:col-span-2">
          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.isDefault" :disabled="cards.length < 1 || editingId ? cards.length < 2 : cards.length < 1" />
            <span class="text-slate-600 dark:text-slate-400" :class="{ 'opacity-60': (editingId ? cards.length < 2 : cards.length < 1) }">
              Set as Default
            </span>
          </label>
        </div>

        <div class="sm:col-span-2 flex gap-3">
          <button
            type="submit"
            class="rounded-lg bg-primary px-5 py-2 text-white hover:bg-primary/90 disabled:opacity-60"
            :disabled="saving">
            {{ saving ? 'Saving…' : (editingId ? 'Save Changes' : 'Submit') }}
          </button>
          <button
            type="button"
            @click="cancel"
            class="rounded-lg border px-5 py-2 dark:border-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
            Cancel
          </button>
        </div>

        <p v-if="error" class="sm:col-span-2 text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="sm:col-span-2 text-sm text-emerald-600">{{ success }}</p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, serverTimestamp, query, orderBy
} from 'firebase/firestore'

/* ---------- utils ---------- */
const two = (n) => String(n).padStart(2, '0')

function luhnOk(num) {
  const s = (num || '').replace(/\D/g, '')
  if (s.length < 12) return false
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
  if (/^4\d{12,18}$/.test(s)) return 'Visa'
  if (/^5[1-5]\d{14}$/.test(s) || /^2(2[2-9]\d|[3-6]\d{2}|7[01]\d|720)\d{12}$/.test(s)) return 'Mastercard'
  if (/^3[47]\d{13}$/.test(s)) return 'American Express'
  if (/^6(?:011|5\d{2})\d{12}$/.test(s)) return 'Discover'
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

const form = ref({
  cardholderName: '',
  cardNumber: '',   // never stored
  brand: 'Card',
  last4: '',
  expMonth: '',
  expYear: '',
  isDefault: false,
})

const t = ref({ cardholderName: false, cardNumber: false, exp: false })

/* ---------- validators ---------- */
const valid = {
  get cardholderName() { return (form.value.cardholderName || '').trim().length > 0 },
  get cardNumber() { return luhnOk(form.value.cardNumber) },
  get expMonth() {
    const m = Number(form.value.expMonth)
    return Number.isInteger(m) && m >= 1 && m <= 12
  },
  get expYear() {
    const y = Number(form.value.expYear)
    if (!Number.isInteger(y) || String(y).length !== 4) return false
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    if (y < currentYear) return false
    if (y === currentYear && Number(form.value.expMonth) < currentMonth) return false
    return true
  }
}
const formOk = computed(() =>
  valid.cardholderName && (editingId.value || valid.cardNumber) && valid.expMonth && valid.expYear
)

/* ---------- UI helpers ---------- */
function formatAndDetect() {
  const digits = (form.value.cardNumber || '').replace(/\D/g, '')
  // group digits visually
  form.value.cardNumber = digits.replace(/(.{4})/g, '$1 ').trim()
  form.value.brand = detectBrand(digits)
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
    brand: 'Card',
    last4: '',
    expMonth: '',
    expYear: '',
    isDefault: cards.value.length === 0, // first card becomes default
  }
  t.value = { cardholderName: false, cardNumber: false, exp: false }
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
  // When editing, do not expose card number (security); keep brand/last4
  form.value = {
    cardholderName: c.cardholderName || '',
    cardNumber: '', // hidden
    brand: c.brand || 'Card',
    last4: c.last4 || '',
    expMonth: String(c.expMonth || ''),
    expYear: String(c.expYear || ''),
    isDefault: !!c.isDefault,
  }
}

function cancel() {
  showForm.value = false
  resetForm()
}

async function save() {
  t.value.cardholderName = true
  t.value.cardNumber = true
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

    if (editingId.value) {
      // Update allowed fields (no PAN)
      const base = {
        cardholderName: form.value.cardholderName.trim(),
        expMonth: Number(form.value.expMonth),
        expYear: Number(form.value.expYear),
        isDefault: !!form.value.isDefault,
        updatedAt: serverTimestamp(),
      }
      await updateDoc(doc(col, editingId.value), base)
    } else {
      // New card: derive brand/last4 from entered number; never store full PAN
      const digits = (form.value.cardNumber || '').replace(/\D/g, '')
      const base = {
        cardholderName: form.value.cardholderName.trim(),
        brand: detectBrand(digits),
        last4: digits.slice(-4),
        expMonth: Number(form.value.expMonth),
        expYear: Number(form.value.expYear),
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
    success.value = editingId.value ? 'Card updated.' : 'Card added.'
    showForm.value = false
    resetForm()
  } catch (e) {
    console.error(e)
    error.value = 'Could not save card.'
  } finally {
    saving.value = false
  }
}

async function removeCard(c) {
  try {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(doc(db, 'users', user.uid, 'payment_methods', c.id))
    await load()
    // If default was deleted, set first available as default
    await ensureFirstIsDefault()
  } catch (e) {
    console.error(e)
  }
}

async function setDefault(c) {
  c.isDefaultSetting = true
  try {
    const user = auth.currentUser
    if (!user) return
    const col = collection(db, 'users', user.uid, 'payment_methods')
    // unset others
    await Promise.all(cards.value
      .filter(x => x.id !== c.id && x.isDefault)
      .map(x => updateDoc(doc(col, x.id), { isDefault: false, updatedAt: serverTimestamp() })))
    // set this one
    await updateDoc(doc(col, c.id), { isDefault: true, updatedAt: serverTimestamp() })
    await load()
  } finally {
    c.isDefaultSetting = false
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
    await updateDoc(doc(db, 'users', user.uid, 'payment_methods', first.id), { isDefault: true, updatedAt: serverTimestamp() })
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
