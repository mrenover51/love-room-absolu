import type {DateRange} from "@/lib/booking/types";
export interface ChannelRange extends DateRange {id:string;source:string;label:string}
export interface CalendarConflict {id:string;start:string;end:string;primary:ChannelRange;secondary:ChannelRange;resolution:"direct_wins"|"review"}
const overlaps=(a:DateRange,b:DateRange)=>a.start<b.end&&a.end>b.start;
export function detectCalendarConflicts(ranges:ChannelRange[]):CalendarConflict[]{const conflicts:CalendarConflict[]=[];for(let index=0;index<ranges.length;index+=1){for(let second=index+1;second<ranges.length;second+=1){const a=ranges[index],b=ranges[second];if(a.source===b.source||!overlaps(a,b))continue;const start=a.start>b.start?a.start:b.start,end=a.end<b.end?a.end:b.end;conflicts.push({id:`${a.id}:${b.id}`,start,end,primary:a.source==="direct"?a:b,secondary:a.source==="direct"?b:a,resolution:a.source==="direct"||b.source==="direct"?"direct_wins":"review"})}}return conflicts}
