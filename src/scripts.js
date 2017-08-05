(() => {
  'use strict'

  const GIPHY_API_KEY = '8604a01e4a634ffd8287094bb997eb09'
  const IMAGE_COUNT_INITIAL = 50
  const IMAGE_COUNT_UPDATE = 25
  const SCROLL_BOTTOM_MIN = 600

  let results = []
  let lightboxIndex = 0

  const fetchJson = (url) => fetch(url).then(res => res.json())

  const fetchGiphySearch = (query, offset, limit) => fetchJson(
    `https://api.giphy.com/v1/gifs/search?`
    + `api_key=${GIPHY_API_KEY}`
    + `&q=${encodeURIComponent(query)}`
    + `&offset=${offset}`
    + `&limit=${limit}`
  )

  const buildResult = (item, index) => {
    const div = document.createElement('div')
    div.classList.add('result-item')

    const image = item.images.fixed_height_still
    div.innerHTML = `
      <div class="item-margin item-margin-left"></div>
      <div class="item-margin item-margin-right"></div>
      <img src="${image.url}" class="item-image" data-index="${index}" />
    `

    return div
  }  

  const $resultList = document.querySelector('.result-list')
  const $lightbox = document.querySelector('.lightbox')
  const $lightboxImage = document.querySelector('.lightbox-image')
  const $lightboxCaption = document.querySelector('.lightbox-caption')

  const search = (query, isUpdate = false, cb) => {
    fetchGiphySearch(query, results.length, isUpdate ? IMAGE_COUNT_UPDATE : IMAGE_COUNT_INITIAL)
      .then(res => {
        const data = res.data

        if (data && data.length) {
          if (!isUpdate) {
            $resultList.innerHTML = ''
            results = []
          }

          $resultList.append(...data.map((item, i) => buildResult(item, results.length + i)))
          results.push(...data)
        }

        if (cb) cb()
      })
  }

  const navigateLightbox = (index) => {
    lightboxIndex = Math.max(0, Math.min(results.length - 1, index))
    const item = results[lightboxIndex]
    $lightboxImage.style.backgroundImage = `url(${item.images.original.url})`
    $lightboxCaption.innerHTML = `Source: ${item.source_tld || 'N/A'}`
  }

  document.addEventListener('click', event => {
    const classList = event.target.classList

    if (classList.contains('item-image')) {
      $lightbox.classList.add('lightbox--visible')
      navigateLightbox(event.target.dataset.index)
    } else if (classList.contains('lightbox-close')) {
      $lightbox.classList.remove('lightbox--visible')
    } else if (classList.contains('lightbox-left')) {
      navigateLightbox(lightboxIndex - 1)
    } else if (classList.contains('lightbox-right')) {
      navigateLightbox(lightboxIndex + 1)
    }
  })
  
  let scrollY = 0
  let isTicking = false
  let pauseInfiniteScroll = false
  
  window.addEventListener('scroll', () => {
    scrollY = window.pageYOffset
          || document.documentElement.scrollTop
          || document.body.scrollTop
          || 0
    
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight, 
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    )

    if (!isTicking) {
      requestAnimationFrame(() => {
        if (!pauseInfiniteScroll && scrollY > scrollHeight - window.innerHeight - SCROLL_BOTTOM_MIN) {
          pauseInfiniteScroll = true
          search('sponge bob', true, () => {
            pauseInfiniteScroll = false
          })
        }
        isTicking = false;
      });
    }
    isTicking = true;
  })

  search('sponge bob')
})()