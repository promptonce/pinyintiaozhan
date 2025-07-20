import { ref } from 'vue'

export function useShuangpinConverter() {
  const selectedScheme = ref('quanpin')
  
  const shuangpinSchemas = {
    "mspy": { 
      "name": "微软双拼", 
      "initials": {"ch": "i", "sh": "u", "zh": "v"}, 
      "finals": { 
        'a': 'a', 'o': 'o', 'e': 'e', 'ai': 'l', 'ei': 'z', 'ao': 'k', 'ou': 'b', 
        'an': 'j', 'en': 'f', 'er': 'r', 'ang': 'h', 'eng': 'g', 'ong': 's', 
        'i': 'i', 'ia': 'w', 'iao': 'c', 'ie': 'x', 'iu': 'q', 'ian': 'm', 
        'in': 'n', 'iang': 'd', 'ing': ';', 'u': 'u', 'ua': 'w', 'uo': 'o', 
        'uai': 'y', 'ui': 'v', 'uan': 'r', 'un': 'p', 'uang': 'd', 'v': 'y', 've': 't' 
      }, 
      "zero_initial_rule": {"type": "fixed", "key": "o"} 
    },
    // ... 其他双拼方案
  }

  const INITIALS = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's', 'y', 'w']

  function splitPinyin(pinyinStr) {
    // 拼音拆分逻辑 (从原代码移植)
    const syllables = []
    let current = 0
    
    while (current < pinyinStr.length) {
      let found = false
      for (let len = Math.min(6, pinyinStr.length - current); len > 0; len--) {
        const potentialSyllable = pinyinStr.substr(current, len)
        const initial = INITIALS.find(i => potentialSyllable.startsWith(i))
        const finalPart = initial ? potentialSyllable.substring(initial.length) : potentialSyllable
        
        if (Object.values(shuangpinSchemas.mspy.finals).includes(finalPart) || Object.keys(shuangpinSchemas.mspy.finals).includes(finalPart)) {
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
      sp_initial = scheme.initials[initial] || initial
    } else {
      const rule = scheme.zero_initial_rule
      if (rule.type === 'fixed') {
        sp_initial = rule.key
      } else if (rule.type === 'first_letter') {
        sp_initial = final[0]
      } else if (rule.type === 'hybrid') {
        if (rule.retained_finals.includes(final)) return final
        if (final.length === 1 && "aoe".includes(final)) return final + final
        sp_initial = final[0]
      }
    }

    sp_final = scheme.finals[final]
    if (typeof sp_final === 'undefined') return `[${syllable}]`

    return sp_initial + sp_final
  }

  function toShuangpin(quanpin, schemeKey) {
    if (!quanpin || !schemeKey || schemeKey === 'quanpin') return null
    const scheme = shuangpinSchemas[schemeKey]
    if (!scheme) return null
    
    const syllables = splitPinyin(quanpin)
    return syllables.map(s => convertSyllable(s, scheme)).join('')
  }

  return {
    selectedScheme,
    shuangpinSchemas,
    toShuangpin
  }
}