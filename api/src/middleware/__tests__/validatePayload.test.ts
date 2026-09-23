import { describe, it, expect, vi } from "vitest";
import { Request, Response } from "express";
import { validatePayload } from "../validatePayload";

interface MockRes {
  statusCode: number;
  body: unknown;
  status(code: number): MockRes;
  json(payload: unknown): MockRes;
}

function mockReqRes(body: unknown) {
  const req = { body } as unknown as Request;

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

const VALID_PAYLOAD = {
  source: "hubspot",
  contact: { name: "Ana Souza", email: "ana@techcorp.com.br", company: "TechCorp" },
  raw_text: "Precisamos fechar uma ferramenta de qualificação de leads até o fim do mês.",
};

describe("validatePayload", () => {
  it("aceita um payload válido e chama next()", () => {
    const { req, res, next } = mockReqRes(VALID_PAYLOAD);

    validatePayload(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(0);
  });

  it("rejeita com 422 quando falta um campo obrigatório", () => {
    const { source: _source, ...withoutSource } = VALID_PAYLOAD;
    const { req, res, next } = mockReqRes(withoutSource);

    validatePayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(422);
  });

  it("rejeita com 422 quando o e-mail de contato é inválido", () => {
    const { req, res, next } = mockReqRes({
      ...VALID_PAYLOAD,
      contact: { ...VALID_PAYLOAD.contact, email: "não-é-um-email" },
    });

    validatePayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(422);
  });

  it("rejeita com 422 quando source não é um dos valores permitidos", () => {
    const { req, res, next } = mockReqRes({ ...VALID_PAYLOAD, source: "cold-call-manual" });

    validatePayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(422);
  });

  it("rejeita com 422 quando raw_text é muito curto", () => {
    const { req, res, next } = mockReqRes({ ...VALID_PAYLOAD, raw_text: "oi" });

    validatePayload(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(422);
  });
});
