import { ref } from 'vue'

export function useShuangpinConverter() {
  const selectedScheme = ref('quanpin')
  
  const shuangpinSchemas = {}
  // 动态导入所有双拼方案
  const modules = import.meta.glob('../scheme/*.js', { eager: true })
  for (const path in modules) {
    const scheme = modules[path].default
    shuangpinSchemas[scheme.id] = scheme
  }
  const INITIALS = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w']

  function splitPinyin(pinyinStr, finals) {
    // 拼音拆分逻辑 (更新为使用传入的finals参数)
    const syllables = []
    let current = 0
    
    while (current < pinyinStr.length) {
      let found = false
      for (let len = Math.min(6, pinyinStr.length - current); len > 0; len--) {
        const potentialSyllable = pinyinStr.substr(current, len)
        const initial = INITIALS.find(i => potentialSyllable.startsWith(i))
        const finalPart = initial ? potentialSyllable.substring(initial.length) : potentialSyllable
        
        if (Object.values(finals).includes(finalPart) || Object.keys(finals).includes(finalPart)) {
          syllables.push(potentialSyllable)
          current += len
          found = true
          break
        }
      }
      if (!found) {
        syllables.push(pinyinStr[current])
        current++
      }
    }
    
    return syllables
  }

  function convertSyllable(syllable, scheme) {
    // 音节转换逻辑 (从原代码移植)
    syllable = syllable.replace('ü', 'v')
    let initial = INITIALS.find(i => syllable.startsWith(i)) || null
    let final = initial ? syllable.substring(initial.length) : syllable

    let sp_initial = ''
    let sp_final = ''

    if (initial) {
      sp_initial = scheme.detail.sheng[initial] || initial
    } else {
      // 使用scheme.detail.other处理零声母
      const zeroInitialEntry = scheme.detail.other[final]
      if (zeroInitialEntry) {
        return Array.isArray(zeroInitialEntry) ? zeroInitialEntry[0] : zeroInitialEntry
      }
      sp_initial = final[0]
    }

    sp_final = scheme.detail.yun[final]
    if (typeof sp_final === 'undefined') return `[${syllable}]`

    return sp_initial + sp_final
  }

  function toShuangpin(quanpin, schemeKey) {
    if (!quanpin || !schemeKey || schemeKey === 'quanpin') return null
    const scheme = shuangpinSchemas[schemeKey]
    if (!scheme) return null
    
    const syllables = splitPinyin(quanpin, scheme.detail.yun)
    return syllables.map(s => convertSyllable(s, scheme)).join('')
  }

  return {
    selectedScheme,
    shuangpinSchemas,
    toShuangpin
  }
}