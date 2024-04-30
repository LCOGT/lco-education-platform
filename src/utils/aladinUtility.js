function loadScript (url, callback) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = url
    script.onload = () => resolve(callback ? callback() : undefined)
    script.onerror = () => reject(new Error(`Failed to load script at ${url}`))
    document.head.appendChild(script)
  })
}

export function loadAladinScript () {
  return new Promise((resolve, reject) => {
    loadScript('https://code.jquery.com/jquery-1.12.1.min.js')
      .then(() => {
        return loadScript('https://aladin.u-strasbg.fr/AladinLite/api/v3/latest/aladin.js')
      })
      .then(() => {
        if (typeof A !== 'undefined' && A.aladin && A.init) {
          A.init.then(() => {
            resolve(A)
          }).catch((initError) => {
            throw new Error(`Error during Aladin initialization: ${initError}`)
          })
        } else {
          throw new Error("Aladin script loaded but 'A' or 'A.aladin' or 'A.init' is undefined.")
        }
      })
      .catch(error => {
        console.error('Error loading scripts: ', error)
        reject(error)
      })
  })
}

export async function initializeAladin (el, options) {
  try {
    const A = await loadAladinScript()
    const aladinInstance = new A.aladin(el, options)
    return aladinInstance
  } catch (error) {
    console.error('Failed to initialize Aladin:', error)
  }
}
