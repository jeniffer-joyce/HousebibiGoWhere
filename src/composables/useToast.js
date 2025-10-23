import { ref } from 'vue'

const toastState = ref({
  show: false,
  type: 'success',
  title: '',
  message: '',
  duration: 3000
})

export function useToast() {
  function showToast({ type = 'success', title = '', message, duration = 3000 }) {
    toastState.value = {
      show: true,
      type,
      title,
      message,
      duration
    }
  }

  function success(message, title = 'Success') {
    showToast({ type: 'success', title, message })
  }

  function error(message, title = 'Error') {
    showToast({ type: 'error', title, message })
  }

  function warning(message, title = 'Warning') {
    showToast({ type: 'warning', title, message })
  }

  function info(message, title = 'Info') {
    showToast({ type: 'info', title, message })
  }

  function close() {
    toastState.value.show = false
  }

  return {
    toastState,
    showToast,
    success,
    error,
    warning,
    info,
    close
  }
}