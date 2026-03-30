import { Router, Request, Response } from "express";
import { validatePayload } from "../middleware/validatePayload";
import { publishLead } from "../services/publisher";

const router = Router();

router.post("/webhook/lead", validatePayload, async (req: Request, res: Response) => {
  try {
    await publishLead({
      ...req.body,
      received_at: new Date().toISOString(),
    });

    res.status(202).json({
      status: "queued",
      message: "Lead accepted and queued for processing",
    });
  } catch (err) {
    console.error("[webhook] publish error:", err);
    res.status(500).json({ error: "Failed to queue lead" });
  }
});

export default router;