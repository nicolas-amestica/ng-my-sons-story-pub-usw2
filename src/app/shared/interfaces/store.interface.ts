import { Prettify, StateSignals, WritableStateSource } from '@ngrx/signals';

type MethodsDictionary = Record<string, (...args: never[]) => unknown>;

/**
 * @description Tipo alineado al portal (signalStore + métodos).
 */
export type Store<T extends object> = Prettify<
  StateSignals<T> & object & MethodsDictionary & WritableStateSource<T>
>;
