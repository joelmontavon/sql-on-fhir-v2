import { describe } from 'bun:test'
import { start_case, end_case, invalid_view, debug } from './test_helpers.js'

let resources = [
  { id: 'pt1', resourceType: 'Patient' },
  { id: 'pt2', resourceType: 'Patient' },
]

start_case('validate', 'TBD', resources)

describe('validate', () => {
  invalid_view({ title: 'empty', view: {}, error: 'structure' })

  invalid_view({ title: 'wrong-fhirpath', view: { select: [{ forEach: '@@' }] }, error: 'fhirpath' })

  invalid_view({ title: 'wrong-type', view: { select: [{ forEach: 1 }] }, error: 'structure' })

  invalid_view({
    title: 'bad-unionAll',
    view: {
      select: [
        { unionAll: [{ column: [{ name: 'a', path: 'a' }] }, { column: [{ name: 'b', path: 'b' }] }] },
      ],
    },
    error: 'columns mismatch',
  })

  end_case()
})