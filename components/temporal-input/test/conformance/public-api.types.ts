import type { TemporalInputType as W } from '@vyrnforge/web/temporal-input';
import type { TemporalInputType as RType } from '@vyrnforge/react/temporal-input';
import type { TemporalInputType as AType } from '@vyrnforge/angular/temporal-input';
import type { TemporalInputType as VType } from '@vyrnforge/vue/temporal-input';
type R = typeof import('@vyrnforge/react/temporal-input').TemporalInput;
type A = typeof import('@vyrnforge/angular/temporal-input').VfTemporalInputDirective;
type V = typeof import('@vyrnforge/vue/temporal-input').TemporalInput;
const types: [W,RType,AType,VType] = ['date','time','datetime-local','week'];
const values: [R|undefined,A|undefined,V|undefined] = [undefined,undefined,undefined];
// @ts-expect-error composite picker vocabulary is outside TemporalInput.
const invalid: W = 'calendar';
void [types, values, invalid];
