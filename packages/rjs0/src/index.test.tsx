// import { describe, expect, it } from 'bun:test'
// import { Rjs0 } from './index.js'
// import z from 'zod'
// По сути не трансформер, а сеттер, и он может либо добавить в метк, либо добавить утилиты
// describe('Rjs0', () => {
//   it('core functionality', () => {
//     expect(Rjs0).toBeDefined()

//     // we need widgets to infer it input type, and validate it on create meta schema
//     const viewWidgets = {
//       TextView: ({ size, value }: { size: 'small' | 'medium' | 'large'; value: string }) => (
//         <div data-size={size}>{value}</div>
//       ),
//       NumberView: ({ color, value }: { color: string; value: number }) => <div data-color={color}>{value}</div>,
//       // BooleanView: {
//       //   propsSchema: z.object({
//       //     color: z.string(),
//       //     value: z.boolean(),
//       //   }),
//       //   Component: ({ color, value }: { color: string; value: boolean }) => (
//       //     <div data-color={color}>{value ? 'True' : 'False'}</div>
//       //   ),
//       // },
//     }

//     const formWidgets = {
//       NumberView: ({ color, value }: { color: string; value: number }) => <div data-color={color}>{value}</div>,
//     }

//     const xSchema = {
//       type: 'object',
//       properties: {
//         XXX: {
//           type: 'number',
//           'x-0': { widget: 'NumberView', props: { color: 'red' } },
//         },
//         YYYY: {
//           type: 'string',
//         },
//         ZZ: {
//           type: 'boolean',
//         },
//       },
//       required: ['x', 'b'],
//       additionalProperties: false,
//     }

//     const rjs0 = Rjs0.create({
//       // maeybe we do not need it, we can just add tranformer for parsing
//       // but scope is builtin thing I think
//       metaKey: ['x-0', 'x-rjs0', 'rjs0'],
//     })
//       .util(baseUtils)
//       .transformer(baseTransformer)
//       .transformer(
//         getParseMetaTransformer<{
//           generalProp1?: string
//           generalProp2?: number
//           generalProp3?: boolean
//         }>(['x-0', 'x-rjs0', 'rjs0']),
//       )
//       .util(function something(js) {
//         return js
//       })
//       .transformer(function toNonNullable(js) {
//         if (js.anyOf && js.anyOf.length === 2 && js.anyOf.includes('null')) {
//           return {
//             ...js,
//             nullable: false,
//           }
//         }
//         return {
//           nullable: true,
//           ...omit(js, ['anyOf']),
//           ...pick(js, ['type']),
//         }
//       })
//       .transformer(function addX(js) {
//         return {
//           ...js,
//           x: 1,
//           y: js.something,
//         }
//       })
//       .util(function isTypeEq(js, utils, type: string) {
//         return js.type === type
//       })
//       .util({
//         isRequired: (js, utils) => {
//           return !!js.parent.required.includes(js.key)
//         },
//         isNullable: (js, utils) => {
//           return !!js.value.nullable
//         },
//       })

//     const coolJsSchema = rjs0.parse({ x: 1, b: 2 })
//     const coolJsSchema2 = rjs0.parse(z.object({ x: z.number(), b: z.number() }))

//     // $ stroe for this js schema
//     // $$ global store

//     const RjsView = rjs0
//       .transformer(getParseMetaWidgetsTransformer<typeof viewWidgets>(['x-0:view', 'x-rjs0:view', 'rjs0:view']))
//       .renderer([
//         {
//           when: (jsd) => js.asCard,
//           render: (jsd, { next }) => (
//             <div className="card">
//               {jsd.title && <h1>{jsd.title}</h1>}
//               <div>{next()}</div>
//             </div>
//           ),
//         },
//         {
//           when: (jsd) => jsd.isTypeEq('object'),
//           render: (jsd, { $, $$, render }) => {
//             if (jsd.asDecriptions) {
//               return 123
//             }
//             return (
//               <div>
//                 {jsd.mapProperties((propKey, propJsd) => {
//                   return (
//                     <div key={key}>
//                       <h3>{propJsd.title}</h3>
//                       <div>{render(propJsd)}</div>
//                     </div>
//                   )
//                 })}
//               </div>
//             )
//           },
//         },
//         (jsd, { next }) => {
//           if (jsd.type === 'string') {
//             return <div>Number: {jsd.number}</div>
//           }
//           return next()
//         },
//         {
//           when: [{ type: 'string' }, { type: 'zxc' }], // OR statement
//           render: (jsd) => {
//             return <div>String: {jsd.value}</div>
//           },
//         },
//         {
//           render: (jsd) => {
//             const Widget = viewWidgets[jsd.widget] || TextView
//             return <Widget {...jsd.props} value={jsd.value} />
//           },
//         },
//       ])

//     const myView = <RjsView js={jsSchema} data={data} />

//     // const MyTarget = () => {
//     //   const schema = useExternalOpenapiSchema()

//     //   return <Target when={() => } />
//     // }

//     // const refineResourcesBuilder = rjs0.builder<object>([
//     //   {
//     //     when: (jsd) => js.asCard,
//     //     build: (jsd, { next }) => ({
//     //       title: `This is card`,
//     //       value: next(),
//     //     }),
//     //   },
//     //   {
//     //     when: (jsd) => jsd.isTypeEq('object'),
//     //     write: (jsd, { $, $$, write }) => {
//     //       return {
//     //         title: `Hello, this is ${jsd.title}`,
//     //         ...Object.fromEntries(
//     //           jsd.mapProperties((propKey, propJsd) => {
//     //             return [propKey, write(propJsd)]
//     //           }),
//     //         ),
//     //       }
//     //     },
//     //   },
//     //   {
//     //     when: [{ type: 'string' }, { widget: 'string' }],
//     //     write: (write) => {
//     //       return <div>String: {jsd.value}</div>
//     //     },
//     //   },
//     // ])
//   })
// })
