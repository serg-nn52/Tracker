import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimerDisplay from '../TimerDisplay.vue'

describe('TimerDisplay', () => {
  it('отображает время в формате ЧЧ:ММ:СС', () => {
    const wrapper = mount(TimerDisplay, {
      props: { elapsed: 3661000 }, // 1ч 1м 1с
    })
    expect(wrapper.text()).toContain('01:01:01')
  })

  it('отображает нули при 0ms', () => {
    const wrapper = mount(TimerDisplay, {
      props: { elapsed: 0 },
    })
    expect(wrapper.text()).toContain('00:00:00')
  })

  it('корректно отображает только часы', () => {
    const wrapper = mount(TimerDisplay, {
      props: { elapsed: 7200000 }, // 2ч
    })
    expect(wrapper.text()).toContain('02:00:00')
  })

  it('корректно отображает большие значения', () => {
    const wrapper = mount(TimerDisplay, {
      props: { elapsed: 99999000 }, // 27ч 46м 39с
    })
    expect(wrapper.text()).toContain('27:46:39')
  })
})
