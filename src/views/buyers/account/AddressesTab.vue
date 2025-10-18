<template>
  <section class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white">My Addresses</h2>
      <button
        @click="openModal()"
        class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary/90"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add New Address
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && addresses.length === 0"
      class="flex h-72 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white text-center dark:border-slate-700 dark:bg-slate-800"
    >
      <svg class="mb-3 h-16 w-16 text-slate-300 dark:text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19.5 20a8 8 0 10-15 0h15z"/>
      </svg>
      <p class="text-lg font-medium text-slate-600 dark:text-slate-300">You don't have addresses yet.</p>
    </div>

    <!-- Address Cards -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(addr, idx) in addresses"
        :key="idx"
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">{{ addr.type }}</span>
          <span
            v-if="addr.default === 1"
            class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
          >
            Default
          </span>
        </div>

        <div class="space-y-1 text-sm text-slate-700 dark:text-slate-300">
          <p class="font-medium">{{ addr.fullName }}</p>
          <p>{{ addr.phoneNumber }}</p>
          <p>
            {{ addr.streetName }}
            <span v-if="addr.unitNumber">, #{{ addr.unitNumber }}</span>,
            Singapore {{ addr.postalCode }}
          </p>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <button
            @click="openModal(idx)"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Modify
          </button>

          <button
            v-if="addr.default !== 1"
            @click="setDefault(idx)"
            class="rounded-lg border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
          >
            Set Default
          </button>

          <button
            @click="removeAddress(idx)"
            class="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <transition name="fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center" @keydown.esc="closeModal">
        <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>

        <div class="relative z-10 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              {{ editIndex === -1 ? 'New Address' : 'Edit Address' }}
            </h3>
            <button @click="closeModal" class="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="addOrUpdateAddress" class="grid grid-cols-1 gap-4">
            <!-- Full Name -->
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                v-model.trim="form.fullName"
                :disabled="saving"
                class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                :class="t.fullName && !fullNameValid ? 'border-red-500' : ''"
                @blur="t.fullName = true"
                placeholder="e.g. Sarah Johnson"
              />
              <p v-if="t.fullName && !fullNameValid" class="text-xs text-red-600">Full name is required.</p>
            </div>

            <!-- Phone -->
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
              <div class="flex">
                <span class="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  +65
                </span>
                <input
                  v-model="form.phoneLocal"
                  inputmode="numeric"
                  maxlength="8"
                  :disabled="saving"
                  class="w-full rounded-r-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  @input="sanitizePhone()"
                  :class="t.phone && !phoneValid ? 'border-red-500' : ''"
                  @blur="t.phone = true"
                  placeholder="9xxxxxxx"
                />
              </div>
              <p v-if="t.phone && !phoneValid" class="text-xs text-red-600">Must start with 8 or 9 and contain exactly 8 digits.</p>
            </div>

            <!-- Postal Code & Street -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Postal Code</label>
                <input
                  v-model.trim="form.postalCode"
                  inputmode="numeric"
                  maxlength="6"
                  :disabled="saving"
                  class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  @input="form.postalCode=(form.postalCode||'').replace(/\\D/g,'').slice(0,6)"
                  @blur="t.postal = true"
                  :class="t.postal && !postalValid ? 'border-red-500' : ''"
                  placeholder="e.g. 238858"
                />
                <p v-if="t.postal && !postalValid" class="text-xs text-red-600">Enter a valid 6-digit postal code.</p>
              </div>

              <div class="sm:col-span-2">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Street / Block</label>
                <input
                  v-model.trim="form.streetName"
                  :disabled="saving"
                  class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  @blur="t.street = true"
                  :class="t.street && !streetValid ? 'border-red-500' : ''"
                  placeholder="e.g. 123 Orchard Road"
                />
                <p v-if="t.street && !streetValid" class="text-xs text-red-600">Street / Block is required.</p>
              </div>

              <!-- Unit Number -->
              <div class="sm:col-span-3">
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Unit Number</label>
                <div class="flex">
                  <span class="inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 px-3 text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">#</span>
                  <input
                    v-model="form.unitNumber"
                    :disabled="saving"
                    class="w-full rounded-r-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    @input="sanitizeUnit"
                    placeholder="10-234 (optional)"
                  />
                </div>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">Digits and one dash only (e.g. 10-234).</p>
              </div>
            </div>

            <!-- Type + Default -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
              <div>
                <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Address Type</label>
                <select
                  v-model="form.type"
                  :disabled="saving"
                  class="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  :class="t.type && !typeValid ? 'border-red-500' : ''"
                  @blur="t.type = true"
                >
                  <option value="" disabled>Select</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="others">Others</option>
                </select>
                <p v-if="t.type && !typeValid" class="text-xs text-red-600">Please choose a type.</p>
              </div>

              <div class="flex items-center gap-2 pt-6 sm:pt-0">
                <input
                  id="mkdef"
                  type="checkbox"
                  v-model="form.makeDefault"
                  :disabled="defaultDisabled"
                  class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label for="mkdef" class="text-sm text-slate-700 dark:text-slate-300">Set as default address</label>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-2 flex items-center gap-3">
              <button
                type="submit"
                :disabled="saving || !formOk"
                class="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                {{ saving ? 'Saving…' : editIndex === -1 ? 'Add Address' : 'Save Changes' }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <p v-if="success" class="text-sm text-emerald-600">{{ success }}</p>
              <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js'

const show = ref(false)
const editIndex = ref(-1)
const defaultDisabled = ref(false)
const saving = ref(false)
const loading = ref(true)
const success = ref('')
const error = ref('')
const addresses = ref([])

const form = ref({
  fullName: '',
  phoneLocal: '',
  postalCode: '',
  streetName: '',
  unitNumber: '',
  type: '',
  makeDefault: false,
})
const t = ref({ fullName: false, phone: false, postal: false, street: false, type: false })

function openModal(index = -1) {
  success.value = ''
  error.value = ''
  t.value = { fullName: false, phone: false, postal: false, street: false, type: false }
  editIndex.value = index

  if (index === -1) {
    form.value = { fullName: '', phoneLocal: '', postalCode: '', streetName: '', unitNumber: '', type: '', makeDefault: addresses.value.length === 0 }
    defaultDisabled.value = addresses.value.length === 0
  } else {
    const a = addresses.value[index]
    form.value = {
      fullName: a.fullName || '',
      phoneLocal: (a.phoneNumber || '').replace('+65 ', ''),
      postalCode: a.postalCode || '',
      streetName: a.streetName || '',
      unitNumber: a.unitNumber || '',
      type: a.type || 'home',
      makeDefault: a.default === 1,
    }
    defaultDisabled.value = addresses.value.length <= 1
  }

  show.value = true
}
function closeModal() { show.value = false }

function sanitizePhone() {
  form.value.phoneLocal = (form.value.phoneLocal || '').replace(/\D/g, '').slice(0, 8)
}
function sanitizeUnit() {
  let v = (form.value.unitNumber || '')
  v = v.replace(/[^\d-]/g, '').replace(/-+/g, '-')
  if (v.startsWith('-')) v = v.slice(1)
  const parts = v.split('-')
  if (parts.length > 2) v = parts[0] + '-' + parts.slice(1).join('')
  form.value.unitNumber = v
}

const fullNameValid = computed(() => (form.value.fullName || '').trim().length > 0)
const phoneValid = computed(() => /^[89]\d{7}$/.test(form.value.phoneLocal || ''))
const postalValid = computed(() => /^\d{6}$/.test(form.value.postalCode || ''))
const streetValid = computed(() => (form.value.streetName || '').trim().length > 0)
const typeValid = computed(() => ['home', 'work', 'others'].includes(form.value.type))
const formOk = computed(() => fullNameValid.value && phoneValid.value && postalValid.value && streetValid.value && typeValid.value)

onMounted(async () => {
  try {
    const u = auth.currentUser
    if (!u) return
    const snap = await getDoc(doc(db, 'users', u.uid))
    if (snap.exists()) addresses.value = Array.isArray(snap.data().addresses) ? snap.data().addresses : []
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load addresses.'
  } finally { loading.value = false }
})

async function addOrUpdateAddress() {
  t.value = { fullName: true, phone: true, postal: true, street: true, type: true }
  if (!formOk.value) { error.value = 'Please fix the highlighted fields.'; return }

  const u = auth.currentUser
  if (!u) return

  try {
    saving.value = true
    const newAddr = {
      fullName: form.value.fullName.trim(),
      phoneNumber: `+65 ${form.value.phoneLocal}`,
      postalCode: form.value.postalCode.trim(),
      streetName: form.value.streetName.trim(),
      unitNumber: form.value.unitNumber.trim(),
      type: form.value.type,
      default: form.value.makeDefault ? 1 : 0,
    }

    const list = [...addresses.value]

    if (editIndex.value === -1) {
      if (list.length === 0) newAddr.default = 1
      else if (newAddr.default === 1) list.forEach(a => a.default = 0)
      list.push(newAddr)
    } else {
      if (newAddr.default === 1) list.forEach((a, i) => a.default = i === editIndex.value ? 1 : 0)
      list[editIndex.value] = { ...list[editIndex.value], ...newAddr }
      if (!list.some(a => a.default === 1)) list[0].default = 1
    }

    await setDoc(doc(db, 'users', u.uid), { addresses: list }, { merge: true })
    addresses.value = list
    success.value = editIndex.value === -1 ? 'Address added.' : 'Address updated.'
    closeModal()
  } catch (e) {
    console.error(e)
    error.value = 'Could not save address.'
  } finally {
    saving.value = false
  }
}

/* Set default address */
async function setDefault(index) {
  const u = auth.currentUser
  if (!u) return
  try {
    const list = addresses.value.map((a, i) => ({ ...a, default: i === index ? 1 : 0 }))
    await setDoc(doc(db, 'users', u.uid), { addresses: list }, { merge: true })
    addresses.value = list
  } catch (e) {
    console.error(e)
    error.value = 'Failed to set default address.'
  }
}

/* Delete address */
async function removeAddress(index) {
  const u = auth.currentUser
  if (!u) return
  try {
    const list = addresses.value.slice()
    list.splice(index, 1)
    // Always ensure at least one default
    if (list.length > 0 && !list.some(a => a.default === 1)) list[0].default = 1
    await setDoc(doc(db, 'users', u.uid), { addresses: list }, { merge: true })
    addresses.value = list
  } catch (e) {
    console.error(e)
    error.value = 'Failed to delete address.'
  }
}
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
