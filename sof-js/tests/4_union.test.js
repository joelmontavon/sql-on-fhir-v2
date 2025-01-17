import { describe } from "bun:test";
import {
  start_case,
  end_case,
  add_test,
  add_throwing_test
} from './test_helpers.js'

let resources = [
  {
    resourceType: 'Patient',
    id: 'pt1',
    telecom: [
      { value: 't1.1', system: 's1.1' },
      { value: 't1.2', system: 's1.2' },
      { value: 't1.3', system: 's1.3' }
    ],
    contact: [
      {
        telecom: [{ value: 't1.c1.1', system: 's1.c1.1' }]
      },
      {
        telecom: [
          { value: 't1.c2.1', system: 's1.c2.1' },
          { value: 't1.c2.2', system: 's1.c2.2' }
        ]
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: 'pt2',
    telecom: [
      { value: 't2.1', system: 's2.1' },
      { value: 't2.2', system: 's2.2' }
    ]
  },
  {
    resourceType: 'Patient',
    id: 'pt3',
    contact: [
      {
        telecom: [
          { value: 't3.c1.1', system: 's3.c1.1' },
          { value: 't3.c1.2', system: 's3.c1.2' }
        ]
      },
      {
        telecom: [
          { value: 't3.c2.1', system: 's3.c2.1' }
        ]
      }
    ]
  },
  {
    resourceType: 'Patient',
    id: 'pt4'
  }
]

start_case('union', 'TBD', resources)

// TODO: duplicates in union

describe("union", () => {
  let result = [
    {tel: "t1.1",    sys: "s1.1",    id: "pt1"},
    {tel: "t1.2",    sys: "s1.2",    id: "pt1"},
    {tel: "t1.3",    sys: "s1.3",    id: "pt1"},
    {tel: "t1.c1.1", sys: "s1.c1.1", id: "pt1"},
    {tel: "t1.c2.1", sys: "s1.c2.1", id: "pt1"},
    {tel: "t1.c2.2", sys: "s1.c2.2", id: "pt1"},
    {tel: "t2.1",    sys: "s2.1",    id: "pt2"},
    {tel: "t2.2",    sys: "s2.2",    id: "pt2"},
    {tel: "t3.c1.1", sys: "s3.c1.1", id: "pt3"},
    {tel: "t3.c1.2", sys: "s3.c1.2", id: "pt3"},
    {tel: "t3.c2.1", sys: "s3.c2.1", id: "pt3"}
  ]

  // debug(unionAll, resources);
  add_test({
    title: 'basic',
    view: {
      select: [
        { column: [{ name: 'id', path: 'id' }] },
        {
          unionAll: [
            {
              forEach: 'telecom',
              column: [
                { name: 'tel', path: 'value' },
                { name: 'sys', path: 'system' }
              ]
            },
            {
              forEach: 'contact.telecom',
              column: [
                { name: 'tel', path: 'value' },
                { name: 'sys', path: 'system' }
              ]
            }
          ]
        }
      ]
    },
    expect: result
  });

  add_test({
    title: 'unionAll + column',
    view: {
      select: [
        {
          column: [{ name: 'id', path: 'id' }],
          unionAll: [
            {
              forEach: 'telecom',
              column: [
                { name: 'tel', path: 'value' },
                { name: 'sys', path: 'system' }]},
            {
              forEach: 'contact.telecom',
              column: [
                { name: 'tel', path: 'value' },
                { name: 'sys', path: 'system' }
              ]
            }
          ]
        }
      ]
    },
    expect: result
  });

  let unionDups = {
    select: [
      {
        column: [{ name: 'id', path: 'id' }],
        unionAll: [
          {
            forEach: 'telecom',
            column: [
              { name: 'tel', path: 'value' },
              { name: 'sys', path: 'system' }
            ]
          },
          {
            forEach: 'telecom',
            column: [
              { name: 'tel', path: 'value' },
              { name: 'sys', path: 'system' }
            ]
          }
        ]
      }
    ]
  };

  let dups_result = [
    { tel: "t1.1", sys: "s1.1", id: "pt1" },
    { tel: "t1.2", sys: "s1.2", id: "pt1" },
    { tel: "t1.3", sys: "s1.3", id: "pt1" },
    { tel: "t1.1", sys: "s1.1", id: "pt1" },
    { tel: "t1.2", sys: "s1.2", id: "pt1" },
    { tel: "t1.3", sys: "s1.3", id: "pt1" },
    { tel: "t2.1", sys: "s2.1", id: "pt2" },
    { tel: "t2.2", sys: "s2.2", id: "pt2" },
    { tel: "t2.1", sys: "s2.1", id: "pt2" },
    { tel: "t2.2", sys: "s2.2", id: "pt2" }
  ];

  add_test({ title: 'duplicates', view: unionDups, expect: dups_result });

  // TODO: add union with select

  add_test({
    title: 'empty results',
    view: {
      select: [
        {
          column: [{ name: 'id', path: 'id' }],
          unionAll: [
            {
              forEach: 'name',
              column: [{ name: 'given', path: 'given' }]
            },
            {
              forEach: 'name',
              column: [{ name: 'given', path: 'given' }]
            }
          ]
        }
      ]
    },
    expect: []
  });

  add_test({
    title: 'empty with forEachOrNull',
    view: {
      select: [
        {
          column: [{ name: 'id', path: 'id' }],
          unionAll: [
            {
              forEachOrNull: 'name',
              column: [{ name: 'given', path: 'given' }]
            },
            {
              forEachOrNull: 'name',
              column: [{ name: 'given', path: 'given' }]
            }
          ]
        }
      ]
    },
    expect: [
      { given: null, id: "pt1" },
      { given: null, id: "pt1" },
      { given: null, id: "pt2" },
      { given: null, id: "pt2" },
      { given: null, id: "pt3" },
      { given: null, id: "pt3" },
      { given: null, id: "pt4" },
      { given: null, id: "pt4" }
    ]
  });

  add_test({
    title: 'nested',
    view: {
      select: [
        {
          column: [{ name: 'id', path: 'id' }],
          unionAll: [
            {
              forEach: 'telecom[0]',
              column: [{ name: 'tel', path: 'value' }]
            },
            {
              unionAll: [
                {
                  forEach: 'telecom[0]',
                  column: [{ name: 'tel', path: 'value' }]
                },
                {
                  forEach: 'contact.telecom[0]',
                  column: [{ name: 'tel', path: 'value' }]
                }
              ]
            }
          ]
        }
      ]
    },
    expect: [
      { id: "pt1", tel: "t1.1" },
      { id: "pt1", tel: "t1.1" },
      { id: "pt1", tel: "t1.c1.1" },
      { id: "pt2", tel: "t2.1" },
      { id: "pt2", tel: "t2.1" },
      { id: "pt3", tel: "t3.c1.1" }
    ]
  });

  add_test({
    title: 'one empty operand',
    view: {
      select: [
        { column: [{ name: 'id', path: 'id' }] },
        {
          unionAll: [
            {
              forEach: 'telecom.where(false)',
              column: [
                { name: 'tel', path: 'value' },
                { name: 'sys', path: 'system' }
              ]
            },
            {
              forEach: 'contact.telecom',
              column: [
                { name: 'tel', path: 'value' },
                { name: 'sys', path: 'system' }
              ]
            }
          ]
        }
      ]
    },
    expect: [
      { id: "pt1", sys: "s1.c1.1", tel: "t1.c1.1" },
      { id: "pt1", sys: "s1.c2.1", tel: "t1.c2.1" },
      { id: "pt1", sys: "s1.c2.2", tel: "t1.c2.2" },
      { id: "pt3", sys: "s3.c1.1", tel: "t3.c1.1" },
      { id: "pt3", sys: "s3.c1.2", tel: "t3.c1.2" },
      { id: "pt3", sys: "s3.c2.1", tel: "t3.c2.1" }
    ]
  });

  add_throwing_test({
    title: 'column mismatch',
    view: {
      select: [
        {
          unionAll: [
            {
              column: [
                {name: 'a', path: 'a'},
                {name: 'b', path: 'b'}
              ]
            },
            {
              column: [
                {name: 'a', path: 'a'},
                {name: 'c', path: 'c'}
              ]
            }
          ]
        }
      ]
    },
    expectError: "columns mismatch"
  })

  // as per https://build.fhir.org/ig/FHIR/sql-on-fhir-v2/StructureDefinition-ViewDefinition.html#unionall-column-requirements
  add_throwing_test({
    title: 'column order mismatch',
    view: {
      select: [
        {
          unionAll: [
            {
              column: [
                {name: 'a', path: 'a'},
                {name: 'b', path: 'b'}
              ]
            },
            {
              column: [
                {name: 'b', path: 'b'},
                {name: 'a', path: 'a'}
              ]
            }
          ]
        }
      ]
    },
    expectError: "columns mismatch"
  })

  end_case()
});

