import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { auth, db } from '@/firebase/firebase_config'
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp, limit
} from 'firebase/firestore'

const orders = ref([])
let unsubPrimary = null
let unsubFallback = null

// Safe status resolver
const statusOf = (o) => {
  if (!o) return 'to_ship'
  if (o.status) return o.status
  const log = Array.isArray(o.statusLog) ? o.statusLog : []
  return log.length ? (log[log.length - 1]?.status || 'to_ship') : 'to_ship'
}

export function useSellerOrders() {
  onMounted(() => {
    const stop = auth.onAuthStateChanged(u => {
      // cleanup old listeners
      unsubPrimary?.(); unsubPrimary = null
      unsubFallback?.(); unsubFallback = null
      orders.value = []

      if (!u) return

      // --- PRIMARY: requires top-level sellerId on order docs ---
      const qPrimary = query(
        collection(db, 'orders'),
        where('sellerId', '==', u.uid),
        orderBy('createdAt', 'desc')
      )

      unsubPrimary = onSnapshot(qPrimary, snap => {
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (rows.length > 0) {
          orders.value = rows
          // if primary returns data, ensure fallback is off
          unsubFallback?.(); unsubFallback = null
        } else {
          // --- FALLBACK: if your data hasn't got sellerId yet,
          // pull recent orders and filter by products[].sellerId on client
          if (!unsubFallback) {
            const qFallback = query(
              collection(db, 'orders'),
              orderBy('createdAt', 'desc'),
              limit(200) // adjust if needed
            )
            unsubFallback = onSnapshot(qFallback, s2 => {
              const all = s2.docs.map(d => ({ id: d.id, ...d.data() }))
              orders.value = all.filter(o =>
                Array.isArray(o.products) &&
                o.products.some(p => p?.sellerId === u.uid)
              )
            })
          }
        }
      })
    })

    onBeforeUnmount(() => { unsubPrimary?.(); unsubFallback?.(); stop?.() })
  })

  const counts = computed(() => ({
    toShip:     orders.value.filter(o => statusOf(o) === 'to_ship').length,
    shipping:   orders.value.filter(o => statusOf(o) === 'shipped').length,
    completed:  orders.value.filter(o => statusOf(o) === 'completed').length,
    cancelled:  orders.value.filter(o => statusOf(o) === 'cancelled').length,
    rr:         orders.value.filter(o => statusOf(o) === 'return_refund' || o.returnRequestSummary).length,
  }))

  /**
   * Arrange shipment for an order.
   * opts = { method: 'dropoff' | 'pickup', pickup?: { date, slot, remark } }
   * - Keeps status 'to_ship'
   * - Sets shipping.arranged=true, method, pickup info and arrangedAt
   * - Opens a printable Waybill stub window
   */
  async function arrangeShipment(order, opts) {
    if (!order?.id) throw new Error('Order missing id')
    if (!opts?.method) throw new Error('Missing shipping method')

    const orderRef = doc(db, 'orders', order.id)
    const existing = order.shipping || {}

    // Always use HouseBiBi Express
    const ch = 'HouseBiBi Express'

    await updateDoc(orderRef, {
      status: 'to_ship',
      updatedAt: serverTimestamp(),
      sellerId: order.sellerId || (Array.isArray(order.products) ? order.products[0]?.sellerId : null),
      shipping: {
        ...existing,
        channel: ch,                               // ✅ always HouseBiBi Express
        channelCapabilities: ['pickup', 'dropoff'], // optional: allow both methods
        dts: existing.dts || 2,
        arranged: true,
        method: opts.method,
        pickup: opts.method === 'pickup' ? (opts.pickup || null) : null,
        arrangedAt: serverTimestamp(),
      }
    })

    printWaybill(order, opts)
  }

  // ----- Waybill (mapped to your actual field names) -----
  function printWaybill(order, opts) {
    const shopName =
      order.seller?.shopName ||
      order.seller?.name ||
      (Array.isArray(order.products) ? order.products[0]?.shopName : '') ||
      'Your Shop'

    // Buyer name/address from shippingAddress
    const buyerName =
      order.shippingAddress?.fullName ||
      order.buyer?.name ||
      'Buyer'

    const addr = order.shippingAddress
      ? [
          order.shippingAddress.streetName,
          order.shippingAddress.unitNumber ? `#${order.shippingAddress.unitNumber}` : '',
          order.shippingAddress.postalCode
        ].filter(Boolean).join(', ')
      : '—'

    // Products use item_name, quantity, size in your schema
    const itemsRows = (order.products || []).map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(p.item_name || p.name || '')}</td>
        <td>${escapeHtml(p.size || p.variant || '-')}</td>
        <td>${p.quantity ?? p.qty ?? 1}</td>
        <td>${formatMoney(p.price || 0)}</td>
      </tr>`).join('')

    const total = (order.products || [])
      .reduce((s, p) => s + (p.price || 0) * (p.quantity ?? p.qty ?? 1), 0)

    const awb = buildAwb(order)

    const w = window.open('', '_blank')
    w.document.write(`
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Waybill - ${order.id}</title>
        <style>
          *{box-sizing:border-box}
          body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;padding:24px}
          .sheet{width:800px;margin:0 auto;border:1px solid #e5e7eb;padding:24px}
          .meta{display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:12px}
          .box{border:1px dashed #94a3b8;padding:12px;border-radius:8px;margin:8px 0}
          table{width:100%;border-collapse:collapse;margin-top:8px;font-size:14px}
          th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
          th{background:#f8fafc}
          .right{text-align:right}
          .barcode{font-family:monospace;border:1px solid #000;padding:8px 12px;display:inline-block;margin-top:6px}
          .foot{font-size:12px;color:#64748b;margin-top:12px}
          @media print {.noprint{display:none}}
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="meta">
            <div><strong>${escapeHtml(shopName)}</strong><br/>Waybill / Air Waybill</div>
            <div class="right">
              <div>Order: <strong>${order.id}</strong></div>
              <div>AWB: <strong>${awb}</strong></div>
              <div>Tracking: <strong>${escapeHtml(order.trackingNumber || order.totals?.trackingNumber || order.logistics?.trackingNumber || '')}</strong></div>
              <div class="barcode">${awb.replace(/./g,'█')}</div>
            </div>
          </div>

          <div class="box">
            <strong>Ship To:</strong><br/>
            ${escapeHtml(buyerName)}<br/>
            ${escapeHtml(addr)}
          </div>

          <div class="box">
            <strong>Shipping Method:</strong> ${opts.method.toUpperCase()}
            ${opts.method === 'pickup'
              ? `<div>Pickup Date: ${opts.pickup?.date || ''} • Timeslot: ${opts.pickup?.slot || ''}</div>`
              : `<div>Drop-off: Please drop within 3 days at partner counter</div>`
            }
            <div>Courier: ${escapeHtml(order.logistics?.shipper || '—')}</div>
          </div>

          <table>
            <thead>
              <tr><th>#</th><th>Item</th><th>Variant</th><th>Qty</th><th>Unit Price</th></tr>
            </thead>
            <tbody>${itemsRows || `<tr><td colspan="5">No items</td></tr>`}</tbody>
            <tfoot>
              <tr><th colspan="4" class="right">Total</th><th>${formatMoney(total)}</th></tr>
            </tfoot>
          </table>

          <div class="foot">
            Generated by HousebibiGoWhere — attach this page to the parcel.
          </div>

          <div class="noprint" style="margin-top:12px;">
            <button onclick="window.print()">Print</button>
          </div>
        </div>
        <script>setTimeout(()=>window.print(), 200)</script>
      </body>
      </html>
    `)
    w.document.close()

    function formatMoney(n){ return 'S$ ' + (Math.round((n||0)*100)/100).toFixed(2) }
    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])) }
    function buildAwb(o){
      const base = (o.logistics?.shipper || o.shipping?.channel || 'SPX').toString().replace(/\s+/g,'').slice(0,4).toUpperCase()
      const tail = (o.id || '').slice(-6).toUpperCase()
      return `${base}-${tail}-${Date.now().toString().slice(-6)}`
    }
  }

  return { orders, counts, statusOf, arrangeShipment }
}
