import type { Instrumentation } from "next";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") console.info("absolu_server_started", { version: "1.0.0" });
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const message=error instanceof Error?error.message:String(error);
  const digest=typeof error==="object"&&error!==null&&"digest" in error?String(error.digest):undefined;
  const event={level:"error",event:"request_failed",message:message.slice(0,300),digest,path:request.path.split("?")[0],method:request.method,route:context.routePath,type:context.routeType,at:new Date().toISOString()};
  console.error("request_failed",event);
  const endpoint=process.env.MONITORING_WEBHOOK_URL;
  if(endpoint){try{await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json",...(process.env.MONITORING_WEBHOOK_TOKEN?{authorization:`Bearer ${process.env.MONITORING_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify(event),signal:AbortSignal.timeout(2500)});}catch{console.error("monitoring_delivery_failed");}}
};
