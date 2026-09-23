import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import crypto from "crypto";
import { Request, Response } from "express";
import { verifySignature } from "../verifySignature";

interface MockRes {
  statusCode: number;
  body: unknown;
  status(code: number): MockRes;
  json(payload: unknown): MockRes;
}

function mockReqRes(rawBody: Buffer, signature?: string) {
  const req = {
    header: (name: string) =>
      name.toLowerCase() === "x-signal-signature" ? signature : undefined,
    rawBody,
  } as unknown as Request & { rawBody: Buffer };

  const res: MockRes = {
    statusCode: 0,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  const next = vi.fn();
  return { req, res: res as unknown as Response & MockRes, next };
}

const ORIGINAL_SECRET = process.env.WEBHOOK_SECRET;

describe("verifySignature", () => {
  beforeEach(() => {
    process.env.WEBHOOK_SECRET = "test-secret-do-not-use-in-prod";
  });

  afterEach(() => {
    process.env.WEBHOOK_SECRET = ORIGINAL_SECRET;
  });

  it("chama next() quando a assinatura é válida", () => {
    const body = Buffer.from(JSON.stringify({ hello: "world" }));
    const sig = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET!).update(body).digest("hex");
    const { req, res, next } = mockReqRes(body, sig);

    verifySignature(req, res, next);

    expect(next).toHaveBeenCalledOnce();
  });

  it("rejeita com 401 quando o header de assinatura está ausente", () => {
    const body = Buffer.from(JSON.stringify({ hello: "world" }));
    const { req, res, next } = mockReqRes(body, undefined);

    verifySignature(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it("rejeita com 401 quando a assinatura está incorreta", () => {
    const body = Buffer.from(JSON.stringify({ hello: "world" }));
    const { req, res, next } = mockReqRes(body, "assinatura-forjada-invalida");

    verifySignature(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it("rejeita com 401 quando a assinatura é de outro payload", () => {
    const body = Buffer.from(JSON.stringify({ hello: "world" }));
    const otherBody = Buffer.from(JSON.stringify({ hello: "outro" }));
    const sig = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET!).update(otherBody).digest("hex");
    const { req, res, next } = mockReqRes(body, sig);

    verifySignature(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it("fail-closed: bloqueia com 500 quando WEBHOOK_SECRET não está configurado, mesmo com assinatura presente", () => {
    delete process.env.WEBHOOK_SECRET;
    const body = Buffer.from(JSON.stringify({ hello: "world" }));
    const { req, res, next } = mockReqRes(body, "qualquer-coisa");

    verifySignature(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
  });
});
