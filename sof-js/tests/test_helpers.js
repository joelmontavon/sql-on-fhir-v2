import { errors, evaluate } from '../src/index.js'
import { afterAll, expect, test } from 'bun:test'
import fs from 'fs'

let test_case = null
export function start_case(name, desc, resources) {
  test_case = {
    title: name,
    description: desc,
    resources: resources,
    tests: [],
  }
}

export function run_test(viewdef, result) {
  // TODO: dump tests
  let res = evaluate(viewdef, test_case.resources)
  test_case.tests.push({ view: viewdef, expect: result })
  expect(res).toEqual(result)
}

export function add_test(opts) {
  test(opts.title, () => {
    test_case.tests.push(opts)
    let res = evaluate(opts.view, test_case.resources)
    expect(res).toEqual(opts.expect)
  })
}

export function invalid_view(opts) {
  test(opts.title, () => {
    test_case.tests.push(opts)
    let errs = errors(opts.view, test_case.resources)
    console.log(errs)
    expect((errs || []).length > 0).toEqual(true)
  })
}

export function end_case(name, desc, resources) {
  // TODO: publish test case

  afterAll(() => {
    // console.log(JSON.stringify(test_case, null, 2));
    let file_name = __dirname + '/../../tests/' + test_case.title + '.json'
    fs.writeFileSync(file_name, JSON.stringify(test_case, null, 2) + '\n')
    console.log('write: ', file_name)
  })
}

export function debug(viewdef) {
  let res = evaluate(viewdef, test_case.resources)
  console.log('result:', res)
  return res
}

export function should_fail(viewdef) {
  // TODO: dump tests
}