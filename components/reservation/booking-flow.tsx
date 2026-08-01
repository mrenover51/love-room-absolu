"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationRequestSchema, type ReservationRequestInput } from "@/lib/booking/validation";
import { calculateStayPrice, defaultPricingConfig } from "@/lib/booking/pricing";
import { DateRangePicker } from "./date-range-picker";
import { ExtrasSelector } from "./extras-selector";
import { GuestDetailsForm } from "./guest-details-form";
import { BookingSummary } from "./booking-summary";

const steps = ["Dates", "Options", "Informations", "Confirmation"];
export function BookingFlow() {
  const router=useRouter(),headingRef=useRef<HTMLHeadingElement>(null),[step,setStep]=useState(0),[serverError,setServerError]=useState(""),[loading,setLoading]=useState(false);
  const form=useForm<ReservationRequestInput>({resolver:zodResolver(reservationRequestSchema),defaultValues:{checkIn:"",checkOut:"",extraKeys:[],firstName:"",lastName:"",email:"",phone:"",guestCount:2,message:"",acceptTerms:false,acceptPrivacy:false,website:""}});
  // eslint-disable-next-line react-hooks/incompatible-library -- Le récapitulatif doit refléter chaque modification du formulaire.
  const values=form.watch();
  const pricing=useMemo(()=>{try{return values.checkIn&&values.checkOut?calculateStayPrice(values.checkIn,values.checkOut,values.extraKeys??[]):null}catch{return null}},[values.checkIn,values.checkOut,values.extraKeys]);
  useEffect(()=>{headingRef.current?.focus({preventScroll:true})},[step]);
  function goTo(nextStep:number){setServerError("");setStep(nextStep);requestAnimationFrame(()=>window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}))}
  async function next() {
    setServerError("");
    if(step===0){
      if(!values.checkIn||!values.checkOut||!pricing){setServerError("Sélectionnez une arrivée et un départ valides.");return}
      try{const response=await fetch(`/api/availability?from=${values.checkIn}&to=${values.checkOut}`),data=await response.json();if(!response.ok||data.ranges?.length){router.push("/reservation/indisponible");return}}catch{setServerError("Les disponibilités ne peuvent pas être vérifiées pour le moment.");return}
    }
    if(step===2&&!await form.trigger(["firstName","lastName","email","phone","guestCount","acceptTerms","acceptPrivacy"]))return;
    goTo(Math.min(3,step+1));
  }
  async function submit(data:ReservationRequestInput) {
    if(loading)return;setLoading(true);setServerError("");
    try{const response=await fetch("/api/stripe/create-checkout-session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)}),result=await response.json();if(!response.ok){if(response.status===409&&result.code==="DATES_UNAVAILABLE"){router.push("/reservation/indisponible");return}throw new Error(result.error)}if(!result.url)throw new Error("Le paiement n’a pas pu être ouvert.");window.location.assign(result.url)}catch(error){setServerError(error instanceof Error?error.message:"Une erreur est survenue.");setLoading(false)}
  }
  return <form onSubmit={form.handleSubmit(submit)} noValidate><ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Étapes de réservation">{steps.map((label,index)=><li key={label} aria-current={index===step?"step":undefined} className={`border-t pt-3 text-center text-[.58rem] uppercase tracking-wider sm:text-[.68rem] ${index<=step?"border-[#C9A86A] text-[#D8C8B6]":"border-white/10 text-white/30"}`}>{index+1}. {label}</li>)}</ol><div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="min-w-0 border border-white/10 bg-black/25 p-5 sm:p-8"><h2 ref={headingRef} tabIndex={-1} className="sr-only">Étape {step+1} : {steps[step]}</h2>
    {step===0&&<DateRangePicker checkIn={values.checkIn} checkOut={values.checkOut} onChange={(checkIn,checkOut)=>{form.setValue("checkIn",checkIn,{shouldValidate:true});form.setValue("checkOut",checkOut,{shouldValidate:true})}}/>}
    {step===1&&<ExtrasSelector selected={values.extraKeys??[]} extras={defaultPricingConfig.extras} onChange={(extraKeys)=>form.setValue("extraKeys",extraKeys,{shouldValidate:true})}/>} 
    {step===2&&<GuestDetailsForm register={form.register} errors={form.formState.errors}/>} 
    {step===3&&pricing&&<section aria-labelledby="review-title"><h3 id="review-title" className="font-heading text-3xl">Vérifiez avant paiement</h3><p className="mt-4 leading-7 text-white/60">{values.firstName} {values.lastName} · {values.guestCount} personne{values.guestCount>1?"s":""}<br/>{values.email} · {values.phone}</p><nav className="mt-6 flex flex-wrap gap-4 text-sm" aria-label="Modifier la réservation"><button type="button" onClick={()=>goTo(0)} className="underline underline-offset-4">Modifier les dates</button><button type="button" onClick={()=>goTo(1)} className="underline underline-offset-4">Modifier les options</button><button type="button" onClick={()=>goTo(2)} className="underline underline-offset-4">Modifier les coordonnées</button></nav><p className="mt-8 border border-[#C9A86A]/30 bg-[#C9A86A]/10 p-4 text-sm">Les dates et le montant seront revérifiés côté serveur avant l’ouverture du paiement sécurisé Stripe.</p></section>}
    <div aria-live="assertive">{serverError&&<p role="alert" className="mt-6 border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">{serverError}</p>}</div><div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">{step>0?<button type="button" onClick={()=>goTo(step-1)} className="min-h-12 border border-white/20 px-6 text-sm">Retour</button>:<span/>}{step<3?<button type="button" onClick={next} disabled={step===0&&!pricing} className="min-h-12 bg-[#C9A86A] px-6 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40">Continuer</button>:<button type="submit" disabled={loading||!pricing} aria-busy={loading} className="min-h-12 bg-[#C9A86A] px-6 text-sm font-semibold text-black disabled:opacity-50">{loading?"Préparation du paiement…":"Payer et réserver"}</button>}</div></div>{pricing&&<BookingSummary checkIn={values.checkIn} checkOut={values.checkOut} pricing={pricing} compact/>}</div></form>
}
