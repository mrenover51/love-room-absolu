"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { auditAdminAction } from "@/lib/admin/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { acceptManualReservationRequest, rejectManualReservationRequest } from "@/lib/booking/manual-request-service";

const idFrom=(formData:FormData)=>z.uuid().parse(formData.get("id"));
export async function acceptRequest(formData:FormData){await requireAdmin();const id=idFrom(formData);await acceptManualReservationRequest(id);await auditAdminAction("reservation_request.accept","reservation_request",id);revalidatePath("/admin/demandes-reservation");revalidatePath("/admin/calendrier")}
export async function rejectRequest(formData:FormData){await requireAdmin();const id=idFrom(formData),notes=z.string().trim().max(5000).optional().parse(formData.get("admin_notes")||undefined);await rejectManualReservationRequest(id,notes);await auditAdminAction("reservation_request.reject","reservation_request",id);revalidatePath("/admin/demandes-reservation");revalidatePath("/admin/calendrier")}
export async function updateRequest(formData:FormData){await requireAdmin();const input=z.object({id:z.uuid(),nom:z.string().trim().min(1).max(100),prenom:z.string().trim().min(1).max(100),email:z.email(),telephone:z.string().trim().min(6).max(30),message:z.string().trim().max(1500).optional(),admin_notes:z.string().trim().max(5000).optional()}).parse(Object.fromEntries(formData));const{error}=await createAdminClient().from("reservation_requests").update({nom:input.nom,prenom:input.prenom,email:input.email,telephone:input.telephone,message:input.message||null,admin_notes:input.admin_notes||null,updated_at:new Date().toISOString()}).eq("id",input.id).in("statut",["new","accepted"]);if(error)throw new Error("RESERVATION_REQUEST_UPDATE_FAILED");await auditAdminAction("reservation_request.update","reservation_request",input.id);revalidatePath(`/admin/demandes-reservation/${input.id}`);revalidatePath("/admin/demandes-reservation")}
