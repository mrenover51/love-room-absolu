"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureGuestPortalToken } from "@/lib/guest-portal/repository";
import { processGuestCommunications } from "@/lib/guest-portal/communications";
import type { CommunicationType } from "@/lib/guest-portal/types";
const idSchema=z.uuid(),typeSchema=z.enum(['confirmation','pre_arrival','access_ready','checkout_reminder','post_stay_review']);
export async function generatePortal(formData:FormData){await requireAdmin();const id=idSchema.parse(formData.get('id'));await ensureGuestPortalToken(id,formData.get('regenerate')==='yes');await auditAdminAction(formData.get('regenerate')==='yes'?'guest_portal.regenerate':'guest_portal.create','reservation',id);revalidatePath(`/admin/reservations/${id}`)}
export async function saveReservationAccess(formData:FormData){await requireAdmin();const input=z.object({id:z.uuid(),keyboxCode:z.union([z.literal(''),z.string().trim().min(3).max(32)]),keyboxRevealTime:z.union([z.literal(''),z.string().regex(/^\d{2}:\d{2}$/)])}).parse(Object.fromEntries(formData));const{error}=await createAdminClient().from('reservations').update({keybox_code:input.keyboxCode||null,keybox_reveal_time:input.keyboxRevealTime||null,updated_at:new Date().toISOString()}).eq('id',input.id);if(error)throw new Error('Accès impossible à enregistrer');await auditAdminAction('guest_portal.access_update','reservation',input.id,{code:input.keyboxCode?'configured':'default',revealTime:input.keyboxRevealTime||'default'});revalidatePath(`/admin/reservations/${input.id}`)}
export async function sendCommunicationNow(formData:FormData){await requireAdmin();const id=idSchema.parse(formData.get('id')),type=typeSchema.parse(formData.get('type')) as CommunicationType,force=formData.get('force')==='yes';await processGuestCommunications(new Date(),{reservationId:id,type,force});await auditAdminAction(force?'communication.resend':'communication.send','reservation',id,{type});revalidatePath(`/admin/reservations/${id}`)}
export async function cancelCommunication(formData:FormData){await requireAdmin();const id=idSchema.parse(formData.get('id')),type=typeSchema.parse(formData.get('type'));await createAdminClient().from('reservation_communications').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('reservation_id',id).eq('type',type).is('sent_at',null);await auditAdminAction('communication.cancel','reservation',id,{type});revalidatePath(`/admin/reservations/${id}`)}

