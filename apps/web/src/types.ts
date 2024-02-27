import type { inferRouterContext, inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from 'rent-house-server';

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
export type RouterContext = inferRouterContext<AppRouter>;

export type ProductVm = RouterOutput['products']['getProduct'];
export type CustomerVm = RouterOutput['customers']['getCustomer'];
export type RentOutVm = RouterOutput['rentOuts']['getRentOut'];
