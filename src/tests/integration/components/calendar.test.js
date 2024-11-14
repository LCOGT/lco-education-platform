import { shallowMount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Calendar from '../../../components/Scheduling/Calendar.vue'
import { fetchSemesterData, currentSemesterEnd } from '../../../utils/calendarUtils'
import flushPromises from 'flush-promises'

vi.mock('../../../utils/calendarUtils', () => ({
  fetchSemesterData: vi.fn(),
  currentSemesterEnd: '2024-08-01T12:00:00Z'
}))

describe('Calendar.vue', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()

    const VDatePickerStub = {
      name: 'VDatePicker',
      template: '<div></div>',
      props: ['max-date']
    }

    wrapper = shallowMount(Calendar, {
      global: {
        stubs: {
          VDatePicker: VDatePickerStub
        }
      }
    })
  })

  it('calls fetchSemesterData on mount', () => {
    expect(fetchSemesterData).toHaveBeenCalledTimes(1)
  })

  it('passes the correct max-date to VDatePicker', async () => {
    await flushPromises()
    const datePicker = wrapper.findComponent({ name: 'VDatePicker' })
    expect(datePicker.exists()).toBe(true)
    // Note: The prop name 'maxDate' is camel-cased instead of using 'max-date' because Vue automatically converts kebab-case prop names to camelCase
    // when passing them in js. In templates, we use 'max-date', but when accessing props programmatically, we use 'maxDate'
    const maxDateProp = datePicker.props('maxDate')
    const maxDateIsoString = new Date(maxDateProp).toISOString().split('.')[0] + 'Z'
    expect(maxDateIsoString).toBe(currentSemesterEnd)
  })
})
