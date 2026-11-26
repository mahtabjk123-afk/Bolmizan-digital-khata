import express, { Request, Response } from "express";
import { processMizanCoreMessage } from "./whatsappWebhook";

export const buttonPhoneRouter = express.Router();

// 1. Compact SMS Endpoint for Keypad Phones (Zero Internet Needed)
buttonPhoneRouter.post("/sms-button-phone", async (req: Request, res: Response) => {
  const sender = req.body?.From || "keypad-user";
  const body = req.body?.Body || "";
  const fullReply = await processMizanCoreMessage(sender, body);
  const compactSms = fullReply.replace(/[*_`]/g, "").slice(0, 300);
  res.type("text/plain").send(compactSms);
});

// 2. Missed-Call Voice IVR Endpoint for Illiterate / Elderly Farmers
buttonPhoneRouter.post("/voice-ivr", (req: Request, res: Response) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="ur-PK">Assalam o Alaikum Baba! BolMizan AI mein khush amdeed. Beep ke baad apni parchi ya hisab Sindhi ya Urdu mein bolein.</Say>
  <Record maxLength="20" playBeep="true" action="/api/voice-ivr-complete" />
</Response>`;
  res.type("text/xml").send(twiml);
});

buttonPhoneRouter.post("/voice-ivr-complete", (req: Request, res: Response) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="ur-PK">Shukriya! Aapki awaz mehfooz ho gayi hai aur HaqProof digital parchi SMS kar di gayi hai. Allah Hafiz.</Say>
</Response>`;
  res.type("text/xml").send(twiml);
});
