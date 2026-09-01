import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Blocs animes a l apparition. La classe .reveal est posee par le script et
 * non ecrite dans le HTML : si le JavaScript ne s execute pas, la page reste
 * entierement visible.
 */
const TARGETS = [
  '.section-head',
  '.grid > *',
  '.features > *',
  '.phone-cards > *',
  '.stat-grid > *',
  '.detail-gallery',
  '.detail aside',
  '.table-wrap',
  '.login-card',
  '.filters',
]

const STAGGER_MAX = 6
/** Un bloc se revele des que son haut passe sous 94% de la hauteur d ecran. */
const TRIGGER_RATIO = 0.94

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Anime l apparition des blocs au defilement.
 *
 * Le test est geometrique (getBoundingClientRect) plutot que base sur
 * IntersectionObserver : le comportement est identique a l usage, mais reste
 * previsible quand la page est chargee en arriere-plan, et ne depend pas du
 * nombre de fois que React monte l effet.
 */
export function useScrollReveal() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (prefersReducedMotion()) return undefined

    const pending = new Set()
    let timer = 0
    let last = 0

    const reveal = (el) => {
      pending.delete(el)
      el.classList.add('is-visible')

      // Une fois l entree jouee, on retire les classes : les transitions de
      // survol retrouvent ainsi leur duree normale.
      const done = () => {
        el.dataset.reveal = 'done'
        el.classList.remove('reveal', 'is-visible')
        el.style.removeProperty('--i')
      }
      el.addEventListener('transitionend', done, { once: true })
      window.setTimeout(done, 1800)
    }

    const check = () => {
      last = Date.now()
      const limit = window.innerHeight * TRIGGER_RATIO
      if (limit <= 0) return
      Array.from(pending).forEach((el) => {
        if (el.getBoundingClientRect().top < limit) reveal(el)
      })
    }

    // Temporisation simple plutot que requestAnimationFrame : les frames sont
    // suspendues quand l onglet est en arriere-plan, ce qui laisserait des
    // blocs a opacite 0 au retour sur la page.
    const schedule = () => {
      if (Date.now() - last >= 90) {
        check()
      } else if (!timer) {
        timer = window.setTimeout(() => {
          timer = 0
          check()
        }, 90)
      }
    }

    const scan = () => {
      TARGETS.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el, index) => {
          if (el.dataset.reveal === 'done' || pending.has(el)) return
          if (!el.classList.contains('reveal')) {
            el.style.setProperty('--i', String(Math.min(index, STAGGER_MAX)))
            el.classList.add('reveal')
          }
          pending.add(el)
        })
      })
      schedule()
    }

    scan()

    // Les vehicules arrivent de l API apres le premier rendu.
    let scanTimer = 0
    const mo = new MutationObserver(() => {
      if (scanTimer) return
      scanTimer = window.setTimeout(() => {
        scanTimer = 0
        scan()
      }, 60)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    document.addEventListener('visibilitychange', schedule)

    return () => {
      if (timer) window.clearTimeout(timer)
      if (scanTimer) window.clearTimeout(scanTimer)
      mo.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      document.removeEventListener('visibilitychange', schedule)
      // filet de securite : ne jamais laisser un bloc a opacite 0 sans rien
      // pour le reveler.
      pending.forEach((el) => el.classList.remove('reveal'))
    }
  }, [pathname])
}

/** Fine barre doree indiquant la progression de lecture de la page. */
export function ScrollProgress() {
  const ref = useRef(null)

  useEffect(() => {
    const bar = ref.current
    if (!bar) return undefined

    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - window.innerHeight
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0
      bar.style.setProperty('--p', Math.min(1, Math.max(0, ratio)).toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return <div className="scroll-progress" ref={ref} aria-hidden="true" />
}
