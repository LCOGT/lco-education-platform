function loadScript (url, callback) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = () => resolve(callback ? callback() : undefined)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export function loadAladinScript () {
  return new Promise((resolve, reject) => {
    if (typeof jQuery === 'undefined') {
      loadScript('https://code.jquery.com/jquery-3.6.0.min.js', () => {
        loadAladin().then(resolve).catch(reject)
      }).catch(reject)
    } else {
      loadAladin().then(resolve).catch(reject)
    }
  })
}

function loadAladin () {
  return loadScript('https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js', () => {
    if (typeof A !== 'undefined' && A.aladin) {
      return A
    } else {
      throw new Error("Aladin script loaded but 'A' or 'A.aladin' is undefined.")
    }
  })
}

export async function initializeAladin (el, options) {
  const A = await loadAladinScript()
  return new A.aladin(el, options)
}
