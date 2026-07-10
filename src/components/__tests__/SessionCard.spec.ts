import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SessionCard from '../SessionCard.vue'
import type { TimeSession } from '../../types/session'

const mockSession: TimeSession = {
  id: 'test-1',
  startTime: new Date('2026-07-10T09:00:00').getTime(),
  endTime: new Date('2026-07-10T11:30:00').getTime(),
  duration: 9000000, // 2ч 30м
  date: '2026-07-10',
}

describe('SessionCard', () => {
  it('отображает время начала и длительность', () => {
    const wrapper = mount(SessionCard, {
      props: { session: mockSession },
    })
    expect(wrapper.text()).toContain('09:00')
    expect(wrapper.text()).toContain('11:30')
    expect(wrapper.text()).toContain('02:30:00')
  })

  it('отображает "…" для null endTime', () => {
    const session: TimeSession = { ...mockSession, endTime: null }
    const wrapper = mount(SessionCard, {
      props: { session },
    })
    expect(wrapper.text()).toContain('…')
  })

  it('эмитит delete при клике на кнопку удаления', async () => {
    const wrapper = mount(SessionCard, {
      props: { session: mockSession },
    })
    const deleteBtn = wrapper.find('button')
    await deleteBtn.trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]).toEqual(['test-1'])
  })
})
