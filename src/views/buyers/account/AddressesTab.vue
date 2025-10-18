<template>
  <section class="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">My Addresses</h2>
      <button
        @click="startAdd"
        class="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
        + Add New Address
      </button>
    </div>

    <!-- Loading / Empty -->
    <div v-if="loading" class="text-slate-600 dark:text-slate-300">Loading addresses…</div>
    <div v-else-if="addresses.length === 0" class="text-slate-600 dark:text-slate-400">
      You don’t have any saved addresses yet. Click “Add New Address” to create one.
    </div>

    <!-- Address list -->
    <div v-else class="grid gap-4">
      <div
        v-for="addr in addresses"
        :key="addr.id"
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-base font-semibold text-slate-900 dark:text-white truncate">
                {{ addr.fullName }}
              </p>
              <span
                v-if="addr.isDefault"
                class="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                Default
              </span>
              <span
                class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {{ addr.label }}
              </span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ addr.phone }}
            </p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-300 break-words">
              {{ addr.addressLine }} <span v-if="addr.unitNo">, {{ addr.unitNo }}</span>
              <br />
              Singapore {{ addr.postalCode }}
            </p>
          </div>

          <div class="shrink-0 space-x-2">
            <button
              @click="startEdit(addr)"
              class="rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">
              Edit
            </button>
            <button
              @click="removeAddress(addr)"
              class="rounded-lg border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-slate-600 dark:hover:bg-red-900/20">
              Delete
            </button>
          </div>
        </div>

        <div class="mt-3">
          <label class="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              :checked="addr.isDefault"
              :disabled="addresses.length < 2 || addr.isDefaultSetting"
              @change="setDefault(addr)"
            />
            <span
              class="text-slate-600 dark:text-slate-400"
              :class="{ 'opacity-60': addresses.length < 2 }"
            >
              Set as Default
            </span>
          </label>
          <p v-if="addresses.length < 2" class="mt-1 text-xs text-slate-500">
            Your first address will be set as the Default. Add a second address to change this.
          </p>
        </div>
      </div>
    </div>

    <!-- Add/Edit form -->
    <div v-if="showForm" class="mt-8 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
      <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        {{ editingId ? 'Edit Address' : 'New Address' }}
      </h3>

      <form @submit.prevent="save" class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-1">
          <input
            v-model.trim="form.fullName"
            placeholder="Full Name"
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <p v-if="t.fullName && !valid.fullName" class="mt-1 text-xs text-red-600">Name is required.</p>
        </div>

        <div class="sm:col-span-1">
          <input
            v-model.trim="form.phone"
            placeholder="Phone Number"
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <p v-if="t.phone && !valid.phone" class="mt-1 text-xs text-red-600">
            Use SG format (+65 optional), starting with 8 or 9 (8 digits).
          </p>
        </div>

        <div class="sm:col-span-2">
          <input
            v-model.trim="form.postalCode"
            inputmode="numeric"
            maxlength="6"
            placeholder="Postal Code"
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
            @input="form.postalCode = (form.postalCode || '').replace(/\\D/g,'').slice(0,6)"
          />
          <p v-if="t.postalCode && !valid.postalCode" class="mt-1 text-xs text-red-600">Enter a 6-digit postal code.</p>
        </div>

        <div class="sm:col-span-1">
          <input
            v-model.trim="form.addressLine"
            placeholder="Building, Street, and etc…"
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
          <p v-if="t.addressLine && !valid.addressLine" class="mt-1 text-xs text-red-600">Address is required.</p>
        </div>

        <div class="sm:col-span-1">
          <input
            v-model.trim="form.unitNo"
            placeholder="Unit No (Optional)"
            class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-900"
          />
        </div>

        <div class="sm:col-span-2 flex items-center gap-4">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="form.label = 'Home'"
              :class="labelClass('Home')"
              class="rounded-lg border px-3 py-1.5 text-sm">
              Home
            </button>
            <button
              type="button"
              @click="form.label = 'Work'"
              :class="labelClass('Work')"
              class="rounded-lg border px-3 py-1.5 text-sm">
              Work
            </button>
          </div>

          <label class="ml-auto inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              v-model="form.isDefault"
              :disabled="addresses.length < 1 || editingId ? addresses.length < 2 : addresses.length < 1"
            />
            <span
              class="text-slate-600 dark:text-slate-400"
              :class="{ 'opacity-60': (editingId ? addresses.length < 2 : addresses.length < 1) }"
            >
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

/* ---------- state ---------- */
const loading = ref(true)
const saving = ref(false)
const addresses = ref([])
const showForm = ref(false)
const editingId = ref(null)
const error = ref('')
const success = ref('')

const form = ref({
  fullName: '',
  phone: '',
  postalCode: '',
  addressLine: '',
  unitNo: '',
  label: 'Home',
  isDefault: false,
})

const t = ref({ fullName: false, phone: false, postalCode: false, addressLine: false })

/* ---------- validators ---------- */
const valid = {
  get fullName() { return (form.value.fullName || '').trim().length > 0 },
  get phone() { const v = (form.value.phone || '').trim(); return /^(?:\+65\s*)?[89]\d{7}$/.test(v) },
  get postalCode() { return /^\d{6}$/.test((form.value.postalCode || '').trim()) },
  get addressLine() { return (form.value.addressLine || '').trim().length > 0 },
}
const formOk = computed(() => valid.fullName && valid.phone && valid.postalCode && valid.addressLine)

/* ---------- helpers ---------- */
function labelClass(lbl) {
  return form.value.label === lbl
    ? 'border-primary text-primary bg-primary/10'
    : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
}

function resetForm() {
  form.value = {
    fullName: '',
    phone: '',
    postalCode: '',
    addressLine: '',
    unitNo: '',
    label: 'Home',
    isDefault: addresses.value.length === 0, // first address becomes default
  }
  t.value = { fullName: false, phone: false, postalCode: false, addressLine: false }
  editingId.value = null
  error.value = ''
  success.value = ''
}

/* ---------- fetch addresses ---------- */
async function load() {
  loading.value = true
  const user = auth.currentUser
  if (!user) { loading.value = false; return }
  const addrRef = collection(db, 'users', user.uid, 'addresses')
  const q = query(addrRef, orderBy('createdAt', 'asc'))
  const snap = await getDocs(q)
  addresses.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  loading.value = false
}

/* ---------- form actions ---------- */
function startAdd() {
  showForm.value = true
  resetForm()
}

function startEdit(addr) {
  showForm.value = true
  editingId.value = addr.id
  form.value = {
    fullName: addr.fullName || '',
    phone: addr.phone || '',
    postalCode: String(addr.postalCode || ''),
    addressLine: addr.addressLine || '',
    unitNo: addr.unitNo || '',
    label: addr.label || 'Home',
    isDefault: !!addr.isDefault,
  }
}

function cancel() {
  showForm.value = false
  resetForm()
}

async function save() {
  t.value = { fullName: true, phone: true, postalCode: true, addressLine: true }
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

    const base = {
      fullName: form.value.fullName.trim(),
      phone: form.value.phone.trim(),
      postalCode: Number(form.value.postalCode),
      addressLine: form.value.addressLine.trim(),
      unitNo: (form.value.unitNo || '').trim(),
      label: form.value.label,
      isDefault: !!form.value.isDefault,
      updatedAt: serverTimestamp(),
    }

    const addrCol = collection(db, 'users', user.uid, 'addresses')

    if (editingId.value) {
      // update existing
      await updateDoc(doc(addrCol, editingId.value), base)
    } else {
      // create new
      const payload = { ...base, createdAt: serverTimestamp() }
      await addDoc(addrCol, payload)
    }

    // handle default uniqueness
    if (form.value.isDefault) {
      await ensureSingleDefault()
    } else if (addresses.value.length === 0) {
      // first address must be default
      await ensureFirstIsDefault()
    }

    await load()
    success.value = editingId.value ? 'Address updated.' : 'Address added.'
    showForm.value = false
    resetForm()
  } catch (e) {
    console.error(e)
    error.value = 'Could not save address.'
  } finally {
    saving.value = false
  }
}

async function removeAddress(addr) {
  try {
    const user = auth.currentUser
    if (!user) return
    const addrRef = doc(db, 'users', user.uid, 'addresses', addr.id)
    await deleteDoc(addrRef)
    await load()
    // if the default was deleted, set first as default (if any left)
    await ensureFirstIsDefault()
  } catch (e) {
    console.error(e)
  }
}

async function setDefault(addr) {
  // avoid flicker
  addr.isDefaultSetting = true
  try {
    const user = auth.currentUser
    if (!user) return
    const addrCol = collection(db, 'users', user.uid, 'addresses')

    // unset others
    await Promise.all(addresses.value
      .filter(a => a.id !== addr.id && a.isDefault)
      .map(a => updateDoc(doc(addrCol, a.id), { isDefault: false, updatedAt: serverTimestamp() })))

    // set this one
    await updateDoc(doc(addrCol, addr.id), { isDefault: true, updatedAt: serverTimestamp() })
    await load()
  } finally {
    addr.isDefaultSetting = false
  }
}

/* ensure the very first address is default */
async function ensureFirstIsDefault() {
  if (addresses.value.length === 0) return
  const hasDefault = addresses.value.some(a => a.isDefault)
  if (!hasDefault) {
    const user = auth.currentUser
    if (!user) return
    const first = addresses.value[0]
    await updateDoc(doc(db, 'users', user.uid, 'addresses', first.id), { isDefault: true, updatedAt: serverTimestamp() })
    await load()
  }
}

/* ensure there’s only one default (called after save when isDefault=true) */
async function ensureSingleDefault() {
  const user = auth.currentUser
  if (!user) return
  const addrCol = collection(db, 'users', user.uid, 'addresses')
  // after reload, just enforce single default
  await load()
  const defaults = addresses.value.filter(a => a.isDefault)
  if (defaults.length <= 1) return
  // keep the most recently updated default as default
  const keep = defaults[defaults.length - 1]
  await Promise.all(defaults
    .filter(a => a.id !== keep.id)
    .map(a => updateDoc(doc(addrCol, a.id), { isDefault: false, updatedAt: serverTimestamp() })))
  await load()
}

onMounted(async () => {
  await load()
  await ensureFirstIsDefault()
})
</script>