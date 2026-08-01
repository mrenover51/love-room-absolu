import {cn} from '@/lib/utils';export function Skeleton({className}:{className?:string}){return <div aria-hidden="true" className={cn('animate-pulse rounded-xl bg-white/[.07]',className)}/>}
